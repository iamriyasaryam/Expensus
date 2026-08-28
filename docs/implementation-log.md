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
