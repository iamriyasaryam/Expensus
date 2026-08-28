# Expensus — Implementation Log

The Implementation Log tracks all milestones, files created/modified, architectural changes, testing results, and blockers encountered.

---

## Log Entry: Milestone 01 — Phase 0: Project Definition & System Architecture

* **Date:** 2026-08-28
* **Milestone:** Phase 0 — Project Definition & Documentation System
* **Goal:** Establish the complete product specification, system requirements, database schema design, REST API contracts, authentication model, frontend architecture, and architectural decision records before writing application code.

### Files Created
* `docs/00-project-overview.md` — Vision, scope, and user personas.
* `docs/01-requirements.md` — Functional (FR-AUTH, FR-CAT, FR-EXP, FR-ANL) and Non-Functional Requirements.
* `docs/02-architecture.md` — Modular monolith design and end-to-end request-response lifecycle.
* `docs/03-database-design.md` — Relational schema (ER diagram), data types, constraints, and indexing strategy.
* `docs/04-api-design.md` — REST API endpoint contracts, query parameters, payloads, and error formats.
* `docs/05-authentication.md` — Stateless JWT lifecycle, token rotation, and zero-trust user ownership.
* `docs/06-frontend-architecture.md` — React component hierarchy, feature-first structure, server vs client state.
* `docs/07-testing.md` — Testing pyramid, APITestCase strategies, and isolation tests.
* `docs/08-deployment.md` — Development vs production environments, Docker topology, and release checklist.
* `docs/decisions.md` — ADR-001 through ADR-008 documenting all major architectural trade-offs.
* `docs/learning-log.md` — Learning log framework and initial entry with understanding check questions.
* `docs/implementation-log.md` — Implementation tracking ledger.
* `README.md` — Root project documentation index.

### Changes Made
* Fully planned and documented the 14-phase roadmap for Expensus.
* Defined the database schema with exact decimal precision (`DecimalField(10, 2)`) to eliminate float rounding errors.
* Formatted the API contracts for category CRUD, expense CRUD with filters, and dashboard aggregations.
* Documented 8 Architecture Decision Records (ADRs) explaining every technology choice.

### Tests Performed
* Verified markdown file formatting and Mermaid diagram syntax integrity across all documentation files.
* Verified that database relationships, API payload definitions, and frontend state contracts match across all documentation.

### Problems Encountered & Solutions
* *Problem:* Ensuring multi-tenant security without adding microservice complexity.
* *Solution:* Documented backend ownership enforcement via DRF `perform_create` and `get_queryset` deriving the user strictly from the verified JWT payload.

### Concepts Learned
* ADR documentation methodology.
* Financial data precision using fixed-point decimals.
* Stateless JWT vs stateful session authentication.
* Server state vs client state in modern React.

### Next Milestone
* **Phase 1 — Repository & Development Environment Setup** (Git initialization, `.gitignore`, `.env.example`, Docker, Docker Compose setup for PostgreSQL and application containers).

---

## Log Entry: Milestone 02 — Phase 1: Repository & Development Environment Setup

* **Date:** 2026-08-28
* **Milestone:** Phase 1 — Repository & Development Environment Setup
* **Goal:** Initialize Git version control, configure `.gitignore`, define environment templates (`.env.example`), create Docker Compose topology for PostgreSQL 16, and scaffold the modular application architecture.

### Files Created / Modified
* `.gitignore` — Production-grade ignore rules for Python, Django, Node, Vite, Docker, and environment files.
* `.env.example` — Template documenting all required backend, database, and frontend environment variables.
* `.env` — Local development environment file (strictly ignored by Git).
* `docker-compose.yml` — Multi-container definition for `db` (PostgreSQL 16), `backend` (Django), and `frontend` (Vite) with persistent volumes and bridge network.
* `backend/Dockerfile` — Multi-stage Python 3.11 container definition.
* `backend/requirements.txt` — Core pinned dependencies (`Django`, `djangorestframework`, `simplejwt`, `django-filter`, `django-cors-headers`, `psycopg2-binary`, `python-dotenv`).
* `frontend/Dockerfile` — Node 20 container definition for Vite development server.
* `backend/config/`, `backend/users/`, `backend/categories/`, `backend/expenses/`, `backend/analytics/` — Scaffolding for backend domain apps.
* `frontend/src/app/`, `frontend/src/features/...`, `frontend/src/components/...` — Scaffolding for frontend architecture.

### Changes Made
* Initialized empty Git repository on `master` branch.
* Created initial commit (`bfed975`) tracking all scaffolding and configuration files.
* Confirmed that `.env` is properly ignored by Git to prevent secrets leakage.

### Tests Performed
* Tested `git init` and verified repository status.
* Verified `docker --version` (29.5.2) and `docker compose version` (v5.1.4).
* Tested `python --version` (3.13.5) and `node --version` (v24.18.0) on host environment.
* Verified that `.env` is uncommitted and completely ignored by Git.

### Problems Encountered & Solutions
* *Problem:* Attempting to run `docker compose up -d db` returned that Docker Desktop daemon was not running (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`).
* *Solution:* Documented the Docker daemon requirement. The host machine also possesses native Python 3.13 and Node 24 runtimes, providing flexibility for containerized or local development workflows.

### Concepts Learned
* Git hygiene and `.gitignore` rule precedence.
* 12-Factor App methodology for environment variables.
* Docker Compose service DNS resolution (`DB_HOST=db`).
* Persistent named volumes for stateful databases.

### Next Milestone
* **Phase 2 — Backend Foundation** (Python virtual environment, Django project initialization, DRF setup, split settings architecture `base.py`/`development.py`, PostgreSQL database connection configuration).

