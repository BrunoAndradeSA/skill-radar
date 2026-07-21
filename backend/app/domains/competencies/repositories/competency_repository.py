from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.competencies.models.competency_model import Competency


class CompetencyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self, theme_id: int | None = None) -> list[Competency]:
        stmt = select(Competency)
        if theme_id is not None:
            stmt = stmt.where(Competency.theme_id == theme_id)
        stmt = stmt.order_by(Competency.name)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, competency_id: int) -> Competency | None:
        stmt = select(Competency).where(Competency.id == competency_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Competency:
        competency = Competency(**data)
        self._session.add(competency)
        await self._session.commit()
        await self._session.refresh(competency)
        return competency

    async def update(self, competency: Competency, data: dict) -> Competency:
        for key, value in data.items():
            setattr(competency, key, value)
        await self._session.commit()
        return competency

    async def delete(self, competency: Competency) -> None:
        await self._session.delete(competency)
        await self._session.commit()
