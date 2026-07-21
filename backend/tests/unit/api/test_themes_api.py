from unittest.mock import AsyncMock, patch


class TestListThemes:
    def test_success(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_theme])

            response = app_client.get("/api/v1/themes", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Python"

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/themes", headers=auth_header)

            assert response.status_code == 200
            assert response.json() == []

    def test_public_access(self, app_client):
        response = app_client.get("/api/v1/themes")

        assert response.status_code == 401


class TestGetTheme:
    def test_success(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_theme)

            response = app_client.get("/api/v1/themes/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["name"] == "Python"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/themes/999", headers=auth_header)

            assert response.status_code == 404
            assert response.json()["description"] == "Tema não encontrado"

    def test_public_access_not_found(self, app_client):
        response = app_client.get("/api/v1/themes/999")

        assert response.status_code == 401


class TestCreateTheme:
    def test_success(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_name = AsyncMock(return_value=None)
            mock_repo.create = AsyncMock(return_value=mock_theme)

            response = app_client.post(
                "/api/v1/themes",
                json={"name": "Python", "description": "Python fundamentals"},
                headers=auth_header,
            )

            assert response.status_code == 201
            body = response.json()
            assert body["code"] == 201
            assert body["description"] == "Tema criado com sucesso"
            assert body["data"]["name"] == "Python"

    def test_name_conflict(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_name = AsyncMock(return_value=mock_theme)

            response = app_client.post(
                "/api/v1/themes",
                json={"name": "Python", "description": "Duplicate"},
                headers=auth_header,
            )

            assert response.status_code == 400
            assert response.json()["description"] == "Nome do tema já existe"

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/themes",
            json={"name": "Python", "description": "Test"},
        )

        assert response.status_code == 401


class TestUpdateTheme:
    def test_success(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_theme)
            mock_repo.get_by_name = AsyncMock(return_value=None)
            mock_repo.update = AsyncMock(return_value=mock_theme)

            response = app_client.put(
                "/api/v1/themes/1",
                json={"name": "Python", "description": "Updated"},
                headers=auth_header,
            )

            assert response.status_code == 200
            assert response.json()["description"] == "Tema atualizado com sucesso"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/themes/999",
                json={"name": "Python", "description": "Nope"},
                headers=auth_header,
            )

            assert response.status_code == 404


class TestDeleteTheme:
    def test_success(self, app_client, mock_theme, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_theme)
            mock_repo.delete = AsyncMock()

            response = app_client.delete("/api/v1/themes/1", headers=auth_header)

            assert response.status_code == 204

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.themes.services.theme_service.ThemeRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/themes/999", headers=auth_header)

            assert response.status_code == 404
