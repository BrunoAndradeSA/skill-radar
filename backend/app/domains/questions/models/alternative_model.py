from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.domains.questions.models.question_model import Question


class Alternative(Base):
    __tablename__ = "alternatives"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    text: Mapped[str] = mapped_column(Text, nullable=False)

    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    order: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    question: Mapped[Question] = relationship(back_populates="alternatives")
