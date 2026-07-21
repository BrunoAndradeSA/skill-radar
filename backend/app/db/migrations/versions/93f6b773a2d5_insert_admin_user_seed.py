"""Insert admin user seed

Revision ID: 93f6b773a2d5
Revises: 284add699bed
Create Date: 2026-05-15 23:54:26.368908

"""

import secrets
from typing import TYPE_CHECKING

import sqlalchemy as sa
from alembic import op
from pwdlib import PasswordHash

if TYPE_CHECKING:
    from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "93f6b773a2d5"
down_revision: str | Sequence[str] | None = "284add699bed"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    password_hash_service = PasswordHash.recommended()

    password_hash = password_hash_service.hash("admin123")

    connection = op.get_bind()

    client_id = secrets.token_hex(16)
    client_secret = secrets.token_hex(32)
    client_secret_hash = password_hash_service.hash(client_secret)

    result = connection.execute(
        sa.text(
            """
            INSERT INTO users (
                email,
                username,
                password_hash,
                client_id,
                client_secret,
                enabled,
                created_at,
                updated_at
            )
            VALUES (
                :email,
                :username,
                :password_hash,
                :client_id,
                :client_secret,
                true,
                now(),
                now()
            )
            RETURNING id
            """
        ),
        {
            "email": "admin@local",
            "username": "admin",
            "password_hash": password_hash,
            "client_id": client_id,
            "client_secret": client_secret_hash,
        },
    )

    user_id = result.scalar()

    role_id = connection.execute(
        sa.text(
            """
            SELECT id
            FROM roles
            WHERE description = 'ADMIN'
            """
        )
    ).scalar()

    connection.execute(
        sa.text(
            """
            INSERT INTO user_roles (
                user_id,
                role_id
            )
            VALUES (
                :user_id,
                :role_id
            )
            """
        ),
        {
            "user_id": user_id,
            "role_id": role_id,
        },
    )


def downgrade() -> None:
    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            DELETE FROM user_roles
            WHERE user_id IN (
                SELECT id
                FROM users
                WHERE username = 'admin'
            )
            """
        )
    )

    connection.execute(
        sa.text(
            """
            DELETE FROM users
            WHERE username = 'admin'
            """
        )
    )
