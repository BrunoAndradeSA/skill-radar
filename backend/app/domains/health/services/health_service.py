from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import text

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class HealthService:
    """Serviço responsável pelos health checks da aplicação."""

    @staticmethod
    async def check_database(
        session: AsyncSession,
    ) -> bool:
        """Verifica se o banco de dados está acessível executando `SELECT 1`.

        Args:
            session: Sessão assíncrona do SQLAlchemy.

        Returns:
            bool: True se o banco estiver acessível, False caso contrário.
        """
        try:
            await session.execute(text("SELECT 1"))

            return True

        except Exception:
            return False
