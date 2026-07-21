from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.candidates.models.candidate_model import Candidate
from app.domains.candidates.repositories.candidate_repository import CandidateRepository
from app.domains.candidates.schemas.candidate_request_schema import (
    CandidateCreateSchema,
    CandidateUpdateSchema,
)
from app.domains.candidates.schemas.candidate_response_schema import CandidateData


class CandidateService:
    """Serviço responsável pela gestão de candidatos."""

    @staticmethod
    async def list_candidates(
        db: AsyncSession,
        candidate_id: int | None = None,
        email: str | None = None,
        name: str | None = None,
    ) -> list[CandidateData]:
        repo = CandidateRepository(db)
        candidates = await repo.list_all(
            candidate_id=candidate_id,
            email=email,
            name=name,
        )
        return [_candidate_to_data(c) for c in candidates]

    @staticmethod
    async def get_by_id(db: AsyncSession, candidate_id: int) -> CandidateData:
        repo = CandidateRepository(db)
        candidate = await repo.get_by_id(candidate_id)
        if candidate is None:
            raise NotFoundError("Candidato não encontrado")
        return _candidate_to_data(candidate)

    @staticmethod
    async def create(
        db: AsyncSession,
        data: CandidateCreateSchema,
    ) -> CandidateData:
        repo = CandidateRepository(db)

        existing = await repo.get_by_email(data.email)
        if existing is not None:
            raise BadRequestError("E-mail já cadastrado")

        candidate = await repo.create(data.model_dump())
        return _candidate_to_data(candidate)

    @staticmethod
    async def update(
        db: AsyncSession,
        candidate_id: int,
        data: CandidateUpdateSchema,
    ) -> CandidateData:
        repo = CandidateRepository(db)

        candidate = await repo.get_by_id(candidate_id)
        if candidate is None:
            raise NotFoundError("Candidato não encontrado")

        update_data = data.model_dump(exclude_none=True)

        if "email" in update_data:
            existing = await repo.get_by_email(update_data["email"])
            if existing is not None and existing.id != candidate_id:
                raise BadRequestError("E-mail já está em uso")

        if update_data:
            await repo.update(candidate, update_data)

        return _candidate_to_data(candidate)

    @staticmethod
    async def delete(
        db: AsyncSession,
        candidate_id: int,
    ) -> CandidateData:
        repo = CandidateRepository(db)

        candidate = await repo.get_by_id(candidate_id)
        if candidate is None:
            raise NotFoundError("Candidato não encontrado")

        if candidate.deleted_at is not None:
            raise BadRequestError("Candidato já foi excluído")

        await repo.soft_delete(candidate)

        return _candidate_to_data(candidate)


def _candidate_to_data(candidate: Candidate) -> CandidateData:
    """Converte uma instância de Candidate para CandidateData."""
    return CandidateData(
        id=candidate.id,
        name=candidate.name,
        email=candidate.email,
        role=candidate.role,
        cargo=candidate.cargo or "",
        setor=candidate.setor or "",
        nivel=candidate.nivel or "",
        squad=candidate.squad or "",
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
    )
