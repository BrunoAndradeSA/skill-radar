from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch


def _make_mock_process(**kwargs) -> MagicMock:
    from datetime import UTC, datetime

    p = MagicMock()
    p.id = kwargs.get("id", 1)
    p.name = kwargs.get("name", "Processo Teste")
    p.start_date = kwargs.get("start_date", datetime.now(UTC) - timedelta(days=1))
    p.end_date = kwargs.get("end_date", datetime.now(UTC) + timedelta(days=30))
    p.cargo = kwargs.get("cargo", "Desenvolvedor")
    p.nivel = kwargs.get("nivel", "Pleno")
    p.setor = kwargs.get("setor", "Desenvolvimento")
    p.squad = kwargs.get("squad", "Squad 1")
    p.template_id = kwargs.get("template_id", 1)
    p.invitations = kwargs.get("invitations", [])
    p.created_at = kwargs.get("created_at", datetime.now(UTC))
    p.updated_at = kwargs.get("updated_at", datetime.now(UTC))
    return p


def _make_mock_invitation(**kwargs) -> MagicMock:
    i = MagicMock()
    i.id = kwargs.get("id", 1)
    i.template_id = kwargs.get("template_id", 1)
    i.candidate_name = kwargs.get("candidate_name", "João")
    i.candidate_email = kwargs.get("candidate_email", "joao@test.com")
    i.cargo = kwargs.get("cargo", "Desenvolvedor")
    i.squad = kwargs.get("squad", "Squad 1")
    i.setor = kwargs.get("setor", "Desenvolvimento")
    i.nivel = kwargs.get("nivel", "Pleno")
    i.is_external = True
    i.expires_at = kwargs.get("expires_at", datetime.now(UTC) + timedelta(days=30))
    i.used = kwargs.get("used", False)
    i.selection_process_id = kwargs.get("selection_process_id", 1)
    return i


def _make_mock_assessment(**kwargs) -> MagicMock:
    a = MagicMock()
    a.id = kwargs.get("id", 1)
    a.invitation_id = kwargs.get("invitation_id", 1)
    a.status = kwargs.get("status", "FINISHED")
    a.score = kwargs.get("score", 7)
    a.percentage = kwargs.get("percentage", 70)
    a.answers = kwargs.get("answers", [])
    return a


class TestCreateSelectionProcess:
    def test_success(self, app_client, mock_template, auth_header):
        future = datetime.now(UTC) + timedelta(days=30)
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.selection_processes.services.selection_process_service.InvitationRepository",
            ) as mock_inv_repo_class,
            patch(
                "app.domains.selection_processes.services.selection_process_service.TemplateRepository",
            ) as mock_tpl_class,
            patch(
                "app.domains.selection_processes.services.selection_process_service.QuestionRepository",
            ) as mock_q_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            mock_process = _make_mock_process()
            mock_repo = mock_repo_class.return_value
            mock_repo.create = AsyncMock(return_value=mock_process)
            mock_repo.get_by_id = AsyncMock(return_value=mock_process)

            mock_inv_repo = mock_inv_repo_class.return_value
            mock_inv_repo.create = AsyncMock()

            mock_tpl_class.return_value.get_by_id = AsyncMock(return_value=mock_template)
            mock_q_class.return_value.count_by_theme_and_seniority = AsyncMock(return_value=1)

            response = app_client.post(
                "/api/v1/selection-processes",
                json={
                    "name": "Processo Teste",
                    "start_date": datetime.now(UTC).isoformat(),
                    "end_date": future.isoformat(),
                    "cargo": "Desenvolvedor",
                    "nivel": "Pleno",
                    "setor": "Desenvolvimento",
                    "squad": "Squad 1",
                    "template_id": 1,
                    "candidates": [
                        {"name": "João", "email": "joao@test.com"},
                    ],
                },
                headers=auth_header,
            )

            assert response.status_code == 201
            data = response.json()
            assert data["description"] == "Processo seletivo criado com sucesso"
            assert data["data"]["name"] == "Processo Teste"

    def test_end_date_before_start(self, app_client, auth_header):
        with patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt:
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            response = app_client.post(
                "/api/v1/selection-processes",
                json={
                    "name": "Processo Inválido",
                    "start_date": (datetime.now(UTC) + timedelta(days=10)).isoformat(),
                    "end_date": (datetime.now(UTC) + timedelta(days=5)).isoformat(),
                    "cargo": "Desenvolvedor",
                    "nivel": "Pleno",
                    "setor": "Desenvolvimento",
                    "squad": "Squad 1",
                    "template_id": 1,
                    "candidates": [],
                },
                headers=auth_header,
            )

            assert response.status_code == 422

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/selection-processes",
            json={
                "name": "Processo Teste",
                "start_date": datetime.now(UTC).isoformat(),
                "end_date": (datetime.now(UTC) + timedelta(days=30)).isoformat(),
                "cargo": "Desenvolvedor",
                "nivel": "Pleno",
                "setor": "Desenvolvimento",
                "squad": "Squad 1",
                "template_id": 1,
                "candidates": [],
            },
        )
        assert response.status_code == 401


class TestListSelectionProcesses:
    def test_success(self, app_client, auth_header):
        mock_process = _make_mock_process()
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_process])

            response = app_client.get("/api/v1/selection-processes", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert data["code"] == 200
            assert len(data["data"]) == 1
            assert data["data"][0]["name"] == "Processo Teste"

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/selection-processes", headers=auth_header)
            assert response.status_code == 200
            assert len(response.json()["data"]) == 0


class TestGetSelectionProcess:
    def test_success(self, app_client, auth_header):
        mock_process = _make_mock_process()
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_process)

            response = app_client.get("/api/v1/selection-processes/1", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert data["data"]["name"] == "Processo Teste"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/selection-processes/999", headers=auth_header)
            assert response.status_code == 404


class TestAddCandidates:
    def test_success(self, app_client, auth_header):
        process = _make_mock_process(invitations=[])
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.selection_processes.services.selection_process_service.InvitationRepository",
            ) as mock_inv_repo_class,
            patch(
                "app.domains.selection_processes.services.selection_process_service.TemplateRepository",
            ) as mock_tpl_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=process)

            mock_inv_repo = mock_inv_repo_class.return_value
            mock_inv_repo.create = AsyncMock()

            mock_tpl_class.return_value.get_by_id = AsyncMock(
                return_value=MagicMock(seniority="Pleno")
            )

            response = app_client.post(
                "/api/v1/selection-processes/1/candidates",
                json={
                    "candidates": [
                        {"name": "Maria", "email": "maria@test.com"},
                    ],
                },
                headers=auth_header,
            )

            assert response.status_code == 200
            assert mock_inv_repo.create.called

    def test_expired_process(self, app_client, auth_header):
        process = _make_mock_process(
            end_date=datetime.now(UTC) - timedelta(days=1),
        )
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=process)

            response = app_client.post(
                "/api/v1/selection-processes/1/candidates",
                json={"candidates": [{"name": "Maria", "email": "maria@test.com"}]},
                headers=auth_header,
            )

            assert response.status_code == 400

    def test_not_started_yet(self, app_client, auth_header):
        process = _make_mock_process(
            start_date=datetime.now(UTC) + timedelta(days=1),
            end_date=datetime.now(UTC) + timedelta(days=30),
        )
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=process)

            response = app_client.post(
                "/api/v1/selection-processes/1/candidates",
                json={"candidates": [{"name": "Maria", "email": "maria@test.com"}]},
                headers=auth_header,
            )

            assert response.status_code == 400


class TestGetRankings:
    def test_success(self, app_client, auth_header, mock_db_session):
        mock_invitation = _make_mock_invitation(id=1)
        mock_assessment = _make_mock_assessment(invitation_id=1, score=8, percentage=80)
        mock_process = _make_mock_process(invitations=[mock_invitation])

        # Mock the assessment query result
        scalar_result = MagicMock()
        scalar_result.all = MagicMock(return_value=[mock_assessment])
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=scalar_result)
        mock_db_session.execute.return_value = mock_result

        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_process)

            response = app_client.get(
                "/api/v1/selection-processes/1/rankings",
                headers=auth_header,
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data["data"]) == 1
            assert data["data"][0]["candidate_name"] == "João"
            assert data["data"][0]["score"] == 8
            assert data["data"][0]["finished"] is True

    def test_empty_rankings(self, app_client, auth_header):
        mock_process = _make_mock_process(invitations=[])
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_process)

            response = app_client.get(
                "/api/v1/selection-processes/1/rankings",
                headers=auth_header,
            )
            assert response.status_code == 200
            assert response.json()["data"] == []


class TestDeleteSelectionProcess:
    def test_success(self, app_client, auth_header):
        mock_process = _make_mock_process()
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_process)
            mock_repo.delete = AsyncMock()

            response = app_client.delete(
                "/api/v1/selection-processes/1",
                headers=auth_header,
            )
            assert response.status_code == 200

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.selection_processes.services.selection_process_service.SelectionProcessRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete(
                "/api/v1/selection-processes/999",
                headers=auth_header,
            )
            assert response.status_code == 404
