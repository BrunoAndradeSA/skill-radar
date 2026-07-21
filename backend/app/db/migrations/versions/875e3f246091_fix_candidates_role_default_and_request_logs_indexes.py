"""fix candidates role server_default and add request_logs indexes

Revision ID: 875e3f246091
Revises: f83e9bf8b061
Create Date: 2026-07-06 21:40:00.000000

"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from alembic import op

if TYPE_CHECKING:
    from collections.abc import Sequence


# revision identifiers, used by Alembic.
revision: str = "875e3f246091"
down_revision: str | Sequence[str] | None = "f83e9bf8b061"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "candidates",
        "role",
        server_default=sa.text("'CANDIDATE'"),
        existing_type=sa.String(50),
        existing_nullable=False,
    )
    op.create_index(
        op.f("idx_request_logs_created_at"), "request_logs", ["created_at"], unique=False
    )
    op.create_index(op.f("idx_request_logs_path"), "request_logs", ["path"], unique=False)
    op.create_index(op.f("idx_request_logs_status"), "request_logs", ["status"], unique=False)
    op.create_index(op.f("idx_request_logs_user"), "request_logs", ["user_name"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("idx_request_logs_user"), table_name="request_logs")
    op.drop_index(op.f("idx_request_logs_status"), table_name="request_logs")
    op.drop_index(op.f("idx_request_logs_path"), table_name="request_logs")
    op.drop_index(op.f("idx_request_logs_created_at"), table_name="request_logs")
    op.alter_column(
        "candidates",
        "role",
        server_default=None,
        existing_type=sa.String(50),
        existing_nullable=False,
    )
