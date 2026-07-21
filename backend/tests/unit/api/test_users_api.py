from unittest.mock import AsyncMock, MagicMock, patch


class TestListUsers:
    def test_success(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_user_data])

            response = app_client.get("/api/v1/users", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["email"] == "admin@test.com"
            assert "ADMIN" in data[0]["roles"]

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/users", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []

    def test_filters(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_user_data])

            response = app_client.get(
                "/api/v1/users?id=1&email=admin&name=Admin",
                headers=auth_header,
            )

            assert response.status_code == 200
            mock_repo.list_all.assert_awaited_with(user_id=1, email="admin", name="Admin")

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/users")
        assert response.status_code == 401


class TestGetUser:
    def test_success(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_user_data)

            response = app_client.get("/api/v1/users/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["email"] == "admin@test.com"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/users/999", headers=auth_header)
            assert response.status_code == 404


class TestGetUserByEmail:
    def test_success(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=mock_user_data)

            response = app_client.get("/api/v1/users/email/admin@test.com", headers=auth_header)

            assert response.status_code == 200

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/users/email/none@test.com", headers=auth_header)
            assert response.status_code == 404


class TestGetUserStats:
    def test_success(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.assessments.services.assessment_service.AssessmentRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_user_stats = AsyncMock(return_value=(5, 80.0, []))

            response = app_client.get("/api/v1/users/1/stats", headers=auth_header)

            assert response.status_code == 200
            body = response.json()
            assert body["total_assessments"] == 5


class TestCreateUser:
    CREATE_PAYLOAD = {
        "name": "New User",
        "email": "new@test.com",
        "password": "pass123",
        "roles": ["ADMIN"],
    }

    def test_success(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=None)
            mock_repo.get_roles_by_descriptions = AsyncMock(return_value=[MagicMock()])
            mock_repo.assign_roles = AsyncMock()

            admin_role = MagicMock()
            admin_role.description = "ADMIN"

            created = MagicMock()
            created.id = 2
            created.name = "New User"
            created.email = "new@test.com"
            created.enabled = True
            created.username = "new"
            created.roles = [admin_role]
            from datetime import UTC, datetime

            created.created_at = datetime(2026, 1, 1, tzinfo=UTC)
            created.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
            created.deleted_at = None
            mock_repo.create = AsyncMock(return_value=created)

            response = app_client.post(
                "/api/v1/users",
                json=self.CREATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 201
            assert response.json()["data"]["email"] == "new@test.com"

    def test_duplicate_email(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_email = AsyncMock(return_value=MagicMock())

            response = app_client.post(
                "/api/v1/users",
                json=self.CREATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 400
            assert "E-mail já cadastrado" in response.json()["description"]

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/users",
            json=self.CREATE_PAYLOAD,
        )
        assert response.status_code == 401


class TestUpdateUser:
    def test_success(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_user_data)
            mock_repo.update = AsyncMock()

            response = app_client.put(
                "/api/v1/users/1",
                json={"name": "Updated"},
                headers=auth_header,
            )

            assert response.status_code == 200

    def test_no_fields(self, app_client, auth_header):
        with patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt:
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            response = app_client.put(
                "/api/v1/users/1",
                json={},
                headers=auth_header,
            )

            assert response.status_code == 400
            assert "Nenhum campo" in response.json()["description"]

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/users/999",
                json={"name": "Updated"},
                headers=auth_header,
            )

            assert response.status_code == 404


class TestDeleteUser:
    def test_success(self, app_client, mock_user_data, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_user_data)
            mock_repo.soft_delete = AsyncMock()

            response = app_client.delete("/api/v1/users/1", headers=auth_header)

            assert response.status_code == 200

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.users.services.user_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/users/999", headers=auth_header)
            assert response.status_code == 404
