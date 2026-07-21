from __future__ import annotations

from unittest.mock import patch

import jwt
import pytest
from fastapi.security import HTTPAuthorizationCredentials

from app.core.exceptions import UnauthorizedError
from app.core.settings import settings


class TestRequireRole:
    def _make_token(self, **claims) -> str:
        payload = {
            "sub": "1",
            "username": "admin",
            "roles": ["ADMIN", "USER"],
            **claims,
        }
        return jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

    async def _call_check(self, *allowed_roles, credentials=None):
        from app.domains.auth.dependencies import require_role

        dep = require_role(*allowed_roles)
        return await dep.dependency(credentials)

    async def test_valid_token_with_allowed_role(self):
        """Testa que um token válido com papel permitido passa na verificação."""
        token = self._make_token()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await self._call_check("ADMIN", credentials=creds)

        assert result is None

    async def test_valid_token_with_multiple_allowed_roles(self):
        """Testa que um token com múltiplos papéis permitidos passa na verificação."""
        token = self._make_token()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await self._call_check("USER", "ADMIN", credentials=creds)

        assert result is None

    async def test_valid_token_with_any_allowed_role(self):
        """Testa que um token com qualquer papel na lista permitida passa na verificação."""
        token = self._make_token(roles=["USER"])
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        result = await self._call_check("USER", credentials=creds)

        assert result is None

    async def test_no_credentials(self):
        """Testa que UnauthorizedError é levantado quando não há credenciais no header."""
        with pytest.raises(UnauthorizedError, match="Cabeçalho de autorização ausente"):
            await self._call_check("ADMIN", credentials=None)

    async def test_invalid_token(self):
        """Testa que UnauthorizedError é levantado para um token JWT inválido."""
        creds = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="invalid.jwt.token",
        )

        with pytest.raises(UnauthorizedError, match="Token inválido ou expirado"):
            await self._call_check("ADMIN", credentials=creds)

    async def test_expired_token(self):
        """Testa que UnauthorizedError é levantado para um token expirado."""
        from datetime import UTC, datetime, timedelta

        exp = int((datetime.now(UTC) - timedelta(hours=1)).timestamp())
        token = self._make_token(exp=exp)
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(UnauthorizedError, match="Token inválido ou expirado"):
            await self._call_check("ADMIN", credentials=creds)

    async def test_insufficient_permissions(self):
        """Testa que UnauthorizedError é levantado quando o papel do token é insuficiente."""
        token = self._make_token(roles=["USER"])
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(UnauthorizedError, match="Permissões insuficientes"):
            await self._call_check("ADMIN", credentials=creds)

    async def test_no_roles_in_token(self):
        """Testa que UnauthorizedError é levantado quando o token não contém papéis."""
        token = self._make_token(roles=[])
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(UnauthorizedError, match="Permissões insuficientes"):
            await self._call_check("ADMIN", credentials=creds)

    async def test_token_with_wrong_secret(self):
        """Testa que UnauthorizedError é levantado para token assinado com chave secreta diferente."""
        with patch.object(settings, "jwt_secret_key", "different-secret"):
            token = self._make_token()

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(UnauthorizedError, match="Token inválido ou expirado"):
            await self._call_check("ADMIN", credentials=creds)
