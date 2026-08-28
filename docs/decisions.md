# Architecture Decision Records (ADRs)

This document records the foundational architectural decisions made in **Expensus**, following the standard ADR format: **Context, Decision, Rationale, Alternatives Considered & Rejected, and Consequences**.

---

## ADR-001: Modular Monolith Architecture
* **Status:** Accepted
* **Decision:** Build the backend as a single Django modular monolith with strictly decoupled app domains (`users`, `categories`, `expenses`, `analytics`).
* **Why:** Microservices introduce excessive operational complexity (distributed transactions, network latency, independent deployment pipelines, service meshes) that provides zero benefit for an early-to-mid stage personal expense tracker. A modular monolith provides the clean domain separation of microservices with the simplicity and transactional integrity of a single codebase and database.
* **Alternatives Rejected:** 
  * *Microservices:* Rejected due to unnecessary operational complexity.
  * *Single Giant App:* Rejected because mixing auth, categories, expenses, and analytics into one `views.py` and `models.py` leads to spaghetti code.
* **Consequences:** All apps share the same database instance; transactions can span apps cleanly; apps can be split into separate services in the future if scale demands it.

---

## ADR-002: PostgreSQL as Primary Database
* **Status:** Accepted
* **Decision:** Use PostgreSQL as the relational database.
* **Why:** PostgreSQL is the industry gold standard for ACID compliance, relational integrity, robust indexing (B-tree, Hash, GIN), rich date/time arithmetic, and native support for arbitrary-precision numeric types (`NUMERIC`).
* **Alternatives Rejected:**
  * *SQLite:* Great for quick prototypes, but lacks concurrent write throughput, robust date manipulation functions, and production-grade connection pooling.
  * *MongoDB / NoSQL:* Financial transactions have strict relational constraints (Expenses belong to Users and Categories). Schema-less documents risk data corruption and lack foreign key cascade guarantees.
* **Consequences:** Requires PostgreSQL to be running locally (via Docker) and managed in production.

---

## ADR-003: Fixed Decimal Precision for Monetary Amounts
* **Status:** Accepted
* **Decision:** Store all monetary amounts using `DecimalField(max_digits=10, decimal_places=2)` in Django, mapping to `NUMERIC(10, 2)` in PostgreSQL. Python `decimal.Decimal` objects must be used for calculations.
* **Why:** Binary floating-point numbers (`float`) adhere to IEEE-754 standards, which cannot represent base-10 fractions (like `0.1` or `0.01`) without infinitesimal rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). In financial calculations, rounding drift is catastrophic.
* **Alternatives Rejected:**
  * *Float / Double:* Rejected due to binary rounding inaccuracies.
  * *Integer (Storing Cents):* Viable, but adds cognitive overhead of multiplying/dividing by 100 in serializers, frontend forms, and database aggregations. `Decimal(10, 2)` provides exact precision with direct dollar/cent readability.
* **Consequences:** Frontend receives amounts as strings or precise numbers; math operations in Python must use `Decimal`.

---

## ADR-004: Django REST Framework (DRF)
* **Status:** Accepted
* **Decision:** Use Django REST Framework for building the HTTP REST API layer.
* **Why:** DRF provides battle-tested serializers for input validation and object representation, generic ViewSets for standard CRUD patterns, pluggable authentication/permission layers, and seamless pagination and filtering.
* **Alternatives Rejected:**
  * *FastAPI:* Excellent for async I/O, but lacks Django's mature ORM, built-in admin panel, and robust migration system out of the box.
  * *Flask:* Requires assembling multiple third-party libraries for ORM, migrations, serialization, and auth.
* **Consequences:** Standard Django conventions must be followed.

---

## ADR-005: React with TypeScript and Vite
* **Status:** Accepted
* **Decision:** Build the frontend using React 18, TypeScript, and Vite.
* **Why:** TypeScript catches type mismatches between the frontend and backend API contracts at build time. Vite provides sub-second Hot Module Replacement (HMR) and fast Rollup-based production builds.
* **Alternatives Rejected:**
  * *Create React App (CRA):* Deprecated, slow, and unmaintained.
  * *Plain JavaScript:* Too error-prone for financial data schemas and complex form state.
* **Consequences:** Strict type definitions must be maintained for all API payloads.

---

## ADR-006: TanStack Query for Server State Management
* **Status:** Accepted
* **Decision:** Use TanStack Query (React Query) for managing remote server state and caching, rather than Redux or Zustand.
* **Why:** Most state in Expensus is server data (expenses, categories, dashboard charts). TanStack Query handles loading/error states, caching, background refetching, and cache invalidation declaratively out of the box with zero boilerplate.
* **Alternatives Rejected:**
  * *Redux / Redux Toolkit:* Introduces massive boilerplate (actions, reducers, selectors, thunks) to manage asynchronous API caching that TanStack Query handles natively in 2 lines of code.
* **Consequences:** Local React state is used strictly for transient UI state (e.g., modal open/close).

---

## ADR-007: Stateless JWT Authentication
* **Status:** Accepted
* **Decision:** Use `djangorestframework-simplejwt` with short-lived access tokens (15 mins) and long-lived refresh tokens (7 days).
* **Why:** Keeps the backend API stateless, works seamlessly across decoupled ports/domains in development, and provides standard Bearer header authorization.
* **Alternatives Rejected:**
  * *Session Cookies:* Requires session database storage or sticky sessions, and requires complex CSRF cookie handshakes across separate dev origins.
* **Consequences:** Frontend must store tokens safely and handle silent token refresh via Axios interceptors upon receiving `401 Unauthorized`.

---

## ADR-008: Relational Category Model vs Free-Form Strings
* **Status:** Accepted
* **Decision:** Model `Category` as a distinct database table with a Foreign Key relationship on `Expense`.
* **Why:** Free-form string categories lead to typos, inconsistent spelling ("Grocery" vs "Groceries"), and impossible budget tracking. A dedicated entity allows custom colors, icons, user-specific renaming, and reliable group-by analytics.
* **Alternatives Rejected:**
  * *Free-form text field on Expense:* Leads to fragmented data and broken charts.
  * *Hardcoded Enum of categories:* Prevents users from defining their own personal spending categories.
* **Consequences:** Expenses must validate category foreign key ownership upon creation.
