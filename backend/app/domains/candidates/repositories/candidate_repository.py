from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.candidates.models.candidate_model import Candidate


class CandidateRepository:
    """Repositório para operações de persistência da entidade Candidate."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(
        self,
        candidate_id: int | None = None,
        email: str | None = None,
        name: str | None = None,
    ) -> list[Candidate]:
        stmt = select(Candidate).where(Candidate.deleted_at.is_(None))

        if candidate_id is not None:
            stmt = stmt.where(Candidate.id == candidate_id)
        if email is not None:
            stmt = stmt.where(Candidate.email.ilike(f"%{email}%"))
        if name is not None:
            stmt = stmt.where(Candidate.name.ilike(f"%{name}%"))

        stmt = stmt.order_by(Candidate.id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, candidate_id: int) -> Candidate | None:
        stmt = select(Candidate).where(Candidate.id == candidate_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Candidate | None:
        stmt = select(Candidate).where(Candidate.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Candidate:
        candidate = Candidate(**data)
        self._session.add(candidate)
        await self._session.commit()
        await self._session.refresh(candidate)
        return candidate

    async def update(self, candidate: Candidate, data: dict) -> Candidate:
        for key, value in data.items():
            setattr(candidate, key, value)
        await self._session.commit()
        return candidate

    async def soft_delete(self, candidate: Candidate) -> Candidate:
        candidate.deleted_at = datetime.now(UTC)
        await self._session.commit()
        await self._session.refresh(candidate)
        return candidate
