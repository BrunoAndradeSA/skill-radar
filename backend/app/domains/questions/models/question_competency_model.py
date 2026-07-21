from sqlalchemy import Column, ForeignKey, Integer, Table

from app.db.base import Base

question_competencies = Table(
    "question_competencies",
    Base.metadata,
    Column(
        "question_id", Integer, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "competency_id",
        Integer,
        ForeignKey("competencies.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
