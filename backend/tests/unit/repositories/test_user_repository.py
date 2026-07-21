from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.domains.users.repositories.user_repository import UserRepository


class TestUserRepository:
    @pytest.fixture
    def repo(self, mock_db_session):
        return UserRepository(mock_db_session)

    @pytest.fixture
    def mock_sqlalchemy_result(self):
        result = MagicMock()
        scalar_result = MagicMock()
        scalar_result.all = MagicMock(return_value=[])
        result.scalars = MagicMock(return_value=scalar_result)
        result.scalar_one_or_none = MagicMock(return_value=None)
        return result

    async def test_list_all_excludes_deleted(self, repo, mock_db_session, mock_sqlalchemy_result):
        """Testa que list_all exclui usuários deletados da consulta."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        await repo.list_all()

        mock_db_session.execute.assert_awaited_once()

    async def test_list_all_with_filters(self, repo, mock_db_session, mock_sqlalchemy_result):
        """Testa que list_all aplica os filtros corretamente na consulta."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        await repo.list_all(user_id=1, email="test@test.com", name="Test")

        mock_db_session.execute.assert_awaited_once()

    async def test_list_all_with_name_filter(self, repo, mock_db_session, mock_sqlalchemy_result):
        """Testa que list_all filtra por nome quando informado."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        await repo.list_all(name="John")

        mock_db_session.execute.assert_awaited_once()

    async def test_get_by_id(self, repo, mock_db_session, mock_sqlalchemy_result, mock_user):
        """Testa que get_by_id retorna o usuário quando encontrado."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = mock_user
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.get_by_id(1)

        assert result is not None
        assert result.id == 1

    async def test_get_by_id_not_found(self, repo, mock_db_session, mock_sqlalchemy_result):
        """Testa que get_by_id retorna None quando o usuário não existe."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.get_by_id(999)

        assert result is None

    async def test_get_by_email(self, repo, mock_db_session, mock_sqlalchemy_result, mock_user):
        """Testa que get_by_email retorna o usuário pelo email informado."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = mock_user
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.get_by_email("admin@example.com")

        assert result is not None
        assert result.email == "admin@example.com"

    async def test_create(self, repo, mock_db_session):
        """Testa que create insere um novo usuário no banco de dados."""
        user_data = {
            "email": "new@example.com",
            "username": "newuser",
            "password_hash": "hash",
            "client_id": "cid",
            "client_secret": "csecret",
            "enabled": True,
        }

        mock_db_session.add = MagicMock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()

        await repo.create(user_data)

        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_awaited_once()
        mock_db_session.refresh.assert_awaited_once()

    async def test_find_active_by_username_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
        mock_user,
    ):
        """Testa que find_active_by_username retorna o usuário ativo pelo username."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = mock_user
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_username("admin")

        assert result is not None
        assert result.username == "admin"

    async def test_find_active_by_username_not_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
    ):
        """Testa que find_active_by_username retorna None quando não encontrado."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_username("nonexistent")

        assert result is None

    async def test_find_active_by_client_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
        mock_user,
    ):
        """Testa que find_active_by_client retorna o usuário ativo pelo client_id/secret."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = mock_user
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_client("a1b2c3d4e5f6g7h8")

        assert result is not None
        assert result.id == 1

    async def test_find_active_by_client_not_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
    ):
        """Testa que find_active_by_client retorna None quando não encontrado."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_client("invalid")

        assert result is None

    async def test_update(self, repo, mock_db_session, mock_user):
        """Testa que update altera os atributos do usuário e persiste no banco."""
        mock_db_session.commit = AsyncMock()

        await repo.update(mock_user, {"email": "updated@example.com"})

        assert mock_user.email == "updated@example.com"
        mock_db_session.commit.assert_awaited_once()

    async def test_soft_delete(self, repo, mock_db_session, mock_user):
        """Testa que soft_delete marca o deleted_at e desativa o usuário."""
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()

        await repo.soft_delete(mock_user)

        assert mock_user.deleted_at is not None
        assert mock_user.enabled is False
        mock_db_session.commit.assert_awaited_once()
        mock_db_session.refresh.assert_awaited_once()

    async def test_find_active_by_email_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
        mock_user,
    ):
        """Testa que find_active_by_email retorna o usuário ativo pelo email."""
        mock_sqlalchemy_result.scalar_one_or_none.return_value = mock_user
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_email("admin@example.com")

        assert result is not None
        assert result.email == "admin@example.com"

    async def test_find_active_by_email_not_found(
        self,
        repo,
        mock_db_session,
        mock_sqlalchemy_result,
    ):
        """Testa que find_active_by_email retorna None quando não encontrado."""
        mock_db_session.execute.return_value = mock_sqlalchemy_result

        result = await repo.find_active_by_email("nonexistent@test.com")
