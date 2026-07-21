from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SelectionProcess(Base):
    __tablename__ = "selection_processes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    cargo: Mapped[str] = mapped_column(String(100), nullable=False)

    nivel: Mapped[str] = mapped_column(String(50), nullable=False)

    setor: Mapped[str] = mapped_column(String(100), nullable=False)

    squad: Mapped[str] = mapped_column(String(50), nullable=False)

    template_id: Mapped[int] = mapped_column(
        ForeignKey("exam_templates.id", ondelete="RESTRICT"),
        nullable=False,
    )

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

    invitations = relationship(
        "ExamInvitation",
        back_populates="selection_process",
        lazy="selectin",
    )
