from sqlalchemy import Column, ForeignKey, Integer, Table

from app.db.base import Base

exam_template_theme_competencies = Table(
    "exam_template_theme_competencies",
    Base.metadata,
    Column(
        "template_theme_id",
        Integer,
        ForeignKey("exam_template_themes.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "competency_id",
        Integer,
        ForeignKey("competencies.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
