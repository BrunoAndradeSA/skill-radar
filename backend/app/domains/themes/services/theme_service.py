from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.themes.repositories.theme_repository import ThemeRepository
from app.domains.themes.schemas.theme_schema import ThemeCreate, ThemeOut, ThemeUpdate


class ThemeService:
    @staticmethod
    async def get_all(db: AsyncSession) -> list[ThemeOut]:
        repo = ThemeRepository(db)
        themes = await repo.list_all()
        return [ThemeOut.model_validate(t) for t in themes]

    @staticmethod
    async def get_by_id(db: AsyncSession, theme_id: int) -> ThemeOut:
        repo = ThemeRepository(db)
        theme = await repo.get_by_id(theme_id)
        if theme is None:
            raise NotFoundError("Tema não encontrado")
        return ThemeOut.model_validate(theme)

    @staticmethod
    async def create(db: AsyncSession, data: ThemeCreate) -> ThemeOut:
        repo = ThemeRepository(db)
        existing = await repo.get_by_name(data.name)
        if existing:
            raise BadRequestError("Nome do tema já existe")
        theme = await repo.create(data.model_dump())
        return ThemeOut.model_validate(theme)

    @staticmethod
    async def update(db: AsyncSession, theme_id: int, data: ThemeUpdate) -> ThemeOut:
        repo = ThemeRepository(db)
        theme = await repo.get_by_id(theme_id)
        if theme is None:
            raise NotFoundError("Tema não encontrado")
        existing = await repo.get_by_name(data.name)
        if existing and existing.id != theme_id:
            raise BadRequestError("Nome do tema já existe")
        theme = await repo.update(theme, data.model_dump())
        return ThemeOut.model_validate(theme)

    @staticmethod
    async def delete(db: AsyncSession, theme_id: int) -> None:
        repo = ThemeRepository(db)
        theme = await repo.get_by_id(theme_id)
        if theme is None:
            raise NotFoundError("Tema não encontrado")
        await repo.delete(theme)
