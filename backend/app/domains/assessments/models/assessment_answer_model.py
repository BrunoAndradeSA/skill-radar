from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.assessments.models.assessment_model import Assessment


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    assessment_id: Mapped[int] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False,
    )

    selected_alternative_id: Mapped[int | None] = mapped_column(
        ForeignKey("alternatives.id", ondelete="SET NULL"),
        nullable=True,
    )

    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    time_spent_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    assessment: Mapped[Assessment] = relationship(back_populates="answers")
