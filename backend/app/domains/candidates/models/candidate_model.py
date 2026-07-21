from datetime import UTC, datetime

from sqlalchemy import DateTime, String, Text  # noqa: F401
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Candidate(Base):
    """Modelo que representa um candidato a avaliação.

    Candidatos não fazem login no sistema — são cadastrados para participar
    de avaliações através de convites.
    """

    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="CANDIDATE",
    )

    cargo: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    setor: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    nivel: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    squad: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
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

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
