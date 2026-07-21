# AGENTS.md

## Commands

### Backend (Python)

| Task | Command (de `backend/`) |
|------|------------------------|
| Dev server | `uv run uvicorn app.main:app --reload` |
| Lint + format | `uv run ruff check . && uv run ruff format .` |
| Typecheck | `uv run ty check` |
| Tests | `uv run pytest` |
| Single test | `uv run pytest tests/path/to/test.py -k test_name` |
| Create migration | `uv run alembic revision --autogenerate -m "descricao"` |
| Apply migrations | `uv run alembic upgrade head` |

### Frontend (TypeScript)

| Task | Command (de `frontend/`) |
|------|------------------------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Tests | `npm run test` |
| Seed questões | `npm run seed:questions` |

### Docker Compose

| Task | Command (de `skill-radar/`) |
|------|----------------------------|
| Start all services | `docker compose up -d` |
| Stop all services | `docker compose down` |
| Stop + clean volumes | `docker compose down -v` |
| Rebuild images | `docker compose build` |
| Rebuild single service | `docker compose build backend` |
| View logs | `docker compose logs -f` |
| Service logs | `docker compose logs -f backend` |
| Exec into service | `docker compose exec backend sh` |
| Check status | `docker compose ps` |

**Verification order (backend):** `ruff check` → `ruff format` → `ty check` → `pytest`.

---

## Arquitetura

### Monorepo

```
skill-radar/
├── backend/       # API FastAPI (Python)
├── frontend/      # SPA React (TypeScript)
├── .vscode/       # Launch configs compartilhadas
├── docker-compose.yml
└── AGENTS.md
```

### Backend

- **Package manager**: `uv` (Python 3.14). Never use `pip`.
- **Framework**: FastAPI, fully async. DB driver is `asyncpg`; all SQLAlchemy sessions are `AsyncSession`.
- **Entry point**: `backend/app/main.py` — registers exception handlers and includes `backend/app/api/v1/router.py`.
- **Domain routers**: `app/core/router_loader.py` auto-discovers routers in `app/domains/*/`. Each domain must export a `router` variable from `router.py`. The loader includes them under `/api/v1`.
- **Adding a new domain**: create `app/domains/<name>/router.py` with an `APIRouter` exported as `router`. No manual registration needed.
- **Migrations**: after creating a migration (`alembic revision --autogenerate`), **always run** `alembic upgrade head` to apply it. A migration não aplicada quebra o backend (UndefinedColumnError → 500 → CORS error no frontend).
- **Settings**: `app/core/settings.py` — pydantic-settings, loads `.env` (case-insensitive).
- **Migrations**: Alembic at `app/db/migrations/`. Uses **sync** `psycopg` driver — `env.py` replaces the URL scheme automatically.
- **Error handling**: raise `AppError` subclasses (`BadRequestError`, `NotFoundError`, `UnauthorizedError`) from `app/core/exceptions.py`. Handlers in `app/core/exception_handlers.py` wrap them in `DefaultResponse`.
- **Response schema**: all endpoints return `DefaultResponse` (`code`, `description`, `path`, `timestamp`, optional `data`).
- **DB session**: inject via `Depends(get_db_session)` from `app/core/database/dependencies.py`.
- **Data access layers**: each domain follows `service → repository` pattern.

### Frontend

```
Component → Hook → Service → Repository (interface)
                                ├── MockRepository (default, localStorage)
                                └── ApiRepository (Axios/HTTP)
```

- **Camadas**: Component (UI pura) → Hook (TanStack Query) → Service (regras de negócio) → Repository (mock/api).
- **Mock-first**: frontend 100% funcional sem backend. Persistência via localStorage.
- **Troca transparente**: `enableMockMode` alterna entre mock e API sem alterar componentes/hooks/services.
- **Componentes nunca acessam** Axios, localStorage, JSON ou APIs diretamente.
- **Seed automático**: mock repositories auto-seed no primeiro `findAll()` via `src/mocks/seed.ts`.

---

## Estrutura de Diretórios

```
backend/
├── Dockerfile
├── .dockerignore
├── app/
│   ├── api/v1/router.py      # Agrega roteadores dos domínios
│   ├── core/                  # Settings, exceções, logging, router_loader, database/
│   ├── db/                    # session.py, base.py, migrations/
│   ├── domains/               # auth/, health/, candidates/, assessments/, etc.
│   └── shared/                # Schemas e constantes compartilhadas
└── tests/                     # unit/, integration/, fixtures/, factories/

frontend/
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── src/
│   ├── api/                   # axiosInstance, interceptors
│   ├── components/            # MarkdownRenderer, MarkdownEditor, ThemeModeProvider
│   ├── feature-flags/         # FeatureFlags interface + provider + service
│   ├── hooks/                 # useThemes, useExam, useAuth, etc.
│   ├── layouts/               # AuthLayout, CandidateLayout, AdminLayout
│   ├── models/                # Interfaces + enums + types + errors
│   ├── pages/                 # admin/, exam/, auth/
│   ├── repositories/          # interfaces/, mock/, api/, RepositoryFactory.ts
│   ├── routes/                # React Router config com lazy loading
│   ├── services/              # Regras de negócio com DI
│   ├── store/                 # Zustand: useUserStore, useFeatureFlagStore
│   ├── mocks/                 # Datasets + auto-seed
│   └── utils/                 # MUI theme (light/dark)
└── tests/                     # Vitest setup + mocks
```

---

## Modelos de Domínio (Frontend)

| Modelo | Atributos |
|--------|-----------|
| `Theme` | id, name, description? |
| `Competency` | id, themeId, name, description? |
| `Question` | id, themeId, competencyIds[], type, seniority, text, alternatives[], explanation? |
| `Alternative` | id, text, isCorrect |
| `ExamTemplate` | id, name, description?, seniority, durationMinutes, isCertification, themes[] |
| `ExamTemplateTheme` | themeId, questionCount, competencyIds? |
| `ExamInvitation` | id, templateId, candidateName, candidateEmail, token, accessCode, expiresAt, used, createdAt |
| `Assessment` | id, invitationId, templateId, status, questions[], answers[], timing, securityMetrics, score?, percentage? |
| `User` | id, name, email, role |

### Tipos utilitários (`frontend/src/models/types.ts`)
- `Entity` – entidade com `id: string`
- `CreateEntity<T>` – `Omit<T, 'id'>`
- `UpdateEntity<T>` – `Partial<Omit<T, 'id'>>`
- `QuestionFilter` – `{ themeId?, seniority?, type? }`

---

## Convenções

### Geral
- Docstrings em português BR, estilo Google (seções `Args`, `Returns`, `Raises`, `Yields`).

### Backend (Python)
- **Imports**: ruff isort com `known-first-party = ["app"]`. Double quotes, space indent.
- **Ruff rules**: E, W, F, I, B, C4, UP, N, SIM, TCH. Ignores E501, TCH001, TCH002.
- **Type checking**: `ty` in strict mode. `jose.*` and `passlib.*` imports ignored.
- **Logging**: `app.core.logging.logger` — file-based, daily rotation in `logs/`.
- **Auth**: JWT (HS256), argon2 password hashing.
- **Protected routes**: `require_role("ADMIN")` from `app/domains/auth/dependencies.py`.

### Frontend (TypeScript)
- Functional Components + Hooks apenas (sem classes).
- Serviços em PascalCase com sufixo `.service.ts`.
- Hooks com prefixo `use`.
- Prefira imports diretos (`models/Theme`) em vez de barrel files (`models`).
- Use `import type` para tipos que desaparecem em runtime.
- Monaco Editor para edição markdown de questões.
- React Markdown para renderização de enunciados.

---

## Como criar um novo CRUD (Frontend)

1. Defina o modelo em `frontend/src/models/`
2. Estenda `BaseRepository<T>` em `repositories/interfaces/`
3. Implemente `Mock*Repository` e `Api*Repository`
4. Adicione o factory em `RepositoryFactory.ts`
5. Crie `*Service` com DI do repositório
6. Crie hooks `use*` + `use*Mutations`
7. Crie a página em `pages/admin/*/`
8. Adicione a rota lazy-loaded em `routes/index.tsx`

---

## Feature Flags (Frontend)

| Flag | Default | Descrição |
|------|---------|-----------|
| `enableMockMode` | `true` | Usa mock repositories |
| `enableAuthentication` | `false` | Habilita autenticação real |
| `enableFocusMonitoring` | `true` | Monitora perda de foco no exame |
| `enableAutoTermination` | `true` | Encerra exame após 3 violações |

---

## Rotas (Frontend)

```
/login              → AuthLayout > LoginPage
/admin/dashboard    → AdminLayout > DashboardPage
/admin/themes       → AdminLayout > ThemesPage
/admin/competencies → AdminLayout > CompetenciesPage
/admin/questions    → AdminLayout > QuestionsPage
/admin/templates    → AdminLayout > TemplatesPage
/admin/invitations  → AdminLayout > InvitationsPage
/admin/assessments  → AdminLayout > AssessmentsPage
/exam/:token        → CandidateLayout > ExamAccessPage
/exam/start         → CandidateLayout > ExamPage
/exam/result        → CandidateLayout > ExamResultPage
```

---

## Segurança (Exame)

`SecurityMonitoringService` escuta `visibilitychange`. Máximo de 3 violações de foco: 1º/2º aviso, 3º encerra o exame automaticamente.

---

## Docker Compose

### Arquitetura

```
Internet :80 ──→ [Nginx] ── serve static ──→ frontend build
                        └── proxy /api/* ──→ [Backend :8000] ──→ [PostgreSQL :5432]
```

- **Rede única `backend-network`**: conecta db, backend e frontend (Nginx).
- **Backend isolado**: nenhuma porta exposta externamente — apenas Nginx o acessa via rede interna.
- **Nginx exposto na porta 80**: serve o build estático do frontend e faz proxy reverso de `/api/*` para o backend.
- **Migrations automáticas**: executadas no startup do backend via `alembic upgrade head`.
- **Volume `postgres-data`**: persiste dados do banco entre reinicializações.

### CORS

Configurável via env var `CORS_ORIGINS` (múltiplas origens separadas por vírgula).
Default: `http://localhost:3000` (mantém compatibilidade com desenvolvimento local).

### Serviços

| Serviço | Container | Portas expostas | Depende de |
|---------|-----------|-----------------|------------|
| `db` | `postgres:16-alpine` | — | — |
| `backend` | build `backend/Dockerfile` | — | `db` (health) |
| `frontend` | build `frontend/Dockerfile` | `80:80` | `backend` |
