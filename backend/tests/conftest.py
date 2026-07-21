from __future__ import annotations

import os
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, Mock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

os.environ.setdefault("APP_NAME", "FastAPI Base Project")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("API_V1_PREFIX", "/api/v1")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-testing-purposes")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "30")
os.environ.setdefault("HTTP_LOG_CAPTURE_RESPONSE_BODY", "false")
os.environ.setdefault("HTTP_LOG_MAX_BODY_SIZE", "5000")
os.environ.setdefault("ENABLE_MOCK_MODE", "false")
os.environ.setdefault("ENABLE_AUTHENTICATION", "true")
os.environ.setdefault("ENABLE_EMAIL_SENDING", "true")
os.environ.setdefault("ENABLE_FOCUS_MONITORING", "true")
os.environ.setdefault("ENABLE_AUTO_TERMINATION", "true")
os.environ.setdefault("ENABLE_AUDIT_LOG", "true")
os.environ.setdefault("RATE_LIMIT_LOGIN", "100/minute")
os.environ.setdefault("RATE_LIMIT_TOKEN", "100/minute")
os.environ.setdefault("RATE_LIMIT_REFRESH", "100/minute")

from app.db.base import import_models

import_models()


@pytest.fixture
def mock_db_session() -> AsyncMock:
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()

    result = MagicMock()
    result.scalar_one_or_none = MagicMock(return_value=None)

    scalar_result = MagicMock()
    scalar_result.all = MagicMock(return_value=[])
    result.scalars = MagicMock(return_value=scalar_result)

    session.execute.return_value = result

    return session


@pytest.fixture
def mock_role_admin() -> Mock:
    role = Mock()
    role.id = 1
    role.description = "ADMIN"
    return role


@pytest.fixture
def mock_role_user() -> Mock:
    role = Mock()
    role.id = 2
    role.description = "USER"
    return role


@pytest.fixture
def mock_user(mock_role_admin, mock_role_user) -> Mock:
    user = Mock()
    user.id = 1
    user.name = "Admin"
    user.email = "admin@example.com"
    user.username = "admin"
    user.password_hash = "$argon2id$v=19$m=65536,t=3,p=4$testhash"
    user.client_id = "a1b2c3d4e5f6g7h8"
    user.client_secret = "s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6"
    user.enabled = True
    user.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    user.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    user.deleted_at = None
    user.roles = [mock_role_admin, mock_role_user]
    return user


@pytest.fixture
def mock_user_no_roles() -> Mock:
    user = Mock()
    user.id = 3
    user.email = "noroles@example.com"
    user.username = "noroles"
    user.password_hash = "$argon2id$v=19$m=65536,t=3,p=4$testhash"
    user.client_id = "client-no-roles"
    user.client_secret = "secret-no-roles"
    user.enabled = True
    user.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    user.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    user.deleted_at = None
    user.roles = []
    return user
