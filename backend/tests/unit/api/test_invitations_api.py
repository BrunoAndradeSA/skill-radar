from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch


class TestListInvitations:
    def test_success(self, app_client, mock_invitation, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_invitation])

            response = app_client.get("/api/v1/invitations", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["candidate_name"] == "John"

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/invitations", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []


class TestGetInvitation:
    def test_success(self, app_client, mock_invitation, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_invitation)

            response = app_client.get("/api/v1/invitations/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["candidate_email"] == "john@test.com"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/invitations/999", headers=auth_header)
            assert response.status_code == 404

    def test_public_access_not_found(self, app_client):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/invitations/999")

            assert response.status_code == 401


class TestGetInvitationByToken:
    def test_success(self, app_client, mock_invitation):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=mock_invitation)

            response = app_client.get("/api/v1/invitations/token/abc-123")

            assert response.status_code == 200
            assert response.json()["candidate_name"] == "John"

    def test_not_found(self, app_client):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/invitations/token/invalid")
            assert response.status_code == 404


class TestCreateInvitation:
    def test_success(self, app_client, mock_invitation, mock_template, auth_header):
        future = (datetime.now(UTC) + timedelta(days=30)).isoformat()
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.invitations.services.invitation_service.TemplateRepository",
            ) as mock_tpl_class,
            patch(
                "app.domains.invitations.services.invitation_service.QuestionRepository",
            ) as mock_q_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.create = AsyncMock(return_value=mock_invitation)
            mock_tpl_class.return_value.get_by_id = AsyncMock(return_value=mock_template)
            mock_q_class.return_value.count_by_theme_and_seniority = AsyncMock(return_value=1)

            response = app_client.post(
                "/api/v1/invitations",
                json={
                    "template_id": 1,
                    "candidate_name": "John",
                    "candidate_email": "john@test.com",
                    "expires_at": future,
                },
                headers=auth_header,
            )

            assert response.status_code == 201
            assert response.json()["data"]["candidate_name"] == "John"

    def test_expired_date(self, app_client, auth_header):
        past = (datetime.now(UTC) - timedelta(days=1)).isoformat()
        with patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt:
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            response = app_client.post(
                "/api/v1/invitations",
                json={
                    "template_id": 1,
                    "candidate_name": "John",
                    "candidate_email": "john@test.com",
                    "expires_at": past,
                },
                headers=auth_header,
            )

            assert response.status_code == 400

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/invitations",
            json={
                "template_id": 1,
                "candidate_name": "John",
                "candidate_email": "john@test.com",
                "expires_at": (datetime.now(UTC) + timedelta(days=30)).isoformat(),
            },
        )
        assert response.status_code == 401


class TestUpdateInvitation:
    def test_success(self, app_client, mock_invitation, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_invitation)
            mock_repo.update = AsyncMock(return_value=mock_invitation)

            response = app_client.patch(
                "/api/v1/invitations/1",
                json={"candidate_name": "Jane"},
                headers=auth_header,
            )

            assert response.status_code == 200
            assert response.json()["description"] == "Convite atualizado com sucesso"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.patch(
                "/api/v1/invitations/999",
                json={"candidate_name": "Jane"},
                headers=auth_header,
            )
            assert response.status_code == 404


class TestValidateInvitation:
    def test_success(self, app_client, mock_invitation):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=mock_invitation)

            response = app_client.post(
                "/api/v1/invitations/validate",
                json={"token": "abc-123", "access_code": "XYZ789"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["code"] == 200
            assert data["description"] == "Convite validado com sucesso"
            assert data["data"]["token"] == "abc-123"

    def test_token_not_found(self, app_client):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=None)

            response = app_client.post(
                "/api/v1/invitations/validate",
                json={"token": "invalid", "access_code": "XYZ789"},
            )

            assert response.status_code == 404
            data = response.json()
            assert "não encontrado" in data["description"].lower()

    def test_wrong_access_code(self, app_client, mock_invitation):
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=mock_invitation)

            response = app_client.post(
                "/api/v1/invitations/validate",
                json={"token": "abc-123", "access_code": "WRONG"},
            )

            assert response.status_code == 400
            data = response.json()
            assert "inválido" in data["description"].lower()

    def test_already_used(self, app_client, mock_invitation):
        mock_invitation.used = True
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=mock_invitation)

            response = app_client.post(
                "/api/v1/invitations/validate",
                json={"token": "abc-123", "access_code": "XYZ789"},
            )

            assert response.status_code == 400
            data = response.json()
            assert "utilizado" in data["description"].lower()

    def test_expired(self, app_client, mock_invitation):
        from datetime import UTC, datetime

        mock_invitation.expires_at = datetime(2020, 1, 1, tzinfo=UTC)
        with patch(
            "app.domains.invitations.services.invitation_service.InvitationRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_token = AsyncMock(return_value=mock_invitation)

            response = app_client.post(
                "/api/v1/invitations/validate",
                json={"token": "abc-123", "access_code": "XYZ789"},
            )

            assert response.status_code == 400
            data = response.json()
            assert "expirado" in data["description"].lower()


class TestDeleteInvitation:
    def test_success(self, app_client, mock_invitation, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_invitation)
            mock_repo.delete = AsyncMock()

            response = app_client.delete("/api/v1/invitations/1", headers=auth_header)
            assert response.status_code == 204

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.invitations.services.invitation_service.InvitationRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/invitations/999", headers=auth_header)
            assert response.status_code == 404
