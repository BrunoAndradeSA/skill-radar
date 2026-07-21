from __future__ import annotations

from typing import Annotated

import jwt
from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import PyJWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.dependencies import get_db_session
from app.core.exceptions import UnauthorizedError
from app.core.settings import settings
from app.domains.auth.services.token_blacklist_service import TokenBlacklistService

security_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="JWT Bearer token obtido em POST /api/v1/auth/login ou /api/v1/auth/token",
    auto_error=False,
)


def require_role(*allowed_roles: str):
    """Retorna uma dependência do FastAPI que valida se o token JWT contém ao menos um dos papéis informados.

    Args:
        *allowed_roles: Nomes dos papéis permitidos para acessar o recurso.

    Returns:
        Security: Dependência de segurança do FastAPI que valida o token e os papéis.
    """

    async def _check(
        credentials: Annotated[
            HTTPAuthorizationCredentials | None,
            Security(security_scheme),
        ],
        db: AsyncSession = Depends(get_db_session),  # noqa: B008
    ) -> None:
        """Valida o token JWT e os papéis do usuário autenticado.

        Args:
            credentials: Credenciais de autorização extraídas do cabeçalho.
            db: Sessão assíncrona do banco de dados.

        Raises:
            UnauthorizedError: Se o token estiver ausente, inválido ou sem permissão.
        """
        if credentials is None:
            raise UnauthorizedError("Cabeçalho de autorização ausente")

        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
        except PyJWTError:
            raise UnauthorizedError("Token inválido ou expirado") from None

        jti = payload.get("jti")
        if jti and await TokenBlacklistService.is_blacklisted(db, jti):
            raise UnauthorizedError("Token foi revogado")

        user_roles: list[str] = payload.get("roles", [])

        if not any(role in user_roles for role in allowed_roles):
            raise UnauthorizedError("Permissões insuficientes")

    return Security(_check)
