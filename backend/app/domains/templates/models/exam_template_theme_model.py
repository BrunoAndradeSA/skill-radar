from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.competencies.models.competency_model import Competency
    from app.domains.templates.models.exam_template_model import ExamTemplate


class ExamTemplateTheme(Base):
    __tablename__ = "exam_template_themes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    template_id: Mapped[int] = mapped_column(
        ForeignKey("exam_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    theme_id: Mapped[int] = mapped_column(
        ForeignKey("themes.id", ondelete="RESTRICT"),
        nullable=False,
    )

    question_count: Mapped[int] = mapped_column(Integer, nullable=False)

    template: Mapped[ExamTemplate] = relationship(back_populates="themes")

    competencies: Mapped[list[Competency]] = relationship(
        secondary="exam_template_theme_competencies",
        lazy="selectin",
    )
