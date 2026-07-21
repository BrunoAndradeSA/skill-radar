from __future__ import annotations

from datetime import datetime

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.exception_handlers import register_exception_handlers
from app.core.exceptions import BadRequestError, NotFoundError, UnauthorizedError


@pytest.fixture
def test_app():
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/bad-request")
    def raise_bad_request():
        raise BadRequestError("Dados inválidos")

    @app.get("/not-found")
    def raise_not_found():
        raise NotFoundError("Recurso não encontrado")

    @app.get("/unauthorized")
    def raise_unauthorized():
        raise UnauthorizedError("Acesso negado")

    return app


@pytest.fixture
def client(test_app):
    return TestClient(test_app)


class TestExceptionHandlers:
    def test_bad_request_response_format(self, client):
        """Testa que BadRequestError retorna status 400 com corpo JSON padronizado."""
        response = client.get("/bad-request")

        assert response.status_code == 400
        body = response.json()
        assert body["code"] == 400
        assert body["description"] == "Dados inválidos"
        assert body["path"] == "/bad-request"
        assert "timestamp" in body

    def test_not_found_response_format(self, client):
        """Testa que NotFoundError retorna status 404 com corpo JSON padronizado."""
        response = client.get("/not-found")

        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 404
        assert body["description"] == "Recurso não encontrado"
        assert body["path"] == "/not-found"

    def test_unauthorized_response_format(self, client):
        """Testa que UnauthorizedError retorna status 401 com corpo JSON padronizado."""
        response = client.get("/unauthorized")

        assert response.status_code == 401
        body = response.json()
        assert body["code"] == 401
        assert body["description"] == "Acesso negado"
        assert body["path"] == "/unauthorized"

    def test_response_contains_expected_fields(self, client):
        """Testa que a resposta JSON contém os campos esperados (incluindo data)."""
        response = client.get("/bad-request")
        body = response.json()
        expected_keys = {"code", "description", "path", "timestamp", "data"}
        assert set(body.keys()) == expected_keys

    def test_response_data_is_none_when_not_provided(self, client):
        """Testa que data é None quando o handler não fornece dados adicionais."""
        response = client.get("/bad-request")
        body = response.json()
        assert body["data"] is None

    def test_timestamp_is_iso_format(self, client):
        """Testa que o timestamp está no formato ISO 8601."""
        response = client.get("/bad-request")
        body = response.json()

        parsed = datetime.fromisoformat(body["timestamp"])
        assert parsed.tzinfo is not None

    def test_unknown_exception_not_handled(self, client):
        """Testa que exceções não-AppError não são capturadas pelo handler."""
        app = FastAPI()
        register_exception_handlers(app)

        @app.get("/crash")
        def crash():
            raise RuntimeError("Unexpected error")

        test_client = TestClient(app)
        with pytest.raises(RuntimeError, match="Unexpected error"):
            test_client.get("/crash")
