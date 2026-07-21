from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch


class TestListCandidates:
    def test_success(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_candidate])

            response = app_client.get("/api/v1/candidates", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "John Doe"
            assert data[0]["email"] == "john@test.com"

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/candidates", headers=auth_header)

            assert response.status_code == 200
            assert response.json() == []

    def test_requires_auth(self, app_client):
        response = app_client.get("/api/v1/candidates")
        assert response.status_code == 401


class TestGetCandidate:
    def test_success(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_candidate)

            response = app_client.get("/api/v1/candidates/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["name"] == "John Doe"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/candidates/999", headers=auth_header)
            assert response.status_code == 404


class TestCreateCandidate:
    def test_success(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=None)
            mock_repo.create = AsyncMock(return_value=mock_candidate)

            response = app_client.post(
                "/api/v1/candidates",
                json={
                    "name": "John Doe",
                    "email": "john@test.com",
                    "cargo": "Developer",
                    "setor": "Tech",
                    "nivel": "Junior",
                    "squad": "Squad A",
                },
                headers=auth_header,
            )

            assert response.status_code == 201
            data = response.json()
            assert data["code"] == 201
            assert data["data"]["name"] == "John Doe"

    def test_duplicate_email(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=mock_candidate)

            response = app_client.post(
                "/api/v1/candidates",
                json={
                    "name": "John Doe",
                    "email": "john@test.com",
                    "cargo": "Developer",
                    "setor": "Tech",
                    "nivel": "Junior",
                    "squad": "Squad A",
                },
                headers=auth_header,
            )

            assert response.status_code == 400
            data = response.json()
            assert "já cadastrado" in data["description"].lower()

    def test_requires_auth(self, app_client):
        response = app_client.post(
            "/api/v1/candidates",
            json={"name": "John Doe", "email": "john@test.com"},
        )
        assert response.status_code == 401


class TestUpdateCandidate:
    def test_success(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_candidate)
            mock_repo.update = AsyncMock()

            response = app_client.put(
                "/api/v1/candidates/1",
                json={"name": "Jane Doe"},
                headers=auth_header,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["description"] == "Candidato atualizado com sucesso"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/candidates/999",
                json={"name": "Jane Doe"},
                headers=auth_header,
            )
            assert response.status_code == 404

    def test_email_conflict(self, app_client, mock_candidate, auth_header):
        other = MagicMock()
        other.id = 2

        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_candidate)
            mock_repo.get_by_email = AsyncMock(return_value=other)

            response = app_client.put(
                "/api/v1/candidates/1",
                json={"email": "other@test.com"},
                headers=auth_header,
            )
            assert response.status_code == 400
            data = response.json()
            assert "já está em uso" in data["description"].lower()


class TestDeleteCandidate:
    def test_success(self, app_client, mock_candidate, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_candidate)
            mock_repo.soft_delete = AsyncMock()

            response = app_client.delete("/api/v1/candidates/1", headers=auth_header)
            assert response.status_code == 200
            data = response.json()
            assert data["description"] == "Candidato excluído com sucesso"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/candidates/999", headers=auth_header)
            assert response.status_code == 404

    def test_already_deleted(self, app_client, mock_candidate, auth_header):
        mock_candidate.deleted_at = datetime(2026, 1, 1, tzinfo=UTC)
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.candidates.services.candidate_service.CandidateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_candidate)

            response = app_client.delete("/api/v1/candidates/1", headers=auth_header)
            assert response.status_code == 400
            data = response.json()
            assert "já foi excluído" in data["description"].lower()
