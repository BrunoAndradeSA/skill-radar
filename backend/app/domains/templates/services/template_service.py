from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.domains.templates.models.exam_template_model import ExamTemplate
from app.domains.templates.repositories.template_repository import TemplateRepository
from app.domains.templates.schemas.template_schema import (
    TemplateCreate,
    TemplateOut,
    TemplateThemeOut,
    TemplateUpdate,
)


class TemplateService:
    @staticmethod
    async def get_all(db: AsyncSession) -> list[TemplateOut]:
        repo = TemplateRepository(db)
        templates = await repo.list_all()
        return [_template_to_out(t) for t in templates]

    @staticmethod
    async def get_by_id(db: AsyncSession, template_id: int) -> TemplateOut:
        repo = TemplateRepository(db)
        template = await repo.get_by_id(template_id)
        if template is None:
            raise NotFoundError("Template não encontrado")
        return _template_to_out(template)

    @staticmethod
    async def create(db: AsyncSession, data: TemplateCreate) -> TemplateOut:
        repo = TemplateRepository(db)
        existing = await repo.get_by_name(data.name)
        if existing:
            raise BadRequestError("Nome do template já existe")
        template = await repo.create(
            {
                "name": data.name,
                "description": data.description,
                "seniority": data.seniority,
                "duration_minutes": data.duration_minutes,
                "is_certification": data.is_certification,
            }
        )
        for theme_data in data.themes:
            await repo.add_theme(
                template_id=template.id,
                theme_id=theme_data.theme_id,
                question_count=theme_data.question_count,
                competency_ids=theme_data.competency_ids,
            )
        await db.commit()
        await db.refresh(template)
        return _template_to_out(template)

    @staticmethod
    async def update(db: AsyncSession, template_id: int, data: TemplateUpdate) -> TemplateOut:
        repo = TemplateRepository(db)
        template = await repo.get_by_id(template_id)
        if template is None:
            raise NotFoundError("Template não encontrado")
        template = await repo.update(
            template,
            {
                "name": data.name,
                "description": data.description,
                "seniority": data.seniority,
                "duration_minutes": data.duration_minutes,
                "is_certification": data.is_certification,
            },
        )
        await repo.clear_themes(template)
        for theme_data in data.themes:
            await repo.add_theme(
                template_id=template.id,
                theme_id=theme_data.theme_id,
                question_count=theme_data.question_count,
                competency_ids=theme_data.competency_ids,
            )
        await db.commit()
        await db.refresh(template)
        return _template_to_out(template)

    @staticmethod
    async def delete(db: AsyncSession, template_id: int) -> None:
        repo = TemplateRepository(db)
        template = await repo.get_by_id(template_id)
        if template is None:
            raise NotFoundError("Template não encontrado")
        await repo.delete(template)


def _template_to_out(template: ExamTemplate) -> TemplateOut:
    return TemplateOut(
        id=template.id,
        name=template.name,
        description=template.description,
        seniority=template.seniority,
        duration_minutes=template.duration_minutes,
        is_certification=template.is_certification,
        themes=[
            TemplateThemeOut(
                id=t.id,
                theme_id=t.theme_id,
                question_count=t.question_count,
                competency_ids=[c.id for c in t.competencies],
            )
            for t in template.themes
        ],
        created_at=template.created_at,
        updated_at=template.updated_at,
    )
