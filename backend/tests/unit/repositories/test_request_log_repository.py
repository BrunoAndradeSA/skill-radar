from __future__ import annotations

from unittest.mock import patch

import pytest

from app.domains.logs.repositories.request_log_repository import RequestLogRepository


class TestRequestLogRepository:
    @pytest.fixture
    def repo(self, mock_db_session):
        return RequestLogRepository(mock_db_session)

    async def test_create_adds_log_and_commits(self, repo, mock_db_session):
        """Testa que o método create adiciona um RequestLog à sessão e faz commit."""
        data = {
            "method": "POST",
            "path": "/api/v1/auth/login",
            "status": 200,
            "duration_ms": 42,
            "user_name": "admin",
            "request_body": '{"user": "admin"}',
            "response_body": '{"token": "abc"}',
            "headers": '{"content-type": "application/json"}',
            "curl": "curl -X POST http://localhost/api/v1/auth/login",
        }

        await repo.create(data)

        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_awaited_once()

    async def test_create_with_minimal_data(self, repo, mock_db_session):
        """Testa que create funciona com dados mínimos obrigatórios."""
        data = {
            "method": "GET",
            "path": "/health/live",
            "status": 200,
            "duration_ms": 5,
            "user_name": None,
            "request_body": None,
            "response_body": None,
            "headers": "{}",
            "curl": "",
        }

        await repo.create(data)

        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_awaited_once()

    async def test_create_passes_data_to_request_log_model(self, repo, mock_db_session):
        """Testa que o dicionário de dados é passado corretamente ao construtor do RequestLog."""
        data = {
            "method": "GET",
            "path": "/test",
            "status": 200,
            "duration_ms": 10,
            "user_name": None,
            "request_body": None,
            "response_body": None,
            "headers": "{}",
            "curl": "",
        }

        with patch(
            "app.domains.logs.repositories.request_log_repository.RequestLog",
        ) as mock_model:
            await repo.create(data)

            mock_model.assert_called_once_with(**data)
