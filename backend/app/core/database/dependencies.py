from __future__ import annotations

from typing import TYPE_CHECKING

from app.db.session import AsyncSessionLocal

if TYPE_CHECKING:
    from collections.abc import AsyncIterator

    from sqlalchemy.ext.asyncio import AsyncSession


async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Fornece uma sessão assíncrona do banco de dados como dependência do FastAPI.

    Yields:
        AsyncSession: Sessão assíncrona do SQLAlchemy.
    """
    async with AsyncSessionLocal() as session:
        yield session
