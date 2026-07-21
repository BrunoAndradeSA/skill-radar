from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.assessments.models.assessment_model import Assessment
    from app.domains.questions.models.question_model import Question


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

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

    order: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    assessment: Mapped[Assessment] = relationship(back_populates="questions")

    question: Mapped[Question] = relationship(lazy="selectin")
