from __future__ import annotations

import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.auth.models.user_model import User
from app.domains.auth.services.password_service import PasswordService
from app.domains.users.repositories.user_repository import UserRepository
from app.domains.users.schemas.user_request_schema import (
    UserCreateSchema,
    UserUpdateSchema,
)
from app.domains.users.schemas.user_response_schema import UserData


class UserService:
    """Serviço responsável pela gestão de usuários do sistema."""

    @staticmethod
    async def list_users(
        db: AsyncSession,
        user_id: int | None = None,
        email: str | None = None,
        name: str | None = None,
    ) -> list[UserData]:
        """Retorna a lista de usuários ativos, aplicando filtros opcionais.

        Args:
            db: Sessão assíncrona do banco de dados.
            user_id: Filtro pelo ID exato do usuário.
            email: Filtro parcial pelo e-mail.
            name: Filtro parcial pelo nome.

        Returns:
            list[UserData]: Lista de usuários.
        """
        repo = UserRepository(db)
        users = await repo.list_all(
            user_id=user_id,
            email=email,
            name=name,
        )
        return [_user_to_data(user) for user in users]

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int) -> UserData:
        """Obtém um usuário pelo ID.

        Args:
            db: Sessão assíncrona do banco de dados.
            user_id: Identificador do usuário.

        Returns:
            UserData: Dados do usuário.

        Raises:
            NotFoundError: Se o usuário não for encontrado.
        """
        repo = UserRepository(db)
        user = await repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("Usuário não encontrado")
        return _user_to_data(user)

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> UserData:
        """Busca um usuário pelo e-mail.

        Args:
            db: Sessão assíncrona do banco de dados.
            email: E-mail do usuário.

        Returns:
            UserData: Dados do usuário.

        Raises:
            NotFoundError: Se o usuário não for encontrado.
        """
        repo = UserRepository(db)
        user = await repo.get_by_email(email)
        if user is None:
            raise NotFoundError("Usuário não encontrado")
        return _user_to_data(user)

    @staticmethod
    async def create_user(
        db: AsyncSession,
        data: UserCreateSchema,
    ) -> UserData:
        """Cria um novo usuário com os dados fornecidos.

        Args:
            db: Sessão assíncrona do banco de dados.
            data: Dados do usuário a ser criado.

        Returns:
            UserData: Dados do usuário criado.

        Raises:
            BadRequestError: Se o email já existir.
        """
        repo = UserRepository(db)

        existing_email = await repo.get_by_email(data.email)
        if existing_email is not None:
            raise BadRequestError("E-mail já cadastrado")

        username = data.email.split("@")[0]
        client_id = secrets.token_hex(16)

        password_hash = PasswordService.hash_password(data.password) if data.password else None
        client_secret_plain = secrets.token_hex(32)
        client_secret_hash = PasswordService.hash_password(client_secret_plain)

        user = await repo.create(
            {
                "name": data.name,
                "email": data.email,
                "username": username,
                "password_hash": password_hash,
                "client_id": client_id,
                "client_secret": client_secret_hash,
                "enabled": True,
            }
        )

        if data.roles:
            roles = await repo.get_roles_by_descriptions(data.roles)
            await repo.assign_roles(user, roles)

        return _user_to_data(user)

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: int,
        data: UserUpdateSchema,
    ) -> UserData:
        """Atualiza os dados de um usuário existente.

        Args:
            db: Sessão assíncrona do banco de dados.
            user_id: Identificador do usuário.
            data: Dados a serem alterados.

        Returns:
            UserData: Dados do usuário atualizado.

        Raises:
            NotFoundError: Se o usuário não for encontrado.
            BadRequestError: Se o email já estiver em uso.
        """
        repo = UserRepository(db)

        user = await repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("Usuário não encontrado")

        if user.deleted_at is not None:
            raise BadRequestError("Cannot update a deleted user")

        update_data: dict = {}

        if data.email is not None:
            existing = await repo.get_by_email(data.email)
            if existing is not None and existing.id != user_id:
                raise BadRequestError("E-mail já está em uso")
            update_data["email"] = data.email
            update_data["username"] = data.email.split("@")[0]

        if data.name is not None:
            update_data["name"] = data.name
        if data.password is not None:
            update_data["password_hash"] = PasswordService.hash_password(data.password)

        if update_data:
            await repo.update(user, update_data)

        return _user_to_data(user)

    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: int,
    ) -> UserData:
        """Realiza a exclusão lógica de um usuário (soft delete).

        Args:
            db: Sessão assíncrona do banco de dados.
            user_id: Identificador do usuário.

        Returns:
            UserData: Dados do usuário excluído.

        Raises:
            NotFoundError: Se o usuário não for encontrado.
            BadRequestError: Se o usuário já estiver excluído.
        """
        repo = UserRepository(db)

        user = await repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("Usuário não encontrado")

        if user.deleted_at is not None:
            raise BadRequestError("Usuário já foi excluído")

        await repo.soft_delete(user)

        return _user_to_data(user)


def _user_to_data(user: User) -> UserData:
    """Converte uma instância de User para UserData.

    Args:
        user: Instância do modelo User.

    Returns:
        UserData: Esquema de resposta com os dados do usuário.
    """
    return UserData(
        id=user.id,
        name=user.name or user.username,
        email=user.email,
        roles=[r.description for r in (user.roles or [])],
        enabled=user.enabled,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
