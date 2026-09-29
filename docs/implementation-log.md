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

---

## Log Entry: Milestone 05 — Phase 4: Category REST API

* **Date:** 2026-08-28
* **Milestone:** Phase 4 — Category REST API
* **Goal:** Implement the complete Category REST API (`/api/categories/`) with serializers, ViewSets, zero-trust user ownership enforcement, cascade deletion error handling (`ProtectedError` -> `400 Bad Request`), URL routing, and end-to-end integration testing.

### Files Created / Modified
* `backend/categories/serializers.py` — Implemented `CategorySerializer` with whitespace trimming and case-insensitive uniqueness validation scoped to the authenticated user.
* `backend/categories/views.py` — Implemented `CategoryViewSet` overriding `get_queryset()` (user isolation), `perform_create()` (auto-injecting user), and `destroy()` (graceful `ProtectedError` interception).
* `backend/categories/urls.py` — Configured DRF `DefaultRouter` registering `/api/categories/`.
* `backend/categories/tests.py` — Added 11 comprehensive API integration tests with `APITestCase` testing permissions, CRUD actions, tenant isolation, and deletion protection.

### Changes Made
* Created RESTful endpoints for Category CRUD:
  * `GET /api/categories/` (list user categories)
  * `POST /api/categories/` (create new category)
  * `GET /api/categories/{id}/` (retrieve category)
  * `PATCH /api/categories/{id}/` (update category)
  * `DELETE /api/categories/{id}/` (delete category or return 400 protected error)
* Guaranteed zero-trust user ownership: client cannot access or manipulate other users' categories.

### Tests Performed
* Ran test suite (`python backend/manage.py test categories expenses`) -> **All 21 tests passed (OK)** in 24.2s.
* Verified 401 Unauthorized for unauthenticated requests.
* Verified 404 Not Found when User A attempts to access User B's category.
* Verified 400 Bad Request when attempting to delete a category that contains active expenses.

### Problems Encountered & Solutions
* *Problem:* Standard DRF ModelViewSet `destroy()` bubbles unhandled `ProtectedError` as a 500 Internal Server Error when deleting a category with attached expenses.
* *Solution:* Overrode `destroy()` to catch `ProtectedError` and return `HTTP 400 Bad Request` with structured JSON payload (`code: "category_protected"`).

### Concepts Learned
* DRF serialization and deserialization validation hooks.
* ModelViewSet action dispatch and DefaultRouter mechanics.
* Multi-tenant data scoping at the API layer.
* API integration testing with `APITestCase` and `APIClient`.

### Next Milestone
* **Phase 5 — Expense REST API** (Implementing Expense serializers, `ExpenseViewSet`, `django-filter` integration for date ranges/categories/methods, search, ordering, pagination, and API tests).

---

## Log Entry: Milestone 06 — Phase 5: Expense REST API

* **Date:** 2026-08-28
* **Milestone:** Phase 5 — Expense REST API
* **Goal:** Implement the complete Expense REST API (`/api/expenses/`) with dual write/read serialization, `django-filter` integration, full-text searching, multi-field ordering, pagination, N+1 query elimination via `select_related`, and end-to-end integration testing.

### Files Created / Modified
* `backend/expenses/serializers.py` — Implemented `ExpenseSerializer` accepting `category_id` on write, embedding `CategorySerializer` nested object on read, and verifying category ownership.
* `backend/expenses/filters.py` — Implemented `ExpenseFilter` supporting `start_date`, `end_date`, `month` (`YYYY-MM`), `category`, `payment_method`, `min_amount`, and `max_amount`.
* `backend/expenses/views.py` — Implemented `ExpenseViewSet` with `.select_related('category')`, `DjangoFilterBackend`, `SearchFilter`, and `OrderingFilter`.
* `backend/expenses/urls.py` — Configured DRF `DefaultRouter` registering `/api/expenses/`.
* `backend/expenses/tests.py` — Added 15 comprehensive API integration tests with `APITestCase` covering authentication, CRUD actions, multi-tenancy, cross-user category rejection, filter query combinations, ordering, and pagination.

### Changes Made
* Created RESTful endpoints for Expense management:
  * `GET /api/expenses/` (list user expenses with filters, search, pagination, and sorting)
  * `POST /api/expenses/` (create new expense, auto-assigned to authenticated user)
  * `GET /api/expenses/{id}/` (retrieve single expense)
  * `PATCH /api/expenses/{id}/` (partially update expense)
  * `DELETE /api/expenses/{id}/` (delete expense)
* Resolved N+1 query vulnerability using `.select_related('category')`.
* Prevented cross-tenant category hijacking by validating category ownership in `validate_category_id()`.

### Tests Performed
* Ran test suite (`python backend/manage.py test categories expenses`) -> **All 36 tests passed (OK)** in 29.6s.
* Verified 401 Unauthorized for unauthenticated requests.
* Verified 400 Bad Request when attempting to assign an expense to another user's category.
* Verified filtering by month (`?month=2026-08`), date range (`?start_date=...&end_date=...`), category, amount ranges, and payment method.
* Verified search on description and ordering by `-amount` and `expense_date`.

### Problems Encountered & Solutions
* *Problem:* When returning expenses, the frontend needs category details (name, icon, color) without making an extra network request, but sending a full category dictionary on write is cumbersome for clients.
* *Solution:* Implemented write-only `category_id` (pointing to `source='category'`) and read-only nested `category = CategorySerializer(read_only=True)`.

### Concepts Learned
* DRF dual write/read serialization patterns.
* SQL N+1 query problem and resolution via `.select_related()`.
* Declarative query filtering with `django-filter`.
* Object-level relational validation in serializers.

### Next Milestone
* **Phase 6 — Authentication & JWT Security** (User registration, JWT login, token refresh, token blacklist/logout, password change, and current user profile `/api/auth/me/`).

---

## Log Entry: Milestone 07 — Phase 6: Authentication & JWT Security

* **Date:** 2026-08-28
* **Milestone:** Phase 6 — Authentication & JWT Security
* **Goal:** Implement complete JWT Authentication architecture (`/api/auth/`) with user signup, login with embedded profile data, token rotation, token revocation/blacklisting on logout, profile management (`/api/auth/me/`), password change, and end-to-end integration tests.

### Files Created / Modified
* `backend/config/settings/base.py` — Added `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS` and enabled `BLACKLIST_AFTER_ROTATION = True`.
* `backend/users/serializers.py` — Implemented `RegisterSerializer` (with password strength validation and duplicate email check), `CustomTokenObtainPairSerializer` (with embedded user metadata), `UserSerializer`, and `ChangePasswordSerializer`.
* `backend/users/views.py` — Implemented `RegisterView` (returning user data and JWT tokens), `CustomTokenObtainPairView`, `UserProfileView`, `ChangePasswordView`, and `LogoutView` (blacklisting refresh tokens).
* `backend/users/urls.py` — Configured routing for all authentication and user management endpoints.
* `backend/users/tests.py` — Implemented 21 comprehensive integration tests covering registration edge cases, login validation, token refresh, logout blacklisting, profile updates, and password changes.

### Changes Made
* Created RESTful Authentication endpoints:
  * `POST /api/auth/register/` (registers user and returns access + refresh tokens)
  * `POST /api/auth/login/` (verifies credentials and returns access + refresh tokens with embedded user object)
  * `POST /api/auth/refresh/` (exchanges valid refresh token for a new access token)
  * `POST /api/auth/logout/` (blacklists refresh token to prevent further use)
  * `GET /api/auth/me/` (retrieves current authenticated user profile)
  * `PATCH /api/auth/me/` (updates profile fields `first_name` and `last_name`)
  * `POST /api/auth/change-password/` (validates old password and sets new password)

### Tests Performed
* Ran full test suite (`python backend/manage.py test users categories expenses`) -> **All 57 tests passed (OK)** in 42.8s.
* Verified duplicate email prevention (case-insensitive).
* Verified password validation rules and mismatch detection.
* Verified 401 Unauthorized on invalid login credentials.
* Verified token refresh succeeds and blacklisted token refresh fails with 401.
* Verified `/api/auth/me/` enforces read-only email and allows updating names.
* Verified password update invalidates old password and succeeds with new password.

### Problems Encountered & Solutions
* *Problem:* When a user logs in, the React frontend typically needs both the JWT tokens and the user's basic profile details (e.g. name, email) to display the top navbar immediately without firing an extra `/api/auth/me/` request.
* *Solution:* Overrode `TokenObtainPairSerializer.validate()` to inject `UserSerializer(self.user).data` directly into the login response.

### Concepts Learned
* Stateless JWT authentication mechanics (`Header.Payload.Signature`).
* Refresh token rotation and server-side blacklisting.
* Django password hashing and validator integration.
* Secure profile and password change workflows.

### Next Milestone
* **Phase 7 — Analytics & Dashboard API** (Financial aggregation endpoints, monthly spending trends, category breakdown percentages, total spending stats, and integration tests).

---

## Log Entry: Milestone 08 — Phase 7: Analytics & Dashboard API

* **Date:** 2026-08-28
* **Milestone:** Phase 7 — Analytics & Dashboard API
* **Goal:** Implement the consolidated financial analytics engine at `/api/analytics/dashboard/` providing summary totals (all-time, monthly, today, count), category spending distributions with percentages, trailing 6-month historical trends, and recent transaction logs.

### Files Created / Modified
* `backend/analytics/services.py` — Implemented `AnalyticsService` isolating summary aggregations with `Coalesce` decimal guards, category breakdowns, and `TruncMonth` trailing 6-month historical bucketing.
* `backend/analytics/serializers.py` — Implemented typed response serializers for summary metrics, category breakdowns, monthly trends, and recent expense items.
* `backend/analytics/views.py` — Implemented `DashboardAnalyticsView` with `IsAuthenticated` and optional `?month=YYYY-MM` parameter support.
* `backend/analytics/urls.py` — Configured routing for `/api/analytics/dashboard/`.
* `backend/analytics/tests.py` — Implemented 6 unit and integration tests verifying arithmetic calculations, zero-division safeguards on empty states, trailing month logic, custom month queries, and multi-tenant isolation.

### Changes Made
* Created RESTful Financial Analytics endpoint:
  * `GET /api/analytics/dashboard/` (supports optional `?month=YYYY-MM`)
* Encapsulated heavy calculations within PostgreSQL aggregation pipelines (`Sum`, `Count`, `Coalesce`).
* Formatted category distribution with exact percentage calculations down to 2 decimal places.
* Handled temporal zero-filling for months with $0 activity across the 6-month trend.

### Tests Performed
* Ran full test suite (`python backend/manage.py test users categories expenses analytics`) -> **All 63 tests passed (OK)** in 63.3s.
* Verified 401 Unauthorized for unauthenticated requests.
* Verified empty dataset returns `0.00` totals and empty breakdowns without zero-division exceptions.
* Verified exact accuracy of summary sums and category percentages across multiple users.
* Verified multi-tenant security isolation (User A's analytics never leak User B's transactions).
* Verified custom month query parameter parsing and graceful fallback for invalid date formats.

### Problems Encountered & Solutions
* *Problem:* When computing monthly percentages, months with $0 total spend would cause Python `ZeroDivisionError: division by zero`.
* *Solution:* Added a conditional guard: if `total_spending_month == 0`, percentage defaults safely to `Decimal('0.00')`.

### Concepts Learned
* Relational aggregation with Django ORM (`Sum`, `Count`, `Coalesce`, `TruncMonth`).
* Decoupling business logic from HTTP views via dedicated service classes (`services.py`).
* Multi-tenant statistical data isolation.
* Temporal windowing and zero-filling for continuous chart time-series.

### Next Milestone
* **Phase 8 — Frontend Foundation & Design System** (Vite + React + TypeScript setup, Tailwind CSS / shadcn-ui token configuration, Axios API client with JWT interceptors, auth state management with Zustand).

---

## Log Entry: Milestone 09 — Phase 8: Frontend Foundation & Design System

* **Date:** 2026-08-28
* **Milestone:** Phase 8 — Frontend Foundation & Design System
* **Goal:** Initialize React 18 + TypeScript + Vite frontend with Tailwind CSS design tokens, Axios JWT interceptors, auto-refresh token queues, AuthContext state management, application shell (Navbar, Sidebar, MainLayout), and React Router v6 guarded route tree.

### Files Created / Modified
* `frontend/package.json` — Configured dependencies (React, Vite, TypeScript, Tailwind, TanStack Query, Axios, Lucide).
* `frontend/vite.config.ts` — Configured Vite dev server proxying `/api` to Django backend `http://127.0.0.1:8000`.
* `frontend/tailwind.config.js` & `src/index.css` — Configured dark glassmorphic design tokens, Inter font, and layout utilities.
* `frontend/src/types/` — Structured TypeScript contracts for Auth, Category, Expense, Analytics, and API pagination.
* `frontend/src/services/api.ts` & `authService.ts` — Implemented Axios client with bearer token injection, 401 interception, and concurrent refresh queueing.
* `frontend/src/features/auth/AuthContext.tsx` & `useAuth.ts` — Built session management with localStorage token persistence.
* `frontend/src/components/ui/` — Implemented `Button`, `Card`, `Input`, `Badge`, and `LoadingSpinner`.
* `frontend/src/components/layout/` — Implemented `Navbar`, `Sidebar`, and `MainLayout`.
* `frontend/src/app/AppRouter.tsx` — Built declarative routing with `ProtectedRoute` and `PublicRoute`.
* `frontend/src/pages/` — Implemented `LoginPage`, `RegisterPage`, `DashboardPage`, `ExpensesPage`, `CategoriesPage`, and `ProfilePage`.

### Changes Made
* Successfully built full frontend client architecture.
* Connected client-side router and state to Django REST APIs.
* Tested and confirmed production build (`npm run build`) generates clean distribution bundle without type errors.

### Tests Performed
* TypeScript compilation & Vite bundle build (`npm run build`) -> **100% Passed (built in 33.7s)**.
* Live server response test: `Invoke-WebRequest -Uri "http://localhost:5173/"` -> **HTTP 200 OK**.
* Live API integration test: Registered `riya@expensus.local`, authenticated via JWT login, and fetched live dashboard aggregations with Bearer access token -> **HTTP 200 OK**.

### Problems Encountered & Solutions
* *Problem:* When multiple API calls fail simultaneously with 401, multiple duplicate refresh requests would fire.
* *Solution:* Implemented an `isRefreshing` lock with a `failedQueue` array to pause and batch retry all requests once the fresh access token is acquired.

### Concepts Learned
* Separation of Server State (TanStack Query) vs Client State (React Context).
* Token refresh queuing and Axios interceptor mechanics.
* Design system tokenization and glassmorphism styling in Tailwind CSS.
* Declarative route guards with React Router v6.

### Next Milestone
* **Phase 9 — Frontend Authentication Flow** (Enhanced form validations, error tooltips, session persistence feedback, and animated transitions).

---

## Log Entry: Milestone 10 — Phase 9: Frontend Authentication Flow

* **Date:** 2026-08-28
* **Milestone:** Phase 9 — Frontend Authentication Flow
* **Goal:** Enhance authentication and user management UI with client-side form validation, password visibility toggles, dynamic password strength checklists, timed Toast alerts, and interactive profile/password updating.

### Files Created / Modified
* `frontend/src/components/ui/Toast.tsx` — Built auto-dismissing animated Toast notification component with success/error/info styling.
* `frontend/src/pages/LoginPage.tsx` — Added password visibility toggle, regex email validation, and refined error banners.
* `frontend/src/pages/RegisterPage.tsx` — Added dual password visibility toggles, real-time password length ($\ge 8$) and match validation checklists.
* `frontend/src/pages/ProfilePage.tsx` — Integrated interactive Toast feedback for name updates and password changes, with visibility toggles for old and new passwords.

### Changes Made
* Delivered comprehensive client-side form verification preventing unnecessary failed API calls.
* Provided clear visual indicators assisting users with password requirements.
* Wired instant feedback for profile and password update mutations.

### Tests Performed
* TypeScript compilation & Vite build (`npm run build`) -> **100% Passed (built in 30.9s)**.
* Backend test suite -> **All 63 tests passing**.

### Problems Encountered & Solutions
* *Problem:* Users could submit invalid email formats or mismatched passwords without immediate feedback until a backend roundtrip failed.
* *Solution:* Implemented client-side pre-flight regex and length checks alongside real-time checklist indicators.

### Concepts Learned
* Client-side validation strategies and UX feedback loops.
* Accessible password reveal toggles.
* Ephemeral notification management and cleanup with React hooks.

### Next Milestone
* **Phase 10 — Category Management UI** (Category cards grid, color/icon picker, add/edit/delete modals, and `ProtectedError` cascade handling).









