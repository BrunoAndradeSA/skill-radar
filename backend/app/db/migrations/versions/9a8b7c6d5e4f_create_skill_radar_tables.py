"""Create Skill Radar domain tables

Revision ID: 9a8b7c6d5e4f
Revises: 4a934604db62
Create Date: 2026-06-17 00:00:00.000000

"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from alembic import op

if TYPE_CHECKING:
    from collections.abc import Sequence

revision: str = "9a8b7c6d5e4f"
down_revision: str | None = "4a934604db62"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # -------------------------------------------------------------------------
    # Add Skill Radar columns to users
    # -------------------------------------------------------------------------
    op.add_column("users", sa.Column("name", sa.String(length=255), nullable=True))
    op.add_column(
        "users", sa.Column("role", sa.String(length=20), nullable=False, server_default="CANDIDATE")
    )
    op.add_column("users", sa.Column("cargo", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("setor", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("nivel", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("squad", sa.String(length=50), nullable=True))
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=True)

    op.create_index("ix_users_cargo", "users", ["cargo"])
    op.create_index("ix_users_setor", "users", ["setor"])
    op.create_index("ix_users_nivel", "users", ["nivel"])
    op.create_index("ix_users_squad", "users", ["squad"])

    # -------------------------------------------------------------------------
    # THEMES
    # -------------------------------------------------------------------------
    op.create_table(
        "themes",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # COMPETENCIES
    # -------------------------------------------------------------------------
    op.create_table(
        "competencies",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "theme_id",
            sa.BigInteger(),
            sa.ForeignKey("themes.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # QUESTIONS
    # -------------------------------------------------------------------------
    op.create_table(
        "questions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "theme_id",
            sa.BigInteger(),
            sa.ForeignKey("themes.id", ondelete="RESTRICT"),
            nullable=False,
            index=True,
        ),
        sa.Column("type", sa.String(length=20), nullable=False, server_default="NORMAL"),
        sa.Column("seniority", sa.String(length=20), nullable=False, index=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # ALTERNATIVES
    # -------------------------------------------------------------------------
    op.create_table(
        "alternatives",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "question_id",
            sa.BigInteger(),
            sa.ForeignKey("questions.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("order", sa.SmallInteger(), nullable=False, server_default=sa.text("0")),
    )

    # -------------------------------------------------------------------------
    # QUESTION COMPETENCIES (N:N)
    # -------------------------------------------------------------------------
    op.create_table(
        "question_competencies",
        sa.Column(
            "question_id",
            sa.BigInteger(),
            sa.ForeignKey("questions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "competency_id",
            sa.BigInteger(),
            sa.ForeignKey("competencies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("question_id", "competency_id"),
    )

    # -------------------------------------------------------------------------
    # EXAM TEMPLATES
    # -------------------------------------------------------------------------
    op.create_table(
        "exam_templates",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("seniority", sa.String(length=20), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("is_certification", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # EXAM TEMPLATE THEMES
    # -------------------------------------------------------------------------
    op.create_table(
        "exam_template_themes",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "template_id",
            sa.BigInteger(),
            sa.ForeignKey("exam_templates.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "theme_id",
            sa.BigInteger(),
            sa.ForeignKey("themes.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("question_count", sa.Integer(), nullable=False),
    )

    # -------------------------------------------------------------------------
    # EXAM TEMPLATE THEME COMPETENCIES (N:N)
    # -------------------------------------------------------------------------
    op.create_table(
        "exam_template_theme_competencies",
        sa.Column(
            "template_theme_id",
            sa.BigInteger(),
            sa.ForeignKey("exam_template_themes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "competency_id",
            sa.BigInteger(),
            sa.ForeignKey("competencies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("template_theme_id", "competency_id"),
    )

    # -------------------------------------------------------------------------
    # EXAM INVITATIONS
    # -------------------------------------------------------------------------
    op.create_table(
        "exam_invitations",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "template_id",
            sa.BigInteger(),
            sa.ForeignKey("exam_templates.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        ),
        sa.Column("candidate_name", sa.String(length=255), nullable=False),
        sa.Column("candidate_email", sa.String(length=255), nullable=False),
        sa.Column("cargo", sa.String(length=100), nullable=True),
        sa.Column("squad", sa.String(length=50), nullable=True),
        sa.Column("setor", sa.String(length=100), nullable=True),
        sa.Column("nivel", sa.String(length=50), nullable=True),
        sa.Column("token", sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column("access_code", sa.String(length=10), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # ASSESSMENTS
    # -------------------------------------------------------------------------
    op.create_table(
        "assessments",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "invitation_id",
            sa.BigInteger(),
            sa.ForeignKey("exam_invitations.id", ondelete="RESTRICT"),
            unique=True,
            nullable=False,
            index=True,
        ),
        sa.Column(
            "template_id",
            sa.BigInteger(),
            sa.ForeignKey("exam_templates.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="IN_PROGRESS", index=True
        ),
        sa.Column("score", sa.SmallInteger(), nullable=True),
        sa.Column("percentage", sa.SmallInteger(), nullable=True),
        sa.Column(
            "start_time", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "focus_lost_count", sa.SmallInteger(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column("is_terminated", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )

    # -------------------------------------------------------------------------
    # ASSESSMENT QUESTIONS
    # -------------------------------------------------------------------------
    op.create_table(
        "assessment_questions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "assessment_id",
            sa.BigInteger(),
            sa.ForeignKey("assessments.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "question_id",
            sa.BigInteger(),
            sa.ForeignKey("questions.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("order", sa.SmallInteger(), nullable=False),
    )

    # -------------------------------------------------------------------------
    # ASSESSMENT ANSWERS
    # -------------------------------------------------------------------------
    op.create_table(
        "assessment_answers",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "assessment_id",
            sa.BigInteger(),
            sa.ForeignKey("assessments.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "question_id",
            sa.BigInteger(),
            sa.ForeignKey("questions.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "selected_alternative_id",
            sa.BigInteger(),
            sa.ForeignKey("alternatives.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )


def downgrade() -> None:
    op.drop_table("assessment_answers")
    op.drop_table("assessment_questions")
    op.drop_table("assessments")
    op.drop_table("exam_invitations")
    op.drop_table("exam_template_theme_competencies")
    op.drop_table("exam_template_themes")
    op.drop_table("exam_templates")
    op.drop_table("question_competencies")
    op.drop_table("alternatives")
    op.drop_table("questions")
    op.drop_table("competencies")
    op.drop_table("themes")

    op.drop_index("ix_users_squad", table_name="users")
    op.drop_index("ix_users_nivel", table_name="users")
    op.drop_index("ix_users_setor", table_name="users")
    op.drop_index("ix_users_cargo", table_name="users")
    op.drop_column("users", "squad")
    op.drop_column("users", "nivel")
    op.drop_column("users", "setor")
    op.drop_column("users", "cargo")
    op.drop_column("users", "role")
    op.drop_column("users", "name")
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=False)
