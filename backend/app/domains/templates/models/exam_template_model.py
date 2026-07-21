from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.templates.models.exam_template_theme_model import ExamTemplateTheme


class ExamTemplate(Base):
    __tablename__ = "exam_templates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    seniority: Mapped[str] = mapped_column(String(20), nullable=False)

    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)

    is_certification: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

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

    themes: Mapped[list[ExamTemplateTheme]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
