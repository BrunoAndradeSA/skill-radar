from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.shared.schemas.default_response import DefaultResponse


class TestDefaultResponse:
    def test_required_fields(self):
        """Testa que os campos obrigatórios code, description e path são exigidos."""
        response = DefaultResponse(code=200, description="OK", path="/health")
        assert response.code == 200
        assert response.description == "OK"
        assert response.path == "/health"

    def test_timestamp_defaults_to_now(self):
        """Testa que o timestamp é gerado automaticamente se não fornecido."""
        before = datetime.now(UTC)
        response = DefaultResponse(code=200, description="OK", path="/test")
        after = datetime.now(UTC)
        assert before <= response.timestamp <= after

    def test_timestamp_custom(self):
        """Testa que um timestamp personalizado é aceito."""
        custom_ts = datetime(2026, 1, 1, tzinfo=UTC)
        response = DefaultResponse(
            code=200,
            description="OK",
            path="/test",
            timestamp=custom_ts,
        )
        assert response.timestamp == custom_ts

    def test_data_none_by_default(self):
        """Testa que data é None quando não fornecido."""
        response = DefaultResponse(code=200, description="OK", path="/test")
        assert response.data is None

    def test_data_with_value(self):
        """Testa que data aceita um valor arbitrário."""
        response = DefaultResponse(
            code=201,
            description="Created",
            path="/users",
            data={"id": 1, "name": "John"},
        )
        assert response.data == {"id": 1, "name": "John"}

    def test_data_with_list(self):
        """Testa que data aceita uma lista."""
        response = DefaultResponse(
            code=200,
            description="List",
            path="/users",
            data=[{"id": 1}, {"id": 2}],
        )
        assert response.data == [{"id": 1}, {"id": 2}]

    def test_extra_fields_forbidden(self):
        """Testa que campos extras na validação do modelo são rejeitados (extra='forbid')."""
        with pytest.raises(ValueError, match="Extra inputs are not permitted"):
            DefaultResponse.model_validate(
                {
                    "code": 200,
                    "description": "OK",
                    "path": "/test",
                    "extra_field": "should_fail",
                }
            )

    def test_model_dump_excludes_none_data(self):
        """Testa que model_dump com exclude_none=True remove data=None."""
        response = DefaultResponse(code=200, description="OK", path="/test")
        dumped = response.model_dump(exclude_none=True)
        assert "data" not in dumped
        assert dumped["code"] == 200

    def test_model_dump_includes_data_when_not_none(self):
        """Testa que model_dump inclui data quando não é None."""
        response = DefaultResponse(
            code=200,
            description="OK",
            path="/test",
            data="some_data",
        )
        dumped = response.model_dump(exclude_none=True)
        assert dumped["data"] == "some_data"

    def test_model_dump_mode_json(self):
        """Testa que model_dump mode='json' serializa datetime corretamente."""
        ts = datetime(2026, 5, 20, 12, 0, 0, tzinfo=UTC)
        response = DefaultResponse(code=200, description="OK", path="/test", timestamp=ts)
        dumped = response.model_dump(mode="json")
        assert dumped["timestamp"] == "2026-05-20T12:00:00Z"

    def test_multiple_instances_independent(self):
        """Testa que instâncias diferentes são independentes entre si."""
        r1 = DefaultResponse(code=200, description="OK", path="/a")
        r2 = DefaultResponse(code=404, description="Not Found", path="/b")
        assert r1.code == 200
        assert r2.code == 404
        assert r1.path == "/a"
        assert r2.path == "/b"
