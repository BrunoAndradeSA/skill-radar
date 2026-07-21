from unittest.mock import AsyncMock, patch


class TestListQuestions:
    def test_success(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_question])

            response = app_client.get("/api/v1/questions", headers=auth_header)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["text"] == "What is Python?"

    def test_filters(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[mock_question])

            response = app_client.get(
                "/api/v1/questions?theme_id=1&seniority=Júnior&type=NORMAL",
                headers=auth_header,
            )

            assert response.status_code == 200
            mock_repo.list_all.assert_awaited_with(theme_id=1, seniority="Júnior", type="NORMAL")

    def test_empty(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.list_all = AsyncMock(return_value=[])

            response = app_client.get("/api/v1/questions", headers=auth_header)
            assert response.status_code == 200
            assert response.json() == []

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/questions")
        assert response.status_code == 401


class TestGetQuestion:
    def test_success(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=mock_question)

            response = app_client.get("/api/v1/questions/1", headers=auth_header)

            assert response.status_code == 200
            assert response.json()["text"] == "What is Python?"

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as mock_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            mock_repo = mock_repo_class.return_value
            mock_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.get("/api/v1/questions/999", headers=auth_header)
            assert response.status_code == 404

    def test_requires_admin(self, app_client):
        response = app_client.get("/api/v1/questions/1")
        assert response.status_code == 401


class TestCreateQuestion:
    CREATE_PAYLOAD = {
        "theme_id": 1,
        "competency_ids": [],
        "type": "NORMAL",
        "seniority": "Júnior",
        "text": "What is Python?",
        "explanation": "Python is a language",
        "alternatives": [
            {"text": "Correct", "is_correct": True},
            {"text": "Wrong", "is_correct": False},
        ],
    }

    def test_success(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as q_repo_class,
            patch(
                "app.domains.questions.services.question_service.AlternativeRepository",
            ) as a_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            q_repo = q_repo_class.return_value
            q_repo.create = AsyncMock(return_value=mock_question)
            q_repo.sync_competencies = AsyncMock()
            a_repo = a_repo_class.return_value
            a_repo.create = AsyncMock()

            response = app_client.post(
                "/api/v1/questions",
                json=self.CREATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 201
            assert response.json()["data"]["text"] == "What is Python?"

    def test_invalid_alternatives(self, app_client, auth_header):
        with patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt:
            mock_jwt.return_value = {"roles": ["ADMIN"]}

            response = app_client.post(
                "/api/v1/questions",
                json={
                    "theme_id": 1,
                    "competency_ids": [],
                    "type": "NORMAL",
                    "seniority": "Júnior",
                    "text": "Q",
                    "alternatives": [
                        {"text": "A", "is_correct": True},
                        {"text": "B", "is_correct": True},
                    ],
                },
                headers=auth_header,
            )

            assert response.status_code == 400
            assert "Exatamente uma alternativa" in response.json()["description"]

    def test_requires_admin(self, app_client):
        response = app_client.post(
            "/api/v1/questions",
            json=self.CREATE_PAYLOAD,
        )
        assert response.status_code == 401


class TestUpdateQuestion:
    UPDATE_PAYLOAD = {
        "theme_id": 1,
        "competency_ids": [],
        "type": "NORMAL",
        "seniority": "Júnior",
        "text": "Updated?",
        "explanation": "Updated",
        "alternatives": [
            {"text": "Correct", "is_correct": True},
            {"text": "Wrong", "is_correct": False},
        ],
    }

    def test_success(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as q_repo_class,
            patch(
                "app.domains.questions.services.question_service.AlternativeRepository",
            ) as a_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            q_repo = q_repo_class.return_value
            q_repo.get_by_id = AsyncMock(return_value=mock_question)
            q_repo.update = AsyncMock(return_value=mock_question)
            q_repo.sync_competencies = AsyncMock()
            a_repo = a_repo_class.return_value
            a_repo.delete_by_question = AsyncMock()
            a_repo.create = AsyncMock()

            response = app_client.put(
                "/api/v1/questions/1",
                json=self.UPDATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 200

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as q_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            q_repo = q_repo_class.return_value
            q_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.put(
                "/api/v1/questions/999",
                json=self.UPDATE_PAYLOAD,
                headers=auth_header,
            )

            assert response.status_code == 404


class TestDeleteQuestion:
    def test_success(self, app_client, mock_question, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as q_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            q_repo = q_repo_class.return_value
            q_repo.get_by_id = AsyncMock(return_value=mock_question)
            q_repo.delete = AsyncMock()

            response = app_client.delete("/api/v1/questions/1", headers=auth_header)
            assert response.status_code == 204

    def test_not_found(self, app_client, auth_header):
        with (
            patch("app.domains.auth.dependencies.jwt.decode") as mock_jwt,
            patch(
                "app.domains.questions.services.question_service.QuestionRepository",
            ) as q_repo_class,
        ):
            mock_jwt.return_value = {"roles": ["ADMIN"]}
            q_repo = q_repo_class.return_value
            q_repo.get_by_id = AsyncMock(return_value=None)

            response = app_client.delete("/api/v1/questions/999", headers=auth_header)
            assert response.status_code == 404
