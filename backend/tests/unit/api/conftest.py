from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.database.dependencies import get_db_session
from app.main import app


@pytest.fixture
def mock_theme() -> MagicMock:
    from datetime import UTC, datetime

    theme = MagicMock()
    theme.id = 1
    theme.name = "Python"
    theme.description = "Python fundamentals"
    theme.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    theme.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return theme


@pytest.fixture
def mock_competency() -> MagicMock:
    from datetime import UTC, datetime

    c = MagicMock()
    c.id = 1
    c.theme_id = 1
    c.name = "Variables"
    c.description = "Variable assignment"
    c.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    c.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return c


@pytest.fixture
def mock_alternative() -> MagicMock:
    a = MagicMock()
    a.id = 1
    a.text = "Answer A"
    a.is_correct = True
    a.order = 0
    return a


@pytest.fixture
def mock_question(mock_alternative) -> MagicMock:
    from datetime import UTC, datetime

    q = MagicMock()
    q.id = 1
    q.theme_id = 1
    q.type = "NORMAL"
    q.seniority = "Júnior"
    q.text = "What is Python?"
    q.explanation = "Python is a language"
    q.competencies = []
    q.alternatives = [mock_alternative]
    q.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    q.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return q


@pytest.fixture
def mock_template() -> MagicMock:
    from datetime import UTC, datetime

    t = MagicMock()
    t.id = 1
    t.name = "Test Template"
    t.description = "A template"
    t.seniority = "Pleno"
    t.duration_minutes = 60
    t.is_certification = False
    t.themes = []
    t.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    t.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return t


@pytest.fixture
def mock_invitation() -> MagicMock:
    from datetime import UTC, datetime

    i = MagicMock()
    i.id = 1
    i.template_id = 1
    i.user_id = 1
    i.candidate_name = "John"
    i.candidate_email = "john@test.com"
    i.cargo = "Developer"
    i.squad = "Squad A"
    i.setor = "Tech"
    i.nivel = "Junior"
    i.token = "abc-123"
    i.access_code = "XYZ789"
    i.expires_at = datetime(2026, 12, 31, tzinfo=UTC)
    i.used = False
    i.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    i.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return i


@pytest.fixture
def mock_assessment() -> MagicMock:
    from datetime import UTC, datetime

    a = MagicMock()
    a.id = 1
    a.invitation_id = 1
    a.template_id = 1
    a.status = "IN_PROGRESS"
    a.start_time = datetime(2026, 6, 1, tzinfo=UTC)
    a.end_time = None
    a.duration_seconds = 3600
    a.score = None
    a.percentage = None
    a.focus_lost_count = 0
    a.is_terminated = False
    a.questions = []
    a.answers = []
    a.created_at = datetime(2026, 6, 1, tzinfo=UTC)
    a.updated_at = datetime(2026, 6, 1, tzinfo=UTC)
    return a


@pytest.fixture
def mock_candidate() -> MagicMock:
    from datetime import UTC, datetime

    c = MagicMock()
    c.id = 1
    c.name = "John Doe"
    c.email = "john@test.com"
    c.role = "CANDIDATE"
    c.cargo = "Developer"
    c.squad = "Squad A"
    c.setor = "Tech"
    c.nivel = "Junior"
    c.deleted_at = None
    c.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    c.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return c


@pytest.fixture
def mock_user_data() -> MagicMock:
    from datetime import UTC, datetime

    admin_role = MagicMock()
    admin_role.description = "ADMIN"

    u = MagicMock()
    u.id = 1
    u.name = "Admin"
    u.email = "admin@test.com"
    u.roles = [admin_role]
    u.enabled = True
    u.deleted_at = None
    u.client_secret = "$argon2id$v=19$m=65536,t=3,p=4$testhash"
    u.created_at = datetime(2026, 1, 1, tzinfo=UTC)
    u.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    return u


@pytest.fixture
def app_client(mock_db_session) -> TestClient:
    async def override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db_session] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_header() -> dict[str, str]:
    return {"Authorization": "Bearer test-token"}
