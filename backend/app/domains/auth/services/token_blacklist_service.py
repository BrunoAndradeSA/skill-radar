from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.auth.models.blacklisted_token_model import BlacklistedToken


class TokenBlacklistService:
    """Serviço para gerenciamento de blacklist de tokens JWT."""

    @staticmethod
    async def revoke(
        db: AsyncSession,
        jti: str,
        token_type: str,
        user_id: int | None = None,
        expires_at: datetime | None = None,
    ) -> None:
        """Adiciona um token à blacklist.

        Args:
            db: Sessão assíncrona do banco de dados.
            jti: Identificador único do token (JWT ID).
            token_type: Tipo do token ("access" ou "refresh").
            user_id: ID do usuário associado ao token (opcional).
            expires_at: Data de expiração natural do token (opcional).
        """
        entry = BlacklistedToken(
            jti=jti,
            token_type=token_type,
            user_id=user_id,
            expires_at=expires_at or datetime.now(UTC),
        )
        db.add(entry)
        await db.commit()

    @staticmethod
    async def is_blacklisted(db: AsyncSession, jti: str) -> bool:
        """Verifica se um JTI está na blacklist.

        Args:
            db: Sessão assíncrona do banco de dados.
            jti: Identificador único do token (JWT ID).

        Returns:
            bool: True se o token estiver na blacklist.
        """
        try:
            stmt = select(BlacklistedToken).where(
                BlacklistedToken.jti == jti,
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none() is not None
        except Exception:
            return False

    @staticmethod
    async def cleanup_expired(db: AsyncSession) -> int:
        """Remove entradas expiradas da blacklist.

        Returns:
            int: Número de entradas removidas.
        """
        from sqlalchemy import delete

        stmt = (
            delete(BlacklistedToken)
            .where(BlacklistedToken.expires_at < datetime.now(UTC))
            .execution_options(synchronize_session="fetch")
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount  # type: ignore
