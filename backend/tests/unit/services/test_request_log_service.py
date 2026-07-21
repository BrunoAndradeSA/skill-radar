from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from app.domains.logs.models.request_log_model import RequestLog
from app.domains.logs.services.request_log_service import RequestLogService


class TestCreateLog:
    async def test_create_log_calls_repository(self, mock_db_session):
        """Testa que create_log chama o repositório com os dados fornecidos."""
        data = {
            "method": "GET",
            "path": "/api/v1/health/ready",
            "status": 200,
            "duration_ms": 42,
            "user_name": "admin",
            "request_body": None,
            "response_body": None,
            "headers": '{"content-type": "application/json"}',
            "curl": "curl -X GET http://localhost/api/v1/health/ready",
        }

        with patch(
            "app.domains.logs.services.request_log_service.RequestLogRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.create = AsyncMock()
            mock_repo_class.return_value = mock_repo

            await RequestLogService.create_log(session=mock_db_session, data=data)

            mock_repo.create.assert_awaited_once_with(data)

    async def test_create_log_empty_data(self, mock_db_session):
        """Testa que create_log funciona com dados vazios ou nulos."""
        data = {
            "method": "POST",
            "path": "/test",
            "status": 201,
            "duration_ms": 100,
            "user_name": None,
            "request_body": None,
            "response_body": None,
            "headers": "{}",
            "curl": "",
        }

        with patch(
            "app.domains.logs.services.request_log_service.RequestLogRepository",
        ) as mock_repo_class:
            mock_repo = MagicMock()
            mock_repo.create = AsyncMock()
            mock_repo_class.return_value = mock_repo

            await RequestLogService.create_log(session=mock_db_session, data=data)

            mock_repo.create.assert_awaited_once_with(data)


class TestGetLogsByDate:
    def _make_mock_log(self, **kwargs) -> MagicMock:
        log = MagicMock(spec=RequestLog)
        defaults = {
            "id": 1,
            "method": "GET",
            "path": "/test",
            "status": 200,
            "user_name": "admin",
            "duration_ms": 50,
            "request_body": '{"key": "value"}',
            "response_body": '{"status": "ok"}',
            "headers": '{"content-type": "application/json"}',
            "curl": "curl http://localhost/test",
            "created_at": datetime(2026, 5, 20, 12, 0, 0),
        }
        for key, value in {**defaults, **kwargs}.items():
            setattr(log, key, value)
        return log

    async def test_returns_logs_for_date(self, mock_db_session):
        """Testa que get_logs_by_date retorna os logs da data especificada."""
        logs = [self._make_mock_log()]
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = logs

        result = await RequestLogService.get_logs_by_date(db=mock_db_session, date="2026-05-20")

        assert len(result) == 1
        assert result[0].method == "GET"
        assert result[0].path == "/test"
        assert result[0].status == 200

    async def test_empty_result(self, mock_db_session):
        """Testa que get_logs_by_date retorna lista vazia quando não há logs na data."""
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = []

        result = await RequestLogService.get_logs_by_date(db=mock_db_session, date="2026-05-20")

        assert result == []

    async def test_filters_by_method(self, mock_db_session):
        """Testa que get_logs_by_date filtra logs por método HTTP."""
        logs = [self._make_mock_log()]
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = logs

        result = await RequestLogService.get_logs_by_date(
            db=mock_db_session,
            date="2026-05-20",
            method="GET",
        )

        assert len(result) == 1

    async def test_filters_by_status(self, mock_db_session):
        """Testa que get_logs_by_date filtra logs por status HTTP."""
        logs = [self._make_mock_log()]
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = logs

        result = await RequestLogService.get_logs_by_date(
            db=mock_db_session,
            date="2026-05-20",
            status=200,
        )

        assert len(result) == 1

    async def test_filters_by_path(self, mock_db_session):
        """Testa que get_logs_by_date filtra logs por caminho da requisição."""
        logs = [self._make_mock_log()]
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = logs

        result = await RequestLogService.get_logs_by_date(
            db=mock_db_session,
            date="2026-05-20",
            path="/test",
        )

        assert len(result) == 1

    async def test_base64_encoding(self, mock_db_session):
        """Testa que os campos sensíveis (body, headers, curl) são codificados em base64."""
        log = self._make_mock_log(
            request_body='{"user": "admin"}',
            response_body='{"token": "abc"}',
            headers='{"authorization": "Bearer xyz"}',
            curl="curl -X GET http://localhost/test",
        )
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = [log]

        from base64 import b64encode

        result = await RequestLogService.get_logs_by_date(db=mock_db_session, date="2026-05-20")

        expected_request = b64encode(b'{"user": "admin"}').decode()
        expected_response = b64encode(b'{"token": "abc"}').decode()
        expected_headers = b64encode(b'{"authorization": "Bearer xyz"}').decode()
        expected_curl = b64encode(b"curl -X GET http://localhost/test").decode()

        assert result[0].request_body == expected_request
        assert result[0].response_body == expected_response
        assert result[0].headers == expected_headers
        assert result[0].curl == expected_curl

    async def test_base64_returns_none_for_null(self, mock_db_session):
        """Testa que campos nulos permanecem como None após a codificação base64."""
        log = self._make_mock_log(
            request_body=None,
            response_body=None,
            headers=None,
            curl=None,
        )
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = [log]

        result = await RequestLogService.get_logs_by_date(db=mock_db_session, date="2026-05-20")

        assert result[0].request_body is None
        assert result[0].response_body is None
        assert result[0].headers is None
        assert result[0].curl is None
