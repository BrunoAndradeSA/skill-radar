from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.users.schemas.user_request_schema import (
    UserCreateSchema,
    UserUpdateSchema,
)
from app.domains.users.services.user_service import UserService


def _make_create_data(
    email: str = "newuser@example.com",
    name: str = "New User",
    password: str = "securepass",
) -> UserCreateSchema:
    return UserCreateSchema(
        email=email,
        name=name,
        password=password,
        roles=[],
    )


def _make_update_data(
    email: str | None = None,
    name: str | None = None,
    password: str | None = None,
) -> UserUpdateSchema:
    return UserUpdateSchema(
        email=email,
        name=name,
        password=password,
    )


class TestListUsers:
    async def test_returns_all_active_users(self, mock_db_session, mock_user):
        """Testa que list_users retorna todos os usuários ativos."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.list_all = AsyncMock(return_value=[mock_user])
            mock_repo_class.return_value = mock_repo

            result = await UserService.list_users(db=mock_db_session)

            assert len(result) == 1
            assert result[0].id == 1
            mock_repo.list_all.assert_awaited_once()

    async def test_empty_list(self, mock_db_session):
        """Testa que list_users retorna lista vazia quando não há usuários."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.list_all = AsyncMock(return_value=[])
            mock_repo_class.return_value = mock_repo

            result = await UserService.list_users(db=mock_db_session)

            assert result == []

    async def test_filters_by_user_id(self, mock_db_session, mock_user):
        """Testa que list_users filtra usuários pelo ID informado."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.list_all = AsyncMock(return_value=[mock_user])
            mock_repo_class.return_value = mock_repo

            result = await UserService.list_users(db=mock_db_session, user_id=1)

            assert len(result) == 1
            mock_repo.list_all.assert_awaited_with(
                user_id=1,
                email=None,
                name=None,
            )


class TestCreateUser:
    async def test_success(self, mock_db_session, mock_role_user):
        """Testa a criação bem-sucedida de um novo usuário."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_email = AsyncMock(return_value=None)
            mock_repo.get_roles_by_descriptions = AsyncMock(return_value=[])
            mock_repo.assign_roles = AsyncMock()
            mock_repo_class.return_value = mock_repo

            created_user = MagicMock()
            created_user.id = 4
            created_user.email = "newuser@example.com"
            created_user.name = "New User"
            created_user.enabled = True
            created_user.roles = []
            created_user.created_at = datetime(2026, 1, 1, tzinfo=UTC)
            created_user.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
            created_user.deleted_at = None
            mock_repo.create = AsyncMock(return_value=created_user)

            data = _make_create_data(
                email="newuser@example.com",
            )

            result = await UserService.create_user(db=mock_db_session, data=data)

            assert result.id == 4
            assert result.email == "newuser@example.com"
            mock_repo.get_by_email.assert_awaited_once_with("newuser@example.com")

    async def test_duplicate_email(self, mock_db_session, mock_user):
        """Testa que BadRequestError é levantado ao criar usuário com email já existente."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_email = AsyncMock(return_value=mock_user)
            mock_repo_class.return_value = mock_repo

            data = _make_create_data(email="admin@example.com")

            with pytest.raises(BadRequestError, match="E-mail já cadastrado"):
                await UserService.create_user(db=mock_db_session, data=data)


class TestUpdateUser:
    async def test_success(self, mock_db_session, mock_user):
        """Testa a atualização bem-sucedida dos dados de um usuário."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=mock_user)
            mock_repo.get_by_email = AsyncMock(return_value=None)
            mock_repo.update = AsyncMock(return_value=mock_user)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data(email="updated@example.com")

            result = await UserService.update_user(
                db=mock_db_session,
                user_id=1,
                data=data,
            )

            assert result is not None
            mock_repo.get_by_id.assert_awaited_once_with(1)
            mock_repo.get_by_email.assert_awaited_once_with("updated@example.com")

    async def test_user_not_found(self, mock_db_session):
        """Testa que NotFoundError é levantado ao atualizar um usuário inexistente."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=None)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data()

            with pytest.raises(NotFoundError, match="Usuário não encontrado"):
                await UserService.update_user(
                    db=mock_db_session,
                    user_id=999,
                    data=data,
                )

    async def test_deleted_user(self, mock_db_session):
        """Testa que BadRequestError é levantado ao atualizar um usuário deletado."""
        deleted_user = MagicMock()
        deleted_user.deleted_at = datetime(2026, 5, 1, tzinfo=UTC)
        deleted_user.email = "deleted@test.com"

        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=deleted_user)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data(name="Updated Name")

            with pytest.raises(BadRequestError, match="Cannot update a deleted user"):
                await UserService.update_user(
                    db=mock_db_session,
                    user_id=1,
                    data=data,
                )

    async def test_email_already_in_use(self, mock_db_session, mock_user):
        """Testa que BadRequestError é levantado ao atualizar com email já em uso por outro usuário."""
        existing = MagicMock()
        existing.id = 2
        existing.email = "taken@example.com"

        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=mock_user)
            mock_repo.get_by_email = AsyncMock(return_value=existing)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data(email="taken@example.com")

            with pytest.raises(BadRequestError, match="E-mail já está em uso"):
                await UserService.update_user(
                    db=mock_db_session,
                    user_id=1,
                    data=data,
                )

    async def test_same_email_allowed(self, mock_db_session, mock_user):
        """Testa que o próprio email do usuário é permitido durante a atualização."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=mock_user)
            mock_repo.get_by_email = AsyncMock(return_value=mock_user)
            mock_repo.update = AsyncMock(return_value=mock_user)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data(email="admin@example.com")

            result = await UserService.update_user(
                db=mock_db_session,
                user_id=1,
                data=data,
            )

            assert result is not None

    async def test_name_update(self, mock_db_session, mock_user):
        """Testa a atualização do campo name."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=mock_user)
            mock_repo.update = AsyncMock(return_value=mock_user)
            mock_repo_class.return_value = mock_repo

            data = _make_update_data(name="Updated Name")

            result = await UserService.update_user(
                db=mock_db_session,
                user_id=1,
                data=data,
            )

            assert result is not None


class TestDeleteUser:
    async def test_success(self, mock_db_session, mock_user):
        """Testa a exclusão lógica bem-sucedida de um usuário."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=mock_user)
            mock_repo.soft_delete = AsyncMock(return_value=mock_user)
            mock_repo_class.return_value = mock_repo

            result = await UserService.delete_user(db=mock_db_session, user_id=1)

            assert result is not None
            mock_repo.soft_delete.assert_awaited_once_with(mock_user)

    async def test_not_found(self, mock_db_session):
        """Testa que NotFoundError é levantado ao deletar um usuário inexistente."""
        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=None)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(NotFoundError, match="Usuário não encontrado"):
                await UserService.delete_user(db=mock_db_session, user_id=999)

    async def test_already_deleted(self, mock_db_session):
        """Testa que BadRequestError é levantado ao deletar um usuário já deletado."""
        deleted_user = MagicMock()
        deleted_user.deleted_at = datetime(2026, 5, 1, tzinfo=UTC)

        with patch(
            "app.domains.users.services.user_service.UserRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.get_by_id = AsyncMock(return_value=deleted_user)
            mock_repo_class.return_value = mock_repo

            with pytest.raises(BadRequestError, match="Usuário já foi excluído"):
                await UserService.delete_user(db=mock_db_session, user_id=1)
