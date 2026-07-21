from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import UnauthorizedError
from app.domains.auth.services.auth_service import AuthService
from app.domains.auth.services.password_service import PasswordService


class TestAuthServiceAuthenticateUser:
    async def test_success(self):
        """Testa a autenticação bem-sucedida de um usuário com credenciais válidas."""
        password = "correct_password"
        admin_role = MagicMock()
        admin_role.description = "ADMIN"

        user = MagicMock()
        user.password_hash = PasswordService.hash_password(password)
        user.id = 1
        user.username = "admin"
        user.name = "Admin"
        user.email = "admin@test.com"
        user.enabled = True
        user.deleted_at = None
        user.roles = [admin_role]

        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_username = AsyncMock(return_value=user)
            mock_repo_class.return_value = mock_repo

            result = await AuthService.authenticate_user(
                db=MagicMock(),
                login="admin",
                password=password,
            )

        assert isinstance(result, dict)
        assert "access_token" in result
        assert "refresh_token" in result
        assert "user" in result
        assert result["user"]["email"] == "admin@test.com"
        mock_repo.find_active_by_username.assert_awaited_once_with("admin")

    async def test_success_with_email(self):
        """Testa autenticação bem-sucedida usando e-mail."""
        password = "pass"
        admin_role = MagicMock()
        admin_role.description = "ADMIN"

        user = MagicMock()
        user.password_hash = PasswordService.hash_password(password)
        user.id = 1
        user.username = "admin"
        user.name = "Admin"
        user.email = "admin@test.com"
        user.enabled = True
        user.deleted_at = None
        user.roles = [admin_role]

        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_email = AsyncMock(return_value=user)
            mock_repo_class.return_value = mock_repo

            result = await AuthService.authenticate_user(
                db=MagicMock(),
                login="admin@test.com",
                password=password,
            )

        assert isinstance(result, dict)
        assert "access_token" in result
        assert "refresh_token" in result
        assert "user" in result
        mock_repo.find_active_by_email.assert_awaited_once_with("admin@test.com")

    async def test_user_not_found(self):
        """Testa que UnauthorizedError é levantado quando o usuário não existe."""
        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_username = AsyncMock(return_value=None)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(UnauthorizedError, match="Credenciais inválidas"):
                await AuthService.authenticate_user(
                    db=MagicMock(),
                    login="unknown",
                    password="any_password",
                )

    async def test_wrong_password(self):
        """Testa que UnauthorizedError é levantado ao fornecer senha incorreta."""
        user = MagicMock()
        user.password_hash = PasswordService.hash_password("correct_password")
        user.enabled = True
        user.deleted_at = None

        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_username = AsyncMock(return_value=user)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(UnauthorizedError, match="Credenciais inválidas"):
                await AuthService.authenticate_user(
                    db=MagicMock(),
                    login="admin",
                    password="wrong_password",
                )

    async def test_disabled_user(self):
        """Testa que UnauthorizedError é levantado quando o usuário está desabilitado."""
        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_username = AsyncMock(return_value=None)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(UnauthorizedError, match="Credenciais inválidas"):
                await AuthService.authenticate_user(
                    db=MagicMock(),
                    login="disabled",
                    password="any_password",
                )

    async def test_delegates_to_repository_by_username(self):
        """Testa que o método delega ao find_active_by_username quando não contém @."""
        admin_role = MagicMock()
        admin_role.description = "ADMIN"

        user = MagicMock()
        user.password_hash = PasswordService.hash_password("pass")
        user.id = 1
        user.username = "admin"
        user.name = "Admin"
        user.email = "admin@test.com"
        user.enabled = True
        user.deleted_at = None
        user.roles = [admin_role]

        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_username = AsyncMock(return_value=user)
            mock_repo_class.return_value = mock_repo

            await AuthService.authenticate_user(
                db=MagicMock(),
                login="specific_user",
                password="pass",
            )

            mock_repo.find_active_by_username.assert_awaited_once_with("specific_user")


class TestAuthServiceAuthenticateApiKey:
    async def test_success(self):
        """Testa a autenticação bem-sucedida via API key com credenciais válidas."""
        admin_role = MagicMock()
        admin_role.description = "ADMIN"

        user = MagicMock()
        user.id = 1
        user.username = "api_client"
        user.name = "API Client"
        user.email = "api@test.com"
        user.enabled = True
        user.deleted_at = None
        user.roles = [admin_role]
        user.client_secret = "$argon2id$v=19$m=65536,t=3,p=4$testhash"

        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.auth.services.auth_service.PasswordService",
            ) as mock_pw_class,
            patch(
                "app.domains.auth.services.auth_service.JwtService",
            ) as mock_jwt_class,
        ):
            mock_repo = MagicMock()
            mock_repo.find_active_by_client = AsyncMock(return_value=user)
            mock_repo_class.return_value = mock_repo
            mock_pw_class.verify_password = MagicMock(return_value=True)
            mock_jwt_class.generate_token = MagicMock(return_value="api-token")
            mock_jwt_class.generate_refresh_token = MagicMock(return_value="api-refresh")

            result = await AuthService.authenticate_api_key(
                db=MagicMock(),
                client_id="valid_client_id",
                client_secret="valid_client_secret",
            )

        assert isinstance(result, dict)
        assert "access_token" in result
        assert "refresh_token" in result
        assert "user" in result
        mock_repo.find_active_by_client.assert_awaited_once_with("valid_client_id")

    async def test_invalid_credentials(self):
        """Testa que UnauthorizedError é levantado para credenciais de API inválidas."""
        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.find_active_by_client = AsyncMock(return_value=None)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(UnauthorizedError, match="Credenciais inválidas"):
                await AuthService.authenticate_api_key(
                    db=MagicMock(),
                    client_id="invalid",
                    client_secret="invalid",
                )
