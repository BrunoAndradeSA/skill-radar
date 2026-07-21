import secrets
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.candidates.repositories.candidate_repository import CandidateRepository
from app.domains.invitations.repositories.invitation_repository import InvitationRepository
from app.domains.invitations.schemas.invitation_schema import (
    InvitationCreate,
    InvitationOut,
    InvitationPublicOut,
    InvitationUpdate,
    ValidateInvitationRequest,
)
from app.domains.questions.repositories.question_repository import QuestionRepository
from app.domains.templates.repositories.template_repository import TemplateRepository


class InvitationService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        is_external: bool | None = None,
        email: str | None = None,
    ) -> list[InvitationOut]:
        repo = InvitationRepository(db)
        invitations = await repo.list_all(is_external=is_external, email=email)
        return [InvitationOut.model_validate(i) for i in invitations]

    @staticmethod
    async def get_by_id(db: AsyncSession, invitation_id: int) -> InvitationPublicOut:
        repo = InvitationRepository(db)
        invitation = await repo.get_by_id(invitation_id)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        return InvitationPublicOut.model_validate(invitation)

    @staticmethod
    async def get_by_token(db: AsyncSession, token: str) -> InvitationPublicOut:
        repo = InvitationRepository(db)
        invitation = await repo.get_by_token(token)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        return InvitationPublicOut.model_validate(invitation)

    @staticmethod
    async def create(db: AsyncSession, data: InvitationCreate) -> InvitationOut:
        if data.expires_at <= datetime.now(UTC):
            raise BadRequestError("expiresAt deve ser no futuro")
        repo = InvitationRepository(db)
        token = str(uuid.uuid4())
        access_code = secrets.token_hex(3).upper()
        invitation_data = {
            "template_id": data.template_id,
            "candidate_id": data.candidate_id,
            "candidate_name": data.candidate_name,
            "candidate_email": data.candidate_email,
            "cargo": data.cargo,
            "squad": data.squad,
            "setor": data.setor,
            "nivel": data.nivel,
            "token": token,
            "access_code": access_code,
            "expires_at": data.expires_at,
            "used": False,
            "is_external": data.is_external,
        }
        if data.candidate_id:
            candidate_repo = CandidateRepository(db)
            candidate = await candidate_repo.get_by_id(data.candidate_id)
            if candidate:
                invitation_data["candidate_name"] = candidate.name or data.candidate_name
                invitation_data["candidate_email"] = candidate.email or data.candidate_email
                invitation_data["cargo"] = invitation_data.get("cargo") or candidate.cargo
                invitation_data["squad"] = invitation_data.get("squad") or candidate.squad
                invitation_data["setor"] = invitation_data.get("setor") or candidate.setor
                invitation_data["nivel"] = invitation_data.get("nivel") or candidate.nivel

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

        invitation = await repo.create(invitation_data)
        return InvitationOut.model_validate(invitation)

    @staticmethod
    async def update(db: AsyncSession, invitation_id: int, data: InvitationUpdate) -> InvitationOut:
        repo = InvitationRepository(db)
        invitation = await repo.get_by_id(invitation_id)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        update_data = {k: v for k, v in data.model_dump(exclude_none=True).items() if v is not None}
        if "expires_at" in update_data and update_data["expires_at"] <= datetime.now(UTC):
            raise BadRequestError("expiresAt deve ser no futuro")
        invitation = await repo.update(invitation, update_data)
        return InvitationOut.model_validate(invitation)

    @staticmethod
    async def validate(db: AsyncSession, data: ValidateInvitationRequest) -> InvitationOut:
        repo = InvitationRepository(db)
        invitation = await repo.get_by_token(data.token)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        if invitation.access_code != data.access_code:
            raise BadRequestError("Código de acesso inválido")
        if invitation.used:
            raise BadRequestError("Convite já utilizado")
        if invitation.expires_at <= datetime.now(UTC):
            raise BadRequestError("Convite expirado")
        return InvitationOut.model_validate(invitation)

    @staticmethod
    async def delete(db: AsyncSession, invitation_id: int) -> None:
        repo = InvitationRepository(db)
        invitation = await repo.get_by_id(invitation_id)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        await repo.delete(invitation)
