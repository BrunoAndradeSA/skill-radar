from unittest.mock import AsyncMock, patch


class TestListTemplates:
    def test_success(self, app_client, mock_template, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_template])

            response = app_client.get("/api/v1/templates", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Test Template"

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/templates", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/templates")
        assert response.status_code == 401


class TestGetTemplate:
    def test_success(self, app_client, mock_template, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_template)

            response = app_client.get("/api/v1/templates/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["name"] == "Test Template"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/templates/999", headers=auth_header)
            assert response.status_code == 404

    def test_public_access_not_found(self, app_client):
        with patch(
            "app.domains.templates.services.template_service.TemplateRepository",
        ) as mock_repo_class:
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/templates/999")

            assert response.status_code == 401


class TestCreateTemplate:
    CREATE_PAYLOAD = {
        "name": "New Template",
        "description": "Desc",
        "seniority": "Pleno",
        "duration_minutes": 60,
        "is_certification": False,
        "themes": [
            {"theme_id": 1, "question_count": 5, "competency_ids": []},
        ],
    }

    def test_success(self, app_client, mock_template, auth_header):
        mock_template.themes = []
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_name = AsyncMock(return_value=None)
            mock_repo.create = AsyncMock(return_value=mock_template)
            mock_repo.add_theme = AsyncMock()
            mock_repo.clear_themes = AsyncMock()

            response = app_client.post(
                "/api/v1/templates",
                json=self.CREATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 201
            assert response.json()["data"]["name"] == "Test Template"

    def test_name_conflict(self, app_client, mock_template, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_name = AsyncMock(return_value=mock_template)

            response = app_client.post(
                "/api/v1/templates",
                json=self.CREATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 400

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/templates",
            json=self.CREATE_PAYLOAD,
        )
        assert response.status_code == 401


class TestUpdateTemplate:
    UPDATE_PAYLOAD = {
        "name": "Updated",
        "description": "Updated",
        "seniority": "Sênior",
        "duration_minutes": 90,
        "is_certification": True,
        "themes": [
            {"theme_id": 1, "question_count": 5, "competency_ids": []},
        ],
    }

    def test_success(self, app_client, mock_template, auth_header):
        mock_template.themes = []
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_template)
            mock_repo.update = AsyncMock(return_value=mock_template)
            mock_repo.add_theme = AsyncMock()
            mock_repo.clear_themes = AsyncMock()

            response = app_client.put(
                "/api/v1/templates/1",
                json=self.UPDATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 200

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/templates/999",
                json=self.UPDATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 404


class TestDeleteTemplate:
    def test_success(self, app_client, mock_template, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_template)
            mock_repo.delete = AsyncMock()

            response = app_client.delete("/api/v1/templates/1", headers=auth_header)
            assert response.status_code == 204

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.templates.services.template_service.TemplateRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/templates/999", headers=auth_header)
            assert response.status_code == 404
