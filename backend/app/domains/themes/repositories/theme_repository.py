from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.themes.models.theme_model import Theme


class ThemeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[Theme]:
        stmt = select(Theme).order_by(Theme.name)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, theme_id: int) -> Theme | None:
        stmt = select(Theme).where(Theme.id == theme_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Theme | None:
        stmt = select(Theme).where(Theme.name == name)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Theme:
        theme = Theme(**data)
        self._session.add(theme)
        await self._session.commit()
        await self._session.refresh(theme)
        return theme

    async def update(self, theme: Theme, data: dict) -> Theme:
        for key, value in data.items():
            setattr(theme, key, value)
        await self._session.commit()
        return theme

    async def delete(self, theme: Theme) -> None:
        await self._session.delete(theme)
        await self._session.commit()
