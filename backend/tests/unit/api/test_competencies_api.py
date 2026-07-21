from unittest.mock import AsyncMock, MagicMock, patch


class TestListCompetencies:
    def test_success(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_competency])

            response = app_client.get("/api/v1/competencies", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Variables"

    def test_filter_by_theme_id(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_competency])

            response = app_client.get(
                "/api/v1/competencies?theme_id=1",
                headers=auth_header,
            )

            assert response.status_code == 200
            mock_repo.list_all.assert_awaited_with(theme_id=1)

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/competencies", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/competencies")
        assert response.status_code == 401


class TestGetCompetency:
    def test_success(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_competency)

            response = app_client.get("/api/v1/competencies/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["name"] == "Variables"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/competencies/999", headers=auth_header)
            assert response.status_code == 404
            assert response.json()["description"] == "Competência não encontrada"

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/competencies/1")
        assert response.status_code == 401


class TestCreateCompetency:
    def test_success(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.ThemeRepository",
            ) as theme_repo_class,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            theme_repo_class.return_value.get_by_id = AsyncMock(return_value=MagicMock())
            mock_repo = mock_repo_class.return_value
            mock_repo.create = AsyncMock(return_value=mock_competency)

            response = app_client.post(
                "/api/v1/competencies",
                json={"theme_id": 1, "name": "Variables", "description": "Var assignment"},
                headers=auth_header,
            )

            assert response.status_code == 201
            assert response.json()["data"]["name"] == "Variables"

    def test_theme_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.ThemeRepository",
            ) as theme_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            theme_repo_class.return_value.get_by_id = AsyncMock(return_value=None)

            response = app_client.post(
                "/api/v1/competencies",
                json={"theme_id": 999, "name": "X", "description": "X"},
                headers=auth_header,
            )

            assert response.status_code == 400
            assert "Tema não encontrado" in response.json()["description"]

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/competencies",
            json={"theme_id": 1, "name": "X", "description": "X"},
        )
        assert response.status_code == 401


class TestUpdateCompetency:
    def test_success(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.ThemeRepository",
            ) as theme_repo_class,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            theme_repo_class.return_value.get_by_id = AsyncMock(return_value=MagicMock())
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_competency)
            mock_repo.update = AsyncMock(return_value=mock_competency)

            response = app_client.put(
                "/api/v1/competencies/1",
                json={"theme_id": 1, "name": "Variables", "description": "Updated"},
                headers=auth_header,
            )

            assert response.status_code == 200
            assert response.json()["description"] == "Competência atualizada com sucesso"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.ThemeRepository",
            ) as theme_repo_class,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            theme_repo_class.return_value.get_by_id = AsyncMock(return_value=MagicMock())
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/competencies/999",
                json={"theme_id": 1, "name": "X", "description": "X"},
                headers=auth_header,
            )

            assert response.status_code == 404


class TestDeleteCompetency:
    def test_success(self, app_client, mock_competency, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_competency)
            mock_repo.delete = AsyncMock()

            response = app_client.delete("/api/v1/competencies/1", headers=auth_header)
            assert response.status_code == 204

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.competencies.services.competency_service.CompetencyRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/competencies/999", headers=auth_header)
            assert response.status_code == 404
