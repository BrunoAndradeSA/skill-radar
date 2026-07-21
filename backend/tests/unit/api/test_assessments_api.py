from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch


class TestListAssessments:
    def test_success(self, app_client, mock_assessment, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_assessment])

            response = app_client.get("/api/v1/assessments", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/assessments", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/assessments")
        assert response.status_code == 401


class TestGetAssessment:
    def test_success(self, app_client, mock_assessment, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_assessment)

            response = app_client.get("/api/v1/assessments/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["status"] == "IN_PROGRESS"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/assessments/999", headers=auth_header)
            assert response.status_code == 404


class TestGetAssessmentByInvitation:
    def test_success(self, app_client, mock_assessment):
        with patch(
            "app.domains.assessments.services.assessment_service.AssessmentRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_invitation = AsyncMock(return_value=mock_assessment)

            response = app_client.get("/api/v1/assessments/invitation/1")

            assert response.status_code == 200
            assert response.json()["id"] == 1

    def test_not_found(self, app_client):
        with patch(
            "app.domains.assessments.services.assessment_service.AssessmentRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_invitation = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/assessments/invitation/999")
            assert response.status_code == 404


class TestStartAssessment:
    def test_success(self, app_client, mock_assessment, mock_invitation, mock_template):
        future_exp = datetime.now(UTC) + timedelta(days=30)
        mock_invitation.expires_at = future_exp
        mock_invitation.used = False

        with (
            patch(
                "app.domains.assessments.services.assessment_service.InvitationRepository",
            ) as inv_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.TemplateRepository",
            ) as tpl_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.QuestionRepository",
            ) as q_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as a_repo_class,
        ):
            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_invitation)
            inv_repo_class.return_value.update = AsyncMock()
            tpl_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_template)
            q_repo_class.return_value.find_for_assessment = AsyncMock(return_value=[])
            a_repo_class.return_value.create = AsyncMock(return_value=mock_assessment)
            a_repo_class.return_value.create_question = AsyncMock()

            # Mock db.refresh
            mock_db = MagicMock()
            mock_db.refresh = AsyncMock()
            a_repo_class.return_value._session = mock_db

            response = app_client.post(
                "/api/v1/assessments",
                json={"invitation_id": 1, "template_id": 1},
            )

            # Assessment starts even if no questions match (uses what's available)
            assert response.status_code == 201

    def test_invitation_not_found(self, app_client):
        with patch(
            "app.domains.assessments.services.assessment_service.InvitationRepository",
        ) as inv_repo_class:
            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=None)

            response = app_client.post(
                "/api/v1/assessments",
                json={"invitation_id": 999, "template_id": 1},
            )

            assert response.status_code == 404

    def test_invitation_used(self, app_client, mock_invitation):
        mock_invitation.used = True
        with patch(
            "app.domains.assessments.services.assessment_service.InvitationRepository",
        ) as inv_repo_class:
            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_invitation)

            response = app_client.post(
                "/api/v1/assessments",
                json={"invitation_id": 1, "template_id": 1},
            )

            assert response.status_code == 400
            assert "já utilizado" in response.json()["description"]


class TestPatchAssessment:
    def test_finish_success(self, app_client, mock_assessment, mock_invitation):
        from datetime import UTC, datetime

        now = datetime.now(UTC)
        mock_assessment.start_time = now
        with (
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as a_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.InvitationRepository",
            ) as inv_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.TemplateRepository",
            ) as tpl_repo_class,
        ):
            a_repo = a_repo_class.return_value
            a_repo.get_by_id = AsyncMock(return_value=mock_assessment)
            a_repo.get_answer = AsyncMock(return_value=None)
            a_repo.create_answer = AsyncMock()
            a_repo.update = AsyncMock()

            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_invitation)

            tpl = MagicMock()
            tpl.duration_minutes = 999
            tpl_repo = tpl_repo_class.return_value
            tpl_repo.get_by_id = AsyncMock(return_value=tpl)

            response = app_client.patch(
                "/api/v1/assessments/1",
                json={
                    "answers": [
                        {"question_id": 1, "selected_alternative_id": 1, "time_spent_seconds": 30},
                    ],
                    "status": "FINISHED",
                },
                headers={"X-Invitation-Token": "abc-123"},
            )

            assert response.status_code == 200
            assert response.json()["description"] == "Avaliação atualizada com sucesso"

    def test_not_found(self, app_client):
        with patch(
            "app.domains.assessments.services.assessment_service.AssessmentRepository",
        ) as a_repo_class:
            a_repo_class.return_value.get_by_id = AsyncMock(return_value=None)

            response = app_client.patch(
                "/api/v1/assessments/999",
                json={"status": "FINISHED"},
                headers={"X-Invitation-Token": "abc-123"},
            )

            assert response.status_code == 404

    def test_already_finished(self, app_client, mock_assessment, mock_invitation):
        mock_assessment.status = "FINISHED"
        with (
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as a_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.InvitationRepository",
            ) as inv_repo_class,
        ):
            a_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_assessment)
            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_invitation)

            response = app_client.patch(
                "/api/v1/assessments/1",
                json={"status": "FINISHED"},
                headers={"X-Invitation-Token": "abc-123"},
            )

            assert response.status_code == 400

    def test_invalid_token(self, app_client, mock_assessment, mock_invitation):
        with (
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as a_repo_class,
            patch(
                "app.domains.assessments.services.assessment_service.InvitationRepository",
            ) as inv_repo_class,
        ):
            a_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_assessment)
            inv_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_invitation)

            response = app_client.patch(
                "/api/v1/assessments/1",
                json={"status": "FINISHED"},
                headers={"X-Invitation-Token": "wrong-token"},
            )

            assert response.status_code == 401
            data = response.json()
            assert "inválido" in data["description"].lower()


STATS_PAYLOAD = {
    "total_assessments": 10,
    "average_percentage": 75.0,
    "total_questions_evaluated": 100,
}


class TestGetStats:
    def test_general(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_general_stats = AsyncMock(return_value=MagicMock(**STATS_PAYLOAD))

            response = app_client.get("/api/v1/assessments/stats", headers=auth_header)

            assert response.status_code == 200
            body = response.json()
            assert body["total_assessments"] == 10

    def test_group(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_theme_gaps_by_group = AsyncMock(return_value=[])

            response = app_client.get(
                "/api/v1/assessments/stats?group_by=cargo&group_value=Developer",
                headers=auth_header,
            )

            assert response.status_code == 200
            assert response.json()["group_by"] == "cargo"

    def test_invalid_group(self, app_client, auth_header):
        with patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt:
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            response = app_client.get(
                "/api/v1/assessments/stats?group_by=invalid&group_value=x",
                headers=auth_header,
            )

            assert response.status_code == 400

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/assessments/stats")
        assert response.status_code == 401
