"""Insert default roles

Revision ID: 284add699bed
Revises: 647fcf29c5a5
Create Date: 2026-05-15 23:43:59.113367

"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from alembic import op

if TYPE_CHECKING:
    from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "284add699bed"
down_revision: str | None = "647fcf29c5a5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    roles_table = sa.table(
        "roles",
        sa.column("description", sa.String),
    )

    op.bulk_insert(
        roles_table,
        [
            {"description": "ADMIN"},
            {"description": "USER"},
        ],
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            DELETE FROM roles
            WHERE description IN ('ADMIN', 'USER')
            """
        )
    )
