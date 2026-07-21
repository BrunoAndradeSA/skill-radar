"""create request_logs table

Revision ID: 4a934604db62
Revises: 93f6b773a2d5
Create Date: 2026-05-20 20:00:38.834963

"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from alembic import op

if TYPE_CHECKING:
    from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "4a934604db62"
down_revision: str | None = "93f6b773a2d5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "request_logs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("path", sa.String(500), nullable=False),
        sa.Column("status", sa.Integer(), nullable=False),
        sa.Column("user_name", sa.String(255), nullable=True),
        sa.Column("duration_ms", sa.BigInteger(), nullable=False),
        sa.Column("request_body", sa.Text(), nullable=True),
        sa.Column("response_body", sa.Text(), nullable=True),
        sa.Column("headers", sa.Text(), nullable=True),
        sa.Column("curl", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    op.create_index("idx_request_logs_created_at", "request_logs", ["created_at"])
    op.create_index("idx_request_logs_path", "request_logs", ["path"])
    op.create_index("idx_request_logs_status", "request_logs", ["status"])
    op.create_index("idx_request_logs_user", "request_logs", ["user_name"])


def downgrade() -> None:
    op.drop_index("idx_request_logs_user", table_name="request_logs")
    op.drop_index("idx_request_logs_status", table_name="request_logs")
    op.drop_index("idx_request_logs_path", table_name="request_logs")
    op.drop_index("idx_request_logs_created_at", table_name="request_logs")
    op.drop_table("request_logs")
