import random
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError, UnauthorizedError
from app.core.settings import settings
from app.domains.assessments.repositories.assessment_repository import AssessmentRepository
from app.domains.assessments.schemas.assessment_schema import (
    AssessmentAnswerOut,
    AssessmentOut,
    AssessmentPatch,
    AssessmentQuestionOut,
    AssessmentSecurity,
    AssessmentStart,
    AssessmentTiming,
)
from app.domains.assessments.schemas.stats_schema import (
    GeneralStats,
    GroupStats,
    UserStats,
)
from app.domains.invitations.repositories.invitation_repository import InvitationRepository
from app.domains.questions.repositories.question_repository import QuestionRepository
from app.domains.questions.schemas.question_schema import AlternativeOut
from app.domains.templates.repositories.template_repository import TemplateRepository


class AssessmentService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        is_external: bool | None = None,
        invitation_ids: list[int] | None = None,
    ) -> list[AssessmentOut]:
        repo = AssessmentRepository(db)
        assessments = await repo.list_all(is_external=is_external, invitation_ids=invitation_ids)
        return [_assessment_to_out(a) for a in assessments]

    @staticmethod
    async def get_by_id(db: AsyncSession, assessment_id: int) -> AssessmentOut:
        repo = AssessmentRepository(db)
        assessment = await repo.get_by_id(assessment_id)
        if assessment is None:
            raise NotFoundError("Avaliação não encontrada")
        return _assessment_to_out(assessment)

    @staticmethod
    async def get_by_invitation(db: AsyncSession, invitation_id: int) -> AssessmentOut:
        repo = AssessmentRepository(db)
        assessment = await repo.get_by_invitation(invitation_id)
        if assessment is None:
            raise NotFoundError("Nenhuma avaliação encontrada para este convite")
        return _assessment_to_out(assessment)

    @staticmethod
    async def start(db: AsyncSession, data: AssessmentStart) -> AssessmentOut:
        inv_repo = InvitationRepository(db)
        invitation = await inv_repo.get_by_id(data.invitation_id)
        if invitation is None:
            raise NotFoundError("Convite não encontrado")
        if invitation.used:
            raise BadRequestError("Convite já utilizado")
        if invitation.expires_at <= datetime.now(UTC):
            raise BadRequestError("Convite expirado")

        template_repo = TemplateRepository(db)
        template = await template_repo.get_by_id(data.template_id)
        if template is None:
            raise NotFoundError("Template não encontrado")

        question_repo = QuestionRepository(db)
        all_selected_questions = []

        for tt in template.themes:
            questions = await question_repo.find_for_assessment(
                theme_id=tt.theme_id,
                seniority=template.seniority,
                competency_ids=[c.id for c in tt.competencies] if tt.competencies else None,
            )
            random.shuffle(questions)
            selected = questions[: tt.question_count]
            all_selected_questions.extend(selected)

        random.shuffle(all_selected_questions)

        assessment_repo = AssessmentRepository(db)
        assessment = await assessment_repo.create(
            {
                "invitation_id": data.invitation_id,
                "template_id": data.template_id,
                "status": "IN_PROGRESS",
                "start_time": datetime.now(UTC),
                "duration_seconds": template.duration_minutes * 60,
                "focus_lost_count": 0,
                "is_terminated": False,
            }
        )

        for idx, question in enumerate(all_selected_questions):
            await assessment_repo.create_question(
                {
                    "assessment_id": assessment.id,
                    "question_id": question.id,
                    "order": idx,
                }
            )

        await inv_repo.update(invitation, {"used": True})

        await db.refresh(assessment)
        return _assessment_to_out(assessment)

    @staticmethod
    async def patch(
        db: AsyncSession, assessment_id: int, data: AssessmentPatch, invitation_token: str
    ) -> AssessmentOut:
        assessment_repo = AssessmentRepository(db)
        assessment = await assessment_repo.get_by_id(assessment_id)
        if assessment is None:
            raise NotFoundError("Avaliação não encontrada")

        inv_repo = InvitationRepository(db)
        invitation = await inv_repo.get_by_id(assessment.invitation_id)
        if invitation is None or invitation.token != invitation_token:
            raise UnauthorizedError("Token do convite inválido")

        if assessment.status != "IN_PROGRESS":
            raise BadRequestError("Avaliação já está finalizada ou encerrada")

        if data.security_metrics is not None:
            assessment.focus_lost_count = data.security_metrics.focus_lost_count
            if settings.enable_focus_monitoring:  # noqa: SIM102
                if data.security_metrics.is_terminated or (
                    data.security_metrics.focus_lost_count >= 2 and settings.enable_auto_termination
                ):
                    assessment.status = "TERMINATED"
                    assessment.is_terminated = True

        if data.answers:
            for ans in data.answers:
                existing_answer = await assessment_repo.get_answer(assessment_id, ans.question_id)
                if existing_answer:
                    existing_answer.selected_alternative_id = ans.selected_alternative_id
                    existing_answer.time_spent_seconds = ans.time_spent_seconds
                else:
                    await assessment_repo.create_answer(
                        {
                            "assessment": assessment,
                            "question_id": ans.question_id,
                            "selected_alternative_id": ans.selected_alternative_id,
                            "time_spent_seconds": ans.time_spent_seconds,
                        }
                    )

        if data.status == "FINISHED":
            elapsed = (datetime.now(UTC) - assessment.start_time).total_seconds()
            template_repo = TemplateRepository(db)
            template = await template_repo.get_by_id(assessment.template_id)
            if template and elapsed > template.duration_minutes * 60:
                raise BadRequestError("Tempo limite excedido")

            answered_ids = [
                a.selected_alternative_id
                for a in assessment.answers
                if a.selected_alternative_id is not None
            ]
            correct_map = {}
            if answered_ids:
                correct_map = await assessment_repo.get_alternatives_correctness(answered_ids)

            total = 0
            correct = 0
            for answer in assessment.answers:
                if answer.selected_alternative_id is not None:
                    is_correct = correct_map.get(answer.selected_alternative_id)
                    if is_correct is not None:
                        answer.is_correct = is_correct
                        total += 1
                        if is_correct:
                            correct += 1

            assessment.score = correct
            assessment.percentage = round(correct / total * 100) if total > 0 else 0
            assessment.status = "FINISHED"

        if data.status == "TERMINATED":
            assessment.status = "TERMINATED"
            assessment.is_terminated = True

        if assessment.status != "IN_PROGRESS":
            assessment.end_time = datetime.now(UTC)
            assessment.duration_seconds = int(
                (datetime.now(UTC) - assessment.start_time).total_seconds()
            )

        await assessment_repo.update(assessment, {})
        return _assessment_to_out(assessment)

    @staticmethod
    async def get_general_stats(db: AsyncSession) -> GeneralStats:
        repo = AssessmentRepository(db)
        return await repo.get_general_stats()

    @staticmethod
    async def get_group_stats(db: AsyncSession, group_by: str, group_value: str) -> GroupStats:
        if group_by not in ("cargo", "nivel", "squad", "setor"):
            raise BadRequestError("Agrupamento inválido. Deve ser: cargo, nivel, squad, setor")
        repo = AssessmentRepository(db)
        themes = await repo.get_theme_gaps_by_group(group_by, group_value)
        return GroupStats(group_by=group_by, group_value=group_value, themes=themes)

    @staticmethod
    async def get_user_stats(db: AsyncSession, user_id: int) -> UserStats:
        repo = AssessmentRepository(db)
        total_assessments, avg, themes = await repo.get_user_stats(user_id)
        return UserStats(
            user_id=user_id,
            total_assessments=total_assessments,
            average_percentage=avg,
            themes=themes,
        )


def _assessment_to_out(assessment) -> AssessmentOut:
    show_is_correct = assessment.status == "FINISHED"
    aq_out = []
    for aq in assessment.questions:
        q = aq.question
        alternatives = [
            AlternativeOut(
                id=a.id,
                text=a.text,
                is_correct=a.is_correct if show_is_correct else None,
            )
            for a in sorted(q.alternatives, key=lambda x: x.order)
        ]
        q_out = AssessmentQuestionOut(
            id=aq.id,
            question_id=q.id,
            theme_id=q.theme_id,
            theme_name=q.theme.name,
            order=aq.order,
            text=q.text,
            type=q.type,
            seniority=q.seniority,
            competency_ids=[c.id for c in q.competencies],
            explanation=q.explanation,
            alternatives=alternatives,
        )
        aq_out.append(q_out)
    aq_out.sort(key=lambda x: x.order)

    answers = [
        AssessmentAnswerOut(
            question_id=a.question_id,
            selected_alternative_id=a.selected_alternative_id,
            is_correct=a.is_correct if show_is_correct else None,
            time_spent_seconds=a.time_spent_seconds,
        )
        for a in assessment.answers
    ]

    timing = AssessmentTiming(
        start_time=assessment.start_time,
        end_time=assessment.end_time,
        duration_seconds=assessment.duration_seconds,
    )
    security = AssessmentSecurity(
        focus_lost_count=assessment.focus_lost_count,
        is_terminated=assessment.is_terminated,
    )
    return AssessmentOut(
        id=assessment.id,
        invitation_id=assessment.invitation_id,
        template_id=assessment.template_id,
        status=assessment.status,
        questions=aq_out,
        answers=answers,
        timing=timing,
        security_metrics=security,
        score=assessment.score,
        percentage=assessment.percentage,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
    )
