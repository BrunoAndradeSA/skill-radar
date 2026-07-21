from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.assessments.models.assessment_answer_model import AssessmentAnswer
    from app.domains.assessments.models.assessment_question_model import AssessmentQuestion


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    invitation_id: Mapped[int] = mapped_column(
        ForeignKey("exam_invitations.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
        index=True,
    )

    template_id: Mapped[int] = mapped_column(
        ForeignKey("exam_templates.id", ondelete="RESTRICT"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="IN_PROGRESS", index=True
    )

    score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    percentage: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )

    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    focus_lost_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    is_terminated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    questions: Mapped[list[AssessmentQuestion]] = relationship(
        back_populates="assessment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    answers: Mapped[list[AssessmentAnswer]] = relationship(
        back_populates="assessment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
