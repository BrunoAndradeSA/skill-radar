from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.invitations.models.exam_invitation_model import ExamInvitation


class InvitationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(
        self,
        is_external: bool | None = None,
        email: str | None = None,
    ) -> list[ExamInvitation]:
        stmt = select(ExamInvitation).order_by(ExamInvitation.created_at.desc())
        if is_external is not None:
            stmt = stmt.where(ExamInvitation.is_external == is_external)
        if email is not None:
            stmt = stmt.where(ExamInvitation.candidate_email == email)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, invitation_id: int) -> ExamInvitation | None:
        stmt = select(ExamInvitation).where(ExamInvitation.id == invitation_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_token(self, token: str) -> ExamInvitation | None:
        stmt = select(ExamInvitation).where(ExamInvitation.token == token)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ExamInvitation:
        invitation = ExamInvitation(**data)
        self._session.add(invitation)
        await self._session.commit()
        await self._session.refresh(invitation)
        return invitation

    async def update(self, invitation: ExamInvitation, data: dict) -> ExamInvitation:
        for key, value in data.items():
            setattr(invitation, key, value)
        await self._session.commit()
        return invitation

    async def delete(self, invitation: ExamInvitation) -> None:
        await self._session.delete(invitation)
        await self._session.commit()
