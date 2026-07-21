from __future__ import annotations

from unittest.mock import AsyncMock

from sqlalchemy import text

from app.domains.health.services.health_service import HealthService


class TestHealthService:
    async def test_check_database_success(self, mock_db_session):
        """Testa que check_database retorna True quando a conexão com o banco está OK."""
        mock_db_session.execute = AsyncMock()

        result = await HealthService.check_database(mock_db_session)

        assert result is True
        mock_db_session.execute.assert_awaited_once()

    async def test_check_database_query_is_select_one(self, mock_db_session):
        """Testa que a query executada no banco é 'SELECT 1'."""
        mock_db_session.execute = AsyncMock()

        await HealthService.check_database(mock_db_session)

        call_args = mock_db_session.execute.call_args[0][0]
        assert str(call_args) == str(text("SELECT 1"))

    async def test_check_database_failure(self, mock_db_session):
        """Testa que check_database retorna False em caso de falha genérica."""
        mock_db_session.execute = AsyncMock(side_effect=Exception("DB connection error"))

        result = await HealthService.check_database(mock_db_session)

        assert result is False

    async def test_check_database_operational_error(self, mock_db_session):
        """Testa que check_database retorna False em caso de erro de conexão."""
        mock_db_session.execute = AsyncMock(side_effect=ConnectionError("Connection refused"))

        result = await HealthService.check_database(mock_db_session)

        assert result is False

    async def test_check_database_timeout_error(self, mock_db_session):
        """Testa que check_database retorna False em caso de timeout."""
        mock_db_session.execute = AsyncMock(side_effect=TimeoutError("Query timeout"))

        result = await HealthService.check_database(mock_db_session)

        assert result is False
