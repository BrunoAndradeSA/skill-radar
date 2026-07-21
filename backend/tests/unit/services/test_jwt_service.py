from __future__ import annotations

from unittest.mock import Mock, patch

import jwt
import pytest

from app.core.settings import settings
from app.domains.auth.services.jwt_service import JwtService


class TestJwtService:
    def test_generate_token_returns_string(self, mock_user):
        """Testa que generate_token retorna uma string não vazia."""
        token = JwtService.generate_token(mock_user)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_generate_token_valid_jwt(self, mock_user):
        """Testa que o token gerado contém os claims corretos (sub, username, roles)."""
        token = JwtService.generate_token(mock_user)
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        assert payload["sub"] == str(mock_user.id)
        assert payload["username"] == mock_user.username
        assert payload["roles"] == ["ADMIN", "USER"]

    def test_generate_token_expires_in_future(self, mock_user):
        """Testa que a data de expiração do token está no futuro."""
        from datetime import UTC, datetime

        token = JwtService.generate_token(mock_user)
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": False},
        )
        exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
        assert exp > datetime.now(UTC)

    def test_generate_token_with_no_roles(self, mock_user_no_roles):
        """Testa que o token gerado para usuário sem papéis contém lista vazia de roles."""
        token = JwtService.generate_token(mock_user_no_roles)
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        assert payload["roles"] == []

    def test_generate_token_respects_expire_minutes(self, mock_user):
        """Testa que o token respeita o tempo de expiração configurado no settings."""
        with patch.object(settings, "jwt_expire_minutes", 5):
            from datetime import UTC, datetime, timedelta

            token = JwtService.generate_token(mock_user)
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                options={"verify_exp": False},
            )
            exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
            now = datetime.now(UTC)
            assert timedelta(minutes=4) < (exp - now) < timedelta(minutes=6)

    @pytest.mark.parametrize(
        "username",
        ["admin", "user.test", "john_doe", "a" * 50],
    )
    def test_generate_token_various_usernames(self, username: str):
        """Testa que generate_token funciona com diferentes formatos de username."""
        user = Mock()
        user.id = 42
        user.username = username
        user.roles = []
        token = JwtService.generate_token(user)
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        assert payload["username"] == username
