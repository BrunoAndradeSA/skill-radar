from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.competencies.repositories.competency_repository import CompetencyRepository
from app.domains.competencies.schemas.competency_schema import (
    CompetencyCreate,
    CompetencyOut,
    CompetencyUpdate,
)
from app.domains.themes.repositories.theme_repository import ThemeRepository


class CompetencyService:
    @staticmethod
    async def get_all(db: AsyncSession, theme_id: int | None = None) -> list[CompetencyOut]:
        repo = CompetencyRepository(db)
        competencies = await repo.list_all(theme_id=theme_id)
        return [CompetencyOut.model_validate(c) for c in competencies]

    @staticmethod
    async def get_by_id(db: AsyncSession, competency_id: int) -> CompetencyOut:
        repo = CompetencyRepository(db)
        competency = await repo.get_by_id(competency_id)
        if competency is None:
            raise NotFoundError("Competência não encontrada")
        return CompetencyOut.model_validate(competency)

    @staticmethod
    async def create(db: AsyncSession, data: CompetencyCreate) -> CompetencyOut:
        theme_repo = ThemeRepository(db)
        theme = await theme_repo.get_by_id(data.theme_id)
        if theme is None:
            raise BadRequestError("Tema não encontrado")
        repo = CompetencyRepository(db)
        competency = await repo.create(data.model_dump())
        return CompetencyOut.model_validate(competency)

    @staticmethod
    async def update(db: AsyncSession, competency_id: int, data: CompetencyUpdate) -> CompetencyOut:
        theme_repo = ThemeRepository(db)
        theme = await theme_repo.get_by_id(data.theme_id)
        if theme is None:
            raise BadRequestError("Tema não encontrado")
        repo = CompetencyRepository(db)
        competency = await repo.get_by_id(competency_id)
        if competency is None:
            raise NotFoundError("Competência não encontrada")
        competency = await repo.update(competency, data.model_dump())
        return CompetencyOut.model_validate(competency)

    @staticmethod
    async def delete(db: AsyncSession, competency_id: int) -> None:
        repo = CompetencyRepository(db)
        competency = await repo.get_by_id(competency_id)
        if competency is None:
            raise NotFoundError("Competência não encontrada")
        await repo.delete(competency)
