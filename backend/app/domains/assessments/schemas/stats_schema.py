from pydantic import BaseModel, ConfigDict, Field


class GeneralStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_assessments: int = Field(..., description="Total de avaliações")
    average_percentage: float = Field(..., description="Média de percentual de acertos")
    total_questions_evaluated: int = Field(..., description="Total de questões avaliadas")


class ThemeGap(BaseModel):
    model_config = ConfigDict(extra="forbid")

    theme_id: int = Field(..., description="ID do tema")
    theme_name: str = Field(..., description="Nome do tema")
    total_questions: int = Field(..., description="Total de questões")
    correct: int = Field(..., description="Acertos")
    wrong: int = Field(..., description="Erros")
    percentage: float = Field(..., description="Percentual de acertos")


class GroupStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    group_by: str = Field(..., description="Agrupamento (cargo, nivel, squad, setor)")
    group_value: str = Field(..., description="Valor do grupo")
    themes: list[ThemeGap] = Field(..., description="Detalhamento por tema")


class UserStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: int = Field(..., description="ID do usuário")
    total_assessments: int = Field(..., description="Total de avaliações realizadas")
    average_percentage: float = Field(..., description="Percentual médio")
    themes: list[ThemeGap] = Field(..., description="Forças e gaps por tema")
