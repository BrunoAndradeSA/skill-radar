from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.competencies.models.competency_model import Competency
    from app.domains.questions.models.alternative_model import Alternative
    from app.domains.themes.models.theme_model import Theme


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    theme_id: Mapped[int] = mapped_column(
        ForeignKey("themes.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    theme: Mapped[Theme] = relationship(lazy="selectin")

    type: Mapped[str] = mapped_column(String(20), nullable=False, default="NORMAL")

    seniority: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    text: Mapped[str] = mapped_column(Text, nullable=False)

    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

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

    alternatives: Mapped[list[Alternative]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    competencies: Mapped[list[Competency]] = relationship(
        secondary="question_competencies",
        lazy="selectin",
    )
