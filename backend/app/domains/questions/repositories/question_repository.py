from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.competencies.models.competency_model import Competency
from app.domains.questions.models.alternative_model import Alternative
from app.domains.questions.models.question_model import Question


class QuestionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(
        self,
        theme_id: int | None = None,
        seniority: str | None = None,
        type: str | None = None,
    ) -> list[Question]:
        stmt = select(Question).options(
            selectinload(Question.alternatives),
            selectinload(Question.competencies),
        )
        if theme_id is not None:
            stmt = stmt.where(Question.theme_id == theme_id)
        if seniority is not None:
            stmt = stmt.where(Question.seniority == seniority)
        if type is not None:
            stmt = stmt.where(Question.type == type)
        stmt = stmt.order_by(Question.id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, question_id: int) -> Question | None:
        stmt = (
            select(Question)
            .options(
                selectinload(Question.alternatives),
                selectinload(Question.competencies),
            )
            .where(Question.id == question_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Question:
        question = Question(**data)
        self._session.add(question)
        await self._session.commit()
        await self._session.refresh(question)
        return question

    async def update(self, question: Question, data: dict) -> Question:
        for key, value in data.items():
            setattr(question, key, value)
        await self._session.commit()
        return question

    async def delete(self, question: Question) -> None:
        await self._session.delete(question)
        await self._session.commit()

    async def sync_competencies(self, question: Question, competency_ids: list[int]) -> None:
        if competency_ids:
            stmt = select(Competency).where(Competency.id.in_(competency_ids))
            result = await self._session.execute(stmt)
            question.competencies = list(result.scalars().all())
        else:
            question.competencies = []
        await self._session.commit()

    async def find_for_assessment(
        self,
        theme_id: int,
        seniority: str,
        competency_ids: list[int] | None = None,
        limit: int = 10,
    ) -> list[Question]:
        stmt = (
            select(Question)
            .options(
                selectinload(Question.alternatives),
                selectinload(Question.competencies),
            )
            .where(Question.theme_id == theme_id)
            .where(Question.seniority == seniority)
        )
        if competency_ids:
            stmt = stmt.where(Question.competencies.any(Competency.id.in_(competency_ids)))
        stmt = stmt.order_by(Question.id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def count_by_theme_and_seniority(
        self,
        theme_id: int,
        seniority: str,
        competency_ids: list[int] | None = None,
    ) -> int:
        stmt = select(func.count(Question.id)).where(
            Question.theme_id == theme_id,
            Question.seniority == seniority,
        )
        if competency_ids:
            stmt = stmt.where(Question.competencies.any(Competency.id.in_(competency_ids)))
        result = await self._session.execute(stmt)
        return result.scalar_one()


class AlternativeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, data: dict) -> Alternative:
        alt = Alternative(**data)
        self._session.add(alt)
        await self._session.flush()
        return alt

    async def delete_by_question(self, question_id: int) -> None:
        stmt = select(Alternative).where(Alternative.question_id == question_id)
        result = await self._session.execute(stmt)
        for alt in result.scalars().all():
            await self._session.delete(alt)
        await self._session.flush()
