from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.selection_processes.models.selection_process_model import (
    SelectionProcess,
)


class SelectionProcessRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[SelectionProcess]:
        stmt = (
            select(SelectionProcess)
            .options(selectinload(SelectionProcess.invitations))
            .order_by(SelectionProcess.created_at.desc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, process_id: int) -> SelectionProcess | None:
        stmt = (
            select(SelectionProcess)
            .options(selectinload(SelectionProcess.invitations))
            .where(SelectionProcess.id == process_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> SelectionProcess:
        process = SelectionProcess(**data)
        self._session.add(process)
        await self._session.commit()
        await self._session.refresh(process)
        return process

    async def delete(self, process: SelectionProcess) -> None:
        await self._session.delete(process)
        await self._session.commit()

    async def is_within_validity(self, process_id: int) -> bool:
        now = datetime.now(UTC)
        stmt = select(SelectionProcess).where(
            SelectionProcess.id == process_id,
            SelectionProcess.start_date <= now,
            SelectionProcess.end_date >= now,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None
