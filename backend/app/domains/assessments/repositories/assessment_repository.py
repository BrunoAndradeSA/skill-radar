from sqlalchemy import Integer, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.assessments.models.assessment_answer_model import AssessmentAnswer
from app.domains.assessments.models.assessment_model import Assessment
from app.domains.assessments.models.assessment_question_model import AssessmentQuestion
from app.domains.assessments.schemas.stats_schema import GeneralStats, ThemeGap
from app.domains.invitations.models.exam_invitation_model import ExamInvitation
from app.domains.questions.models.alternative_model import Alternative
from app.domains.questions.models.question_model import Question
from app.domains.themes.models.theme_model import Theme


class AssessmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(
        self,
        is_external: bool | None = None,
        invitation_ids: list[int] | None = None,
    ) -> list[Assessment]:
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.questions)
                .selectinload(AssessmentQuestion.question)
                .selectinload(Question.theme),
                selectinload(Assessment.answers),
            )
            .order_by(Assessment.created_at.desc())
        )
        if is_external is not None:
            stmt = stmt.join(ExamInvitation, Assessment.invitation_id == ExamInvitation.id).where(
                ExamInvitation.is_external == is_external
            )
        if invitation_ids is not None:
            stmt = stmt.where(Assessment.invitation_id.in_(invitation_ids))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, assessment_id: int) -> Assessment | None:
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.questions)
                .selectinload(AssessmentQuestion.question)
                .selectinload(Question.theme),
                selectinload(Assessment.answers),
            )
            .where(Assessment.id == assessment_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_invitation(self, invitation_id: int) -> Assessment | None:
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.questions)
                .selectinload(AssessmentQuestion.question)
                .selectinload(Question.theme),
                selectinload(Assessment.answers),
            )
            .where(Assessment.invitation_id == invitation_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Assessment:
        assessment = Assessment(**data)
        self._session.add(assessment)
        await self._session.commit()
        await self._session.refresh(assessment)
        return assessment

    async def update(self, assessment: Assessment, data: dict) -> Assessment:
        for key, value in data.items():
            setattr(assessment, key, value)
        await self._session.commit()
        return assessment

    async def create_question(self, data: dict) -> AssessmentQuestion:
        aq = AssessmentQuestion(**data)
        self._session.add(aq)
        await self._session.flush()
        return aq

    async def create_answer(self, data: dict) -> AssessmentAnswer:
        aa = AssessmentAnswer(**data)
        self._session.add(aa)
        await self._session.flush()
        return aa

    async def get_answer(self, assessment_id: int, question_id: int) -> AssessmentAnswer | None:
        stmt = select(AssessmentAnswer).where(
            AssessmentAnswer.assessment_id == assessment_id,
            AssessmentAnswer.question_id == question_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_alternatives_correctness(self, alternative_ids: list[int]) -> dict[int, bool]:
        stmt = select(Alternative.id, Alternative.is_correct).where(
            Alternative.id.in_(alternative_ids)
        )
        result = await self._session.execute(stmt)
        return {row[0]: row[1] for row in result.all()}

    async def get_general_stats(self) -> GeneralStats:
        base_join = Assessment.__table__.join(
            ExamInvitation, Assessment.invitation_id == ExamInvitation.id
        )

        total = await self._session.execute(
            select(func.count(Assessment.id))
            .select_from(base_join)
            .where(ExamInvitation.is_external.is_(False))
        )
        total_assessments = total.scalar() or 0

        avg = await self._session.execute(
            select(func.avg(Assessment.percentage))
            .select_from(base_join)
            .where(ExamInvitation.is_external.is_(False))
        )
        avg_percentage = avg.scalar() or 0.0

        total_q = await self._session.execute(
            select(func.count(AssessmentAnswer.id))
            .select_from(
                base_join.join(AssessmentAnswer, Assessment.id == AssessmentAnswer.assessment_id)
            )
            .where(
                ExamInvitation.is_external.is_(False),
                AssessmentAnswer.is_correct.isnot(None),
            )
        )
        total_questions = total_q.scalar() or 0

        return GeneralStats(
            total_assessments=total_assessments,
            average_percentage=round(float(avg_percentage), 2),
            total_questions_evaluated=total_questions,
        )

    async def get_theme_gaps_by_group(self, group_by: str, group_value: str) -> list[ThemeGap]:
        join_clause = (
            Assessment.__table__.join(ExamInvitation, Assessment.invitation_id == ExamInvitation.id)
            .join(AssessmentAnswer, Assessment.id == AssessmentAnswer.assessment_id)
            .join(Question, AssessmentAnswer.question_id == Question.id)
            .join(Theme, Question.theme_id == Theme.id)
        )

        group_column = getattr(ExamInvitation, group_by, None)
        if group_column is None:
            return []

        stmt = (
            select(
                Theme.id,
                Theme.name,
                func.count(AssessmentAnswer.id),
                func.sum(
                    func.cast(AssessmentAnswer.is_correct, Integer),
                ),
            )
            .select_from(join_clause)
            .where(group_column == group_value)
            .where(AssessmentAnswer.is_correct.isnot(None))
            .where(ExamInvitation.is_external.is_(False))
            .group_by(Theme.id, Theme.name)
        )
        result = await self._session.execute(stmt)
        themes = []
        for row in result.all():
            total = row[2] or 0
            correct = row[3] or 0
            wrong = total - correct
            themes.append(
                ThemeGap(
                    theme_id=row[0],
                    theme_name=row[1],
                    total_questions=total,
                    correct=correct,
                    wrong=wrong,
                    percentage=round((correct / total * 100) if total > 0 else 0, 2),
                ),
            )
        return themes

    async def get_user_stats(self, user_id: int) -> tuple[int, float, list[ThemeGap]]:
        join_clause = (
            Assessment.__table__.join(ExamInvitation, Assessment.invitation_id == ExamInvitation.id)
            .join(AssessmentAnswer, Assessment.id == AssessmentAnswer.assessment_id)
            .join(Question, AssessmentAnswer.question_id == Question.id)
            .join(Theme, Question.theme_id == Theme.id)
        )

        stmt = (
            select(
                Theme.id,
                Theme.name,
                func.count(AssessmentAnswer.id),
                func.sum(
                    func.cast(AssessmentAnswer.is_correct, Integer),
                ),
            )
            .select_from(join_clause)
            .where(ExamInvitation.user_id == user_id)
            .where(AssessmentAnswer.is_correct.isnot(None))
            .where(ExamInvitation.is_external.is_(False))
            .group_by(Theme.id, Theme.name)
        )
        result = await self._session.execute(stmt)

        total_questions = 0
        total_correct = 0
        themes = []
        for row in result.all():
            total = row[2] or 0
            correct = row[3] or 0
            total_questions += total
            total_correct += correct
            wrong = total - correct
            themes.append(
                ThemeGap(
                    theme_id=row[0],
                    theme_name=row[1],
                    total_questions=total,
                    correct=correct,
                    wrong=wrong,
                    percentage=round((correct / total * 100) if total > 0 else 0, 2),
                ),
            )

        avg = round((total_correct / total_questions * 100) if total_questions > 0 else 0, 2)

        assessments_stmt = (
            select(func.count(Assessment.id))
            .select_from(
                Assessment.__table__.join(
                    ExamInvitation, Assessment.invitation_id == ExamInvitation.id
                ),
            )
            .where(ExamInvitation.user_id == user_id)
            .where(ExamInvitation.is_external.is_(False))
        )
        count_result = await self._session.execute(assessments_stmt)
        total_assessments = count_result.scalar() or 0

        return total_assessments, avg, themes
