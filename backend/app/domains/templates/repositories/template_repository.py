from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.templates.models.exam_template_model import ExamTemplate
from app.domains.templates.models.exam_template_theme_competency_model import (
    exam_template_theme_competencies,
)
from app.domains.templates.models.exam_template_theme_model import ExamTemplateTheme


class TemplateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[ExamTemplate]:
        stmt = (
            select(ExamTemplate)
            .options(
                selectinload(ExamTemplate.themes).selectinload(ExamTemplateTheme.competencies),
            )
            .order_by(ExamTemplate.name)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, template_id: int) -> ExamTemplate | None:
        stmt = (
            select(ExamTemplate)
            .options(
                selectinload(ExamTemplate.themes).selectinload(ExamTemplateTheme.competencies),
            )
            .where(ExamTemplate.id == template_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> ExamTemplate | None:
        stmt = select(ExamTemplate).where(ExamTemplate.name == name)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> ExamTemplate:
        template = ExamTemplate(**data)
        self._session.add(template)
        await self._session.commit()
        await self._session.refresh(template)
        return template

    async def update(self, template: ExamTemplate, data: dict) -> ExamTemplate:
        for key, value in data.items():
            setattr(template, key, value)
        await self._session.commit()
        return template

    async def delete(self, template: ExamTemplate) -> None:
        await self._session.delete(template)
        await self._session.commit()

    async def clear_themes(self, template: ExamTemplate) -> None:
        template.themes = []
        await self._session.flush()

    async def add_theme(
        self,
        template_id: int,
        theme_id: int,
        question_count: int,
        competency_ids: list[int],
    ) -> ExamTemplateTheme:
        tt_obj = ExamTemplateTheme(
            template_id=template_id,
            theme_id=theme_id,
            question_count=question_count,
        )
        self._session.add(tt_obj)
        await self._session.flush()

        if competency_ids:
            for cid in competency_ids:
                await self._session.execute(
                    exam_template_theme_competencies.insert().values(
                        template_theme_id=tt_obj.id,
                        competency_id=cid,
                    )
                )
            await self._session.flush()

        return tt_obj
