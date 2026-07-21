from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Classe base declarativa do SQLAlchemy para todos os modelos do banco."""


def import_models() -> None:
    """Import all models to register them in Base.metadata.

    Must be called after all modules are loaded (e.g. in lifespan).
    """
    from app.domains.assessments.models.assessment_answer_model import (
        AssessmentAnswer,  # noqa: F401
    )
    from app.domains.assessments.models.assessment_model import Assessment  # noqa: F401
    from app.domains.assessments.models.assessment_question_model import (
        AssessmentQuestion,  # noqa: F401
    )
    from app.domains.auth.models.blacklisted_token_model import BlacklistedToken  # noqa: F401
    from app.domains.auth.models.role_model import Role  # noqa: F401
    from app.domains.auth.models.user_model import User  # noqa: F401
    from app.domains.auth.models.user_role_model import UserRole  # noqa: F401
    from app.domains.candidates.models.candidate_model import Candidate  # noqa: F401
    from app.domains.competencies.models.competency_model import Competency  # noqa: F401
    from app.domains.invitations.models.exam_invitation_model import ExamInvitation  # noqa: F401
    from app.domains.logs.models.request_log_model import RequestLog  # noqa: F401
    from app.domains.questions.models.alternative_model import Alternative  # noqa: F401
    from app.domains.questions.models.question_competency_model import (
        question_competencies,  # noqa: F401
    )
    from app.domains.questions.models.question_model import Question  # noqa: F401
    from app.domains.selection_processes.models.selection_process_model import (
        SelectionProcess,  # noqa: F401
    )
    from app.domains.templates.models.exam_template_model import ExamTemplate  # noqa: F401
    from app.domains.templates.models.exam_template_theme_competency_model import (
        exam_template_theme_competencies,  # noqa: F401
    )
    from app.domains.templates.models.exam_template_theme_model import (
        ExamTemplateTheme,  # noqa: F401
    )
    from app.domains.themes.models.theme_model import Theme  # noqa: F401
