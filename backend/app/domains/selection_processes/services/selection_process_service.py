import secrets
import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.assessments.models.assessment_model import Assessment
from app.domains.invitations.repositories.invitation_repository import InvitationRepository
from app.domains.questions.repositories.question_repository import QuestionRepository
from app.domains.selection_processes.models.selection_process_model import (
    SelectionProcess,
)
from app.domains.selection_processes.repositories.selection_process_repository import (
    SelectionProcessRepository,
)
from app.domains.selection_processes.schemas.selection_process_schema import (
    AddCandidatesRequest,
    CandidateInput,
    RankingItemOut,
    SelectionProcessCreate,
    SelectionProcessOut,
)
from app.domains.templates.repositories.template_repository import TemplateRepository


class SelectionProcessService:
    @staticmethod
    async def create(db: AsyncSession, data: SelectionProcessCreate) -> SelectionProcessOut:
        if data.end_date <= data.start_date:
            raise BadRequestError("end_date deve ser posterior a start_date")

        template_repo = TemplateRepository(db)
        template = await template_repo.get_by_id(data.template_id)
        if template is None:
            raise NotFoundError("Template não encontrado")

        question_repo = QuestionRepository(db)
        for tt in template.themes or []:
            competency_ids = [c.id for c in tt.competencies] if tt.competencies else None
            count = await question_repo.count_by_theme_and_seniority(
                tt.theme_id, template.seniority, competency_ids
            )
            if count == 0:
                raise BadRequestError(
                    f"O template '{template.name}' requer o tema ID {tt.theme_id} "
                    f"com senioridade '{template.seniority}', mas nenhuma questão atende"
                )

        repo = SelectionProcessRepository(db)
        process_data = {
            "name": data.name,
            "start_date": data.start_date,
            "end_date": data.end_date,
            "cargo": data.cargo,
            "nivel": data.nivel,
            "setor": data.setor,
            "squad": data.squad,
            "template_id": data.template_id,
        }
        process = await repo.create(process_data)

        invitation_repo = InvitationRepository(db)
        for candidate in data.candidates:
            await SelectionProcessService._create_invitation(
                db, invitation_repo, process, candidate
            )

        process = await repo.get_by_id(process.id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")
        return await SelectionProcessService._process_to_out(db, process)

    @staticmethod
    async def add_candidates(
        db: AsyncSession, process_id: int, data: AddCandidatesRequest
    ) -> SelectionProcessOut:
        repo = SelectionProcessRepository(db)
        process = await repo.get_by_id(process_id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")

        now = datetime.now(UTC)
        if now < process.start_date:
            raise BadRequestError("Processo seletivo ainda não iniciou")
        if now > process.end_date:
            raise BadRequestError("Processo seletivo já encerrado")

        invitation_repo = InvitationRepository(db)
        for candidate in data.candidates:
            await SelectionProcessService._create_invitation(
                db, invitation_repo, process, candidate
            )

        process = await repo.get_by_id(process.id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")
        return await SelectionProcessService._process_to_out(db, process)

    @staticmethod
    async def get_all(db: AsyncSession) -> list[SelectionProcessOut]:
        repo = SelectionProcessRepository(db)
        processes = await repo.list_all()
        return [await SelectionProcessService._process_to_out(db, p) for p in processes]

    @staticmethod
    async def get_by_id(db: AsyncSession, process_id: int) -> SelectionProcessOut:
        repo = SelectionProcessRepository(db)
        process = await repo.get_by_id(process_id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")
        return await SelectionProcessService._process_to_out(db, process)

    @staticmethod
    async def delete(db: AsyncSession, process_id: int) -> None:
        repo = SelectionProcessRepository(db)
        process = await repo.get_by_id(process_id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")
        await repo.delete(process)

    @staticmethod
    async def get_rankings(db: AsyncSession, process_id: int) -> list[RankingItemOut]:
        repo = SelectionProcessRepository(db)
        process = await repo.get_by_id(process_id)
        if process is None:
            raise NotFoundError("Processo seletivo não encontrado")

        invitation_ids = [inv.id for inv in process.invitations]
        if not invitation_ids:
            return []

        stmt = (
            select(Assessment)
            .options(selectinload(Assessment.answers))
            .where(Assessment.invitation_id.in_(invitation_ids))
            .order_by(Assessment.score.desc().nullslast())
        )
        result = await db.execute(stmt)
        assessments = list(result.scalars().all())

        assessment_map = {a.invitation_id: a for a in assessments}

        rankings = []
        for inv in process.invitations:
            assessment = assessment_map.get(inv.id)
            item = RankingItemOut(
                invitation_id=inv.id,
                candidate_name=inv.candidate_name,
                candidate_email=inv.candidate_email,
            )
            if assessment is not None:
                item.assessment_id = assessment.id
                item.score = assessment.score
                item.percentage = assessment.percentage
                item.status = assessment.status
                item.finished = assessment.status in ("FINISHED", "TERMINATED")
            rankings.append(item)

        def sort_key(r: RankingItemOut) -> tuple:
            if r.finished:
                return (0, -(r.score or 0))
            if r.status == "IN_PROGRESS":
                return (1, 0)
            return (2, 0)

        rankings.sort(key=sort_key)
        return rankings

    @staticmethod
    async def _create_invitation(
        db: AsyncSession,
        invitation_repo: InvitationRepository,
        process: SelectionProcess,
        candidate: CandidateInput,
    ) -> None:
        token = str(uuid.uuid4())
        access_code = secrets.token_hex(3).upper()

        invitation_data = {
            "template_id": process.template_id,
            "candidate_id": None,
            "candidate_name": candidate.name,
            "candidate_email": candidate.email,
            "cargo": process.cargo,
            "squad": process.squad,
            "setor": process.setor,
            "nivel": process.nivel,
            "token": token,
            "access_code": access_code,
            "expires_at": process.end_date,
            "used": False,
            "is_external": True,
            "selection_process_id": process.id,
        }
        await invitation_repo.create(invitation_data)

    @staticmethod
    async def _process_to_out(db: AsyncSession, process: SelectionProcess) -> SelectionProcessOut:
        invitations = process.invitations or []
        total_invitations = len(invitations)

        total_finished = 0
        if invitations:
            inv_ids = [inv.id for inv in invitations]
            count_result = await db.execute(
                select(func.count())
                .select_from(Assessment)
                .where(
                    Assessment.invitation_id.in_(inv_ids),
                    Assessment.status == "FINISHED",
                )
            )
            total_finished = count_result.scalar() or 0

        return SelectionProcessOut(
            id=process.id,
            name=process.name,
            start_date=process.start_date,
            end_date=process.end_date,
            cargo=process.cargo,
            nivel=process.nivel,
            setor=process.setor,
            squad=process.squad,
            template_id=process.template_id,
            total_invitations=total_invitations,
            total_finished=total_finished,
            created_at=process.created_at,
            updated_at=process.updated_at,
        )
