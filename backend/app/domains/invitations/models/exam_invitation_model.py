from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ExamInvitation(Base):
    __tablename__ = "exam_invitations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    template_id: Mapped[int] = mapped_column(
        ForeignKey("exam_templates.id", ondelete="RESTRICT"),
        nullable=False,
    )

    candidate_id: Mapped[int | None] = mapped_column(
        ForeignKey("candidates.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    selection_process_id: Mapped[int | None] = mapped_column(
        ForeignKey("selection_processes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False)

    candidate_email: Mapped[str] = mapped_column(String(255), nullable=False)

    cargo: Mapped[str | None] = mapped_column(String(100), nullable=True)

    squad: Mapped[str | None] = mapped_column(String(50), nullable=True)

    setor: Mapped[str | None] = mapped_column(String(100), nullable=True)

    nivel: Mapped[str | None] = mapped_column(String(50), nullable=True)

    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    access_code: Mapped[str] = mapped_column(String(10), nullable=False)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    is_external: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

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

    selection_process = relationship(
        "SelectionProcess",
        back_populates="invitations",
        lazy="selectin",
    )
