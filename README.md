# Expensus — Personal Expense Management System

> A focused, modular, and high-precision personal expense tracking application built with **React**, **TypeScript**, **Django REST Framework**, and **PostgreSQL**.

---

## 📚 Documentation Index

Expensus is built with architectural rigor and clear documentation. Explore our complete design specifications below:

| Document | Description |
| :--- | :--- |
| **[00 — Project Overview](file:///docs/00-project-overview.md)** | Product vision, target audience, core principles, and scope boundaries. |
| **[01 — Requirements](file:///docs/01-requirements.md)** | Functional (FR) and Non-Functional (NFR) system requirements. |
| **[02 — Architecture](file:///docs/02-architecture.md)** | Modular monolith structure, component architecture, and request lifecycle. |
| **[03 — Database Design](file:///docs/03-database-design.md)** | Relational schema, ER diagram, `Decimal(10,2)` precision, and indexing. |
| **[04 — API Design](file:///docs/04-api-design.md)** | REST API endpoint contracts, query parameters, payloads, and status codes. |
| **[05 — Authentication](file:///docs/05-authentication.md)** | Stateless JWT lifecycle, token rotation, and zero-trust user ownership. |
| **[06 — Frontend Architecture](file:///docs/06-frontend-architecture.md)** | React component hierarchy, feature modules, and TanStack Query state caching. |
| **[07 — Testing Strategy](file:///docs/07-testing.md)** | Testing pyramid, backend `APITestCase`, and quality assurance standards. |
| **[08 — Deployment](file:///docs/08-deployment.md)** | Docker containerization, production environments, and release checklists. |
| **[Decisions (ADRs)](file:///docs/decisions.md)** | Architecture Decision Records (ADR-001 to ADR-008) explaining all tech choices. |
| **[Learning Log](file:///docs/learning-log.md)** | Pedagogical notes, concepts learned, code examples, and check questions. |
| **[Implementation Log](file:///docs/implementation-log.md)** | Chronological log of all milestones, file changes, and test results. |

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Axios, Recharts
* **Backend:** Python 3.11+, Django 5.x, Django REST Framework, django-filter, SimpleJWT
* **Database:** PostgreSQL 16 (Exact `NUMERIC(10,2)` for financial calculations)
* **DevOps & Tooling:** Docker, Docker Compose, Git

---

## 🗺️ Project Roadmap

- [x] **Phase 0:** Project Definition & Architecture Documentation
- [ ] **Phase 1:** Repository & Development Environment Setup (Docker Compose, Git, .env)
- [ ] **Phase 2:** Backend Foundation (Django, DRF, split settings, PostgreSQL connection)
- [ ] **Phase 3:** Database Modeling & Migrations (`User`, `Category`, `Expense`)
- [ ] **Phase 4:** Category REST API (Serializers, ViewSets, validation, permissions)
- [ ] **Phase 5:** Expense REST API (CRUD, filters, search, pagination)
- [ ] **Phase 6:** JWT Authentication & User Ownership Security
- [ ] **Phase 7:** Frontend Foundation (Vite, React, TypeScript, Tailwind, Axios, QueryClient)
- [ ] **Phase 8:** Expense Management UI (Table, forms, modals, filters)
- [ ] **Phase 9:** Dashboard & Analytics (KPI cards, Recharts visualizations)
- [ ] **Phase 10:** UX Polish & Error Handling (Toasts, loading skeletons, responsive design)
- [ ] **Phase 11:** Automated Testing Suite (Backend unit & API integration tests)
- [ ] **Phase 12:** Production Readiness (CORS, security headers, WhiteNoise static files)
- [ ] **Phase 13:** Deployment Runbook & Hosting
