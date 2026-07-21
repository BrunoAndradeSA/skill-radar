from datetime import datetime

from pydantic import BaseModel, field_validator


class CandidateInput(BaseModel):
    name: str
    email: str


class SelectionProcessCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    cargo: str
    nivel: str
    setor: str
    squad: str
    template_id: int
    candidates: list[CandidateInput] = []

    @field_validator("end_date")
    @classmethod
    def end_date_must_be_after_start(cls, v: datetime, info) -> datetime:
        start = info.data.get("start_date")
        if start and v <= start:
            raise ValueError("end_date deve ser posterior a start_date")
        return v


class AddCandidatesRequest(BaseModel):
    candidates: list[CandidateInput]


class RankingItemOut(BaseModel):
    invitation_id: int
    candidate_name: str
    candidate_email: str
    assessment_id: int | None = None
    score: int | None = None
    percentage: int | None = None
    status: str | None = None
    finished: bool = False


class SelectionProcessOut(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    cargo: str
    nivel: str
    setor: str
    squad: str
    template_id: int
    total_invitations: int = 0
    total_finished: int = 0
    created_at: datetime
    updated_at: datetime
