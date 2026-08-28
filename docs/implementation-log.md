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

---

## Log Entry: Milestone 03 — Phase 2: Backend Foundation

* **Date:** 2026-08-28
* **Milestone:** Phase 2 — Backend Foundation
* **Goal:** Initialize Python virtual environment, construct Django project root (`manage.py`, `wsgi.py`, `asgi.py`), build modular split-settings (`base.py`, `development.py`, `production.py`), configure Django REST Framework (DRF) and SimpleJWT, and register all domain apps (`users`, `categories`, `expenses`, `analytics`).

### Files Created / Modified
* `.env.example` — Added documentation for `USE_SQLITE` local testing toggle.
* `backend/manage.py` — Django administrative command line entrypoint.
* `backend/config/__init__.py`, `wsgi.py`, `asgi.py` — WSGI and ASGI web application entrypoints.
* `backend/config/settings/__init__.py` — Modular settings package.
* `backend/config/settings/base.py` — Core shared settings, DRF configuration, SimpleJWT tokens, password validators.
* `backend/config/settings/development.py` — Development settings loading `.env`, configuring database, CORS origins, and logging.
* `backend/config/settings/production.py` — Production settings with security headers, WhiteNoise, and connection pooling.
* `backend/config/urls.py` — Root URL dispatcher including health check and domain app includes.
* `backend/users/` — Initialized `apps.py`, custom `User` model (`AbstractBaseUser`), `CustomUserManager`, `admin.py`, initial migration (`0001_initial.py`).
* `backend/categories/` — Initialized `apps.py`, `urls.py`, `models.py`, `views.py`.
* `backend/expenses/` — Initialized `apps.py`, `urls.py`, `models.py`, `views.py`.
* `backend/analytics/` — Initialized `apps.py`, `urls.py`, `views.py`.

### Changes Made
* Created `.venv` virtual environment with Python 3.13.5 and installed all dependencies from `requirements.txt`.
* Structured Django settings into a clean three-tier inheritance model (`base` -> `development` / `production`).
* Created and verified root `/api/health/` monitoring endpoint.
* Implemented the custom `User` model before initial migrations to ensure seamless authentication modeling.

### Tests Performed
* Ran `python backend/manage.py check` -> `System check identified no issues (0 silenced)`.
* Applied initial migrations (`python manage.py migrate`) -> Success across `contenttypes`, `auth`, `users.0001_initial`, `admin`, `sessions`.
* Executed HTTP GET test on `/api/health/` using Django Test Client -> Returned `HTTP 200 OK: {"status": "healthy", "service": "expensus-api"}`.
* Ran `python backend/manage.py test` test suite -> Passed (0 errors).

### Problems Encountered & Solutions
* *Problem 1:* Initial `python manage.py check` reported `LookupError: App 'users' doesn't have a 'User' model` because `AUTH_USER_MODEL = 'users.User'` was configured in `base.py`.
* *Solution 1:* Implemented the custom `User` model with `CustomUserManager` in `backend/users/models.py` before running initial migrations (aligning with Django best practices).
* *Problem 2:* Django Test Client failed with `DisallowedHost: Invalid HTTP_HOST header: 'testserver'`.
* *Solution 2:* Added `'testserver'` to `ALLOWED_HOSTS` in `development.py`.

### Concepts Learned
* Split-settings inheritance and environment configuration.
* Custom user model architecture in Django.
* Middleware execution order (CORS preflight handling).
* URL routing and namespace delegation.

### Next Milestone
* **Phase 3 — Database Modeling** (Implementing `Category` and `Expense` models with `DecimalField` precision, foreign keys, cascade rules, database indexes, and running migrations).

---

## Log Entry: Milestone 04 — Phase 3: Database Modeling & Migrations

* **Date:** 2026-08-28
* **Milestone:** Phase 3 — Database Modeling & Migrations
* **Goal:** Implement the relational data models for `Category` and `Expense` with exact `DecimalField(10, 2)` monetary handling, `PROTECT` cascade policies, multi-tenant composite unique constraints, date indexing, admin registration, unit testing, and migration execution.

### Files Created / Modified
* `backend/categories/models.py` — Implemented `Category` model with user FK and `UniqueConstraint(fields=['user', 'name'])`.
* `backend/categories/admin.py` — Admin configuration with search by name/email and created date filter.
* `backend/categories/tests.py` — Unit tests for category creation, duplicate rejection per user, and cross-user category uniqueness.
* `backend/expenses/models.py` — Implemented `Expense` model with `DecimalField(10, 2)`, `PaymentMethod` choices, `PROTECT` cascade on Category, check constraints, and composite indexes.
* `backend/expenses/admin.py` — Admin configuration with date hierarchy and filter facets.
* `backend/expenses/tests.py` — Unit tests for Decimal arithmetic, deletion protection, cross-user category validation, and ordering.
* `backend/categories/migrations/0001_initial.py` — Initial Category table DDL migration.
* `backend/expenses/migrations/0001_initial.py` — Initial Expense table DDL migration.
* `docs/decisions.md` — Cleaned formatting.

### Changes Made
* Defined relational schema enforcing 1-to-many relationships (`User -> Category`, `User -> Expense`, `Category -> Expense`).
* Guaranteed financial arithmetic safety using fixed-point `Decimal` representation.
* Added composite database indexes `(user, expense_date)` to optimize temporal and aggregation queries.

### Tests Performed
* Ran migrations (`python backend/manage.py migrate`) -> Applied `categories.0001_initial` and `expenses.0001_initial`.
* Executed automated test suite (`python backend/manage.py test categories expenses`) -> **All 10 tests passed (OK)** in 11.8s.

### Problems Encountered & Solutions
* *Problem 1:* In `ExpenseModelTests.test_delete_user_workflow`, calling `self.user1.delete()` while active expenses existed on a `PROTECT` category triggered `ProtectedError` during Django's cascade collection.
* *Solution 1:* Clarified the deletion workflow: because `Category` is protected by `Expense`, user account teardown must clean up the user's expenses before deleting the user entity.
* *Problem 2:* Passing an unsaved model instance (`self.user1` after `.delete()`) into a QuerySet filter raised `ValueError: Model instances passed to related filters must be saved`.
* *Solution 2:* Filtered by `user_id` integer rather than the deleted Python in-memory instance.

### Concepts Learned
* Relational database modeling with Django ORM.
* Cascade policies (`models.PROTECT` vs `models.CASCADE`).
* Multi-tenant composite constraints.
* Database index performance mechanics.

### Next Milestone
* **Phase 4 — Category REST API** (Implementing Category serializers, `CategoryViewSet`, object-level permissions, URL routers, validation, and integration tests).



