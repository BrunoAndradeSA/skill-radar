from unittest.mock import AsyncMock, MagicMock, patch


class TestLogin:
    def test_success_with_username(self, app_client, mock_user_data):
        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.auth.services.auth_service.PasswordService",
            ) as mock_pw_class,
            patch(
                "app.domains.auth.services.auth_service.JwtService",
            ) as mock_jwt_class,
        ):
            mock_repo_class.return_value.find_active_by_username = AsyncMock(
                return_value=mock_user_data
            )
            mock_pw_class.verify_password = MagicMock(return_value=True)
            mock_jwt_class.generate_token = MagicMock(return_value="jwt-token")
            mock_jwt_class.generate_refresh_token = MagicMock(return_value="refresh-token")

            response = app_client.post(
                "/api/v1/auth/login",
                json={"username": "admin", "password": "admin123"},
            )

            assert response.status_code == 200
            body = response.json()
            assert body["access_token"] == "jwt-token"
            assert body["refresh_token"] == "refresh-token"
            assert body["user"] is not None
            assert body["token_type"] == "Bearer"

    def test_success_with_email(self, app_client, mock_user_data):
        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.auth.services.auth_service.PasswordService",
            ) as mock_pw_class,
            patch(
                "app.domains.auth.services.auth_service.JwtService",
            ) as mock_jwt_class,
        ):
            mock_repo_class.return_value.find_active_by_email = AsyncMock(
                return_value=mock_user_data
            )
            mock_pw_class.verify_password = MagicMock(return_value=True)
            mock_jwt_class.generate_token = MagicMock(return_value="email-token")
            mock_jwt_class.generate_refresh_token = MagicMock(return_value="email-refresh")

            response = app_client.post(
                "/api/v1/auth/login",
                json={"username": "admin@test.com", "password": "admin123"},
            )

            assert response.status_code == 200
            body = response.json()
            assert body["access_token"] == "email-token"
            assert body["refresh_token"] == "email-refresh"
            assert body["user"] is not None

    def test_invalid_credentials(self, app_client):
        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_repo_class.return_value.find_active_by_username = AsyncMock(return_value=None)

            response = app_client.post(
                "/api/v1/auth/login",
                json={"username": "admin", "password": "wrongpass"},
            )

            assert response.status_code == 401

    def test_wrong_password(self, app_client, mock_user_data):
        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.auth.services.auth_service.PasswordService",
            ) as mock_pw_class,
        ):
            mock_repo_class.return_value.find_active_by_username = AsyncMock(
                return_value=mock_user_data
            )
            mock_pw_class.verify_password = MagicMock(return_value=False)

            response = app_client.post(
                "/api/v1/auth/login",
                json={"username": "admin", "password": "wrongpass"},
            )

            assert response.status_code == 401


class TestRefreshToken:
    def test_success(self, app_client, mock_db_session, mock_user_data):
        with (
            patch(
                "app.domains.auth.services.auth_service.JwtService",
            ) as mock_jwt_class,
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt_class.decode_refresh_token = MagicMock(
                return_value={"sub": "1", "type": "refresh", "jti": "test-jti-1", "exp": 9999999999}
            )
            mock_jwt_class.generate_token = MagicMock(return_value="new-access")
            mock_jwt_class.generate_refresh_token = MagicMock(return_value="new-refresh")
            mock_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_user_data)

            response = app_client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": "valid-refresh-token"},
            )

            assert response.status_code == 200
            body = response.json()
            assert body["access_token"] == "new-access"
            assert body["refresh_token"] == "new-refresh"

    def test_invalid_token(self, app_client):
        with patch(
            "app.domains.auth.services.auth_service.JwtService",
        ) as mock_jwt_class:
            mock_jwt_class.decode_refresh_token = MagicMock(return_value=None)

            response = app_client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": "invalid"},
            )

            assert response.status_code == 401


class TestLogout:
    def test_success(self, app_client):
        with patch("jwt.decode") as mock_jwt_decode:
            mock_jwt_decode.return_value = {"sub": "1"}

            response = app_client.post(
                "/api/v1/auth/logout",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 204


class TestMe:
    def test_success(self, app_client, mock_user_data):
        with (
            patch("jwt.decode") as mock_jwt_decode,
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
        ):
            mock_jwt_decode.return_value = {"sub": "1", "jti": "test-jti-me"}
            mock_repo_class.return_value.get_by_id = AsyncMock(return_value=mock_user_data)

            response = app_client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200
            body = response.json()
            assert body["code"] == 200
            assert body["data"]["email"] == "admin@test.com"

    def test_no_token(self, app_client):
        response = app_client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_invalid_token(self, app_client):
        with patch("jwt.decode") as mock_jwt_decode:
            from jwt.exceptions import PyJWTError

            mock_jwt_decode.side_effect = PyJWTError()

            response = app_client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer invalid-token"},
            )

            assert response.status_code == 401


class TestToken:
    def test_success(self, app_client, mock_user_data):
        with (
            patch(
                "app.domains.auth.services.auth_service.UserRepository",
            ) as mock_repo_class,
            patch(
                "app.domains.auth.services.auth_service.PasswordService",
            ) as mock_pw_class,
            patch(
                "app.domains.auth.services.auth_service.JwtService",
            ) as mock_jwt_class,
        ):
            mock_repo_class.return_value.find_active_by_client = AsyncMock(
                return_value=mock_user_data
            )
            mock_pw_class.verify_password = MagicMock(return_value=True)
            mock_jwt_class.generate_token = MagicMock(return_value="api-token")
            mock_jwt_class.generate_refresh_token = MagicMock(return_value="api-refresh")

            response = app_client.post(
                "/api/v1/auth/token",
                json={"client_id": "cid", "client_secret": "csecret123"},
            )

            assert response.status_code == 200
            body = response.json()
            assert body["access_token"] == "api-token"
            assert body["refresh_token"] == "api-refresh"
            assert body["user"] is not None

    def test_invalid(self, app_client):
        with patch(
            "app.domains.auth.services.auth_service.UserRepository",
        ) as mock_repo_class:
            mock_repo_class.return_value.find_active_by_client = AsyncMock(return_value=None)

            response = app_client.post(
                "/api/v1/auth/token",
                json={"client_id": "bad", "client_secret": "badclient"},
            )

            assert response.status_code == 401
