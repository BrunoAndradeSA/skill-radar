from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.auth.models.role_model import Role
from app.domains.auth.models.user_model import User


class UserRepository:
    """Repositório para operações de persistência da entidade User."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(
        self,
        user_id: int | None = None,
        email: str | None = None,
        name: str | None = None,
    ) -> list[User]:
        """Retorna todos os usuários que não foram excluídos logicamente.

        Args:
            user_id: Filtro pelo ID exato do usuário.
            email: Filtro parcial (ILIKE) pelo e-mail.
            name: Filtro parcial (ILIKE) pelo nome.

        Returns:
            list[User]: Lista de usuários.
        """
        stmt = select(User).where(User.deleted_at.is_(None))

        if user_id is not None:
            stmt = stmt.where(User.id == user_id)
        if email is not None:
            stmt = stmt.where(User.email.ilike(f"%{email}%"))
        if name is not None:
            stmt = stmt.where(User.name.ilike(f"%{name}%"))

        stmt = stmt.order_by(User.id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_roles_by_descriptions(self, descriptions: list[str]) -> list[Role]:
        stmt = select(Role).where(Role.description.in_(descriptions))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict) -> User:
        user = User(**data)
        self._session.add(user)
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def find_active_by_username(self, username: str) -> User | None:
        stmt = select(User).where(
            User.username == username,
            User.deleted_at.is_(None),
            User.enabled.is_(True),
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_active_by_email(self, email: str) -> User | None:
        stmt = select(User).where(
            User.email == email,
            User.deleted_at.is_(None),
            User.enabled.is_(True),
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_active_by_client(
        self,
        client_id: str,
    ) -> User | None:
        stmt = select(User).where(
            User.client_id == client_id,
            User.deleted_at.is_(None),
            User.enabled.is_(True),
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, user: User, data: dict) -> User:
        for key, value in data.items():
            setattr(user, key, value)
        await self._session.commit()
        return user

    async def assign_roles(self, user: User, roles: list[Role]) -> None:
        user.roles = roles
        await self._session.commit()

    async def soft_delete(self, user: User) -> User:
        user.deleted_at = datetime.now(UTC)
        user.enabled = False
        await self._session.commit()
        await self._session.refresh(user)
        return user
