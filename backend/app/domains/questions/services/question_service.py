from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.questions.repositories.question_repository import (
    AlternativeRepository,
    QuestionRepository,
)
from app.domains.questions.schemas.question_schema import (
    AlternativeOut,
    QuestionCreate,
    QuestionOut,
    QuestionUpdate,
)

if TYPE_CHECKING:
    from app.domains.questions.models.question_model import Question


class QuestionService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        theme_id: int | None = None,
        seniority: str | None = None,
        type: str | None = None,
    ) -> list[QuestionOut]:
        repo = QuestionRepository(db)
        questions = await repo.list_all(theme_id=theme_id, seniority=seniority, type=type)
        return [_question_to_out(q) for q in questions]

    @staticmethod
    async def get_by_id(db: AsyncSession, question_id: int) -> QuestionOut:
        repo = QuestionRepository(db)
        question = await repo.get_by_id(question_id)
        if question is None:
            raise NotFoundError("Questão não encontrada")
        return _question_to_out(question)

    @staticmethod
    async def create(db: AsyncSession, data: QuestionCreate) -> QuestionOut:
        if len([a for a in data.alternatives if a.is_correct]) != 1:
            raise BadRequestError("Exatamente uma alternativa deve ser marcada como correta")
        repo = QuestionRepository(db)
        alt_repo = AlternativeRepository(db)

        question_data = data.model_dump(exclude={"alternatives", "competency_ids"})
        question = await repo.create(question_data)

        for alt_data in data.alternatives:
            await alt_repo.create({"question_id": question.id, **alt_data.model_dump()})

        await repo.sync_competencies(question, data.competency_ids or [])

        await db.refresh(question)
        return _question_to_out(question)

    @staticmethod
    async def update(db: AsyncSession, question_id: int, data: QuestionUpdate) -> QuestionOut:
        if len([a for a in data.alternatives if a.is_correct]) != 1:
            raise BadRequestError("Exatamente uma alternativa deve ser marcada como correta")
        repo = QuestionRepository(db)
        alt_repo = AlternativeRepository(db)

        question = await repo.get_by_id(question_id)
        if question is None:
            raise NotFoundError("Questão não encontrada")

        update_data = data.model_dump(exclude={"alternatives", "competency_ids"})
        question = await repo.update(question, update_data)

        await alt_repo.delete_by_question(question_id)
        for alt_data in data.alternatives:
            await alt_repo.create({"question_id": question.id, **alt_data.model_dump()})

        if data.competency_ids is not None:
            await repo.sync_competencies(question, data.competency_ids)

        await db.refresh(question)
        return _question_to_out(question)

    @staticmethod
    async def delete(db: AsyncSession, question_id: int) -> None:
        repo = QuestionRepository(db)
        question = await repo.get_by_id(question_id)
        if question is None:
            raise NotFoundError("Questão não encontrada")
        await repo.delete(question)


def _question_to_out(question: Question) -> QuestionOut:
    return QuestionOut(
        id=question.id,
        theme_id=question.theme_id,
        competency_ids=[c.id for c in question.competencies],
        type=question.type,
        seniority=question.seniority,
        text=question.text,
        explanation=question.explanation,
        alternatives=[
            AlternativeOut(id=a.id, text=a.text, is_correct=a.is_correct)
            for a in sorted(question.alternatives, key=lambda x: x.order)
        ],
        created_at=question.created_at,
        updated_at=question.updated_at,
    )
