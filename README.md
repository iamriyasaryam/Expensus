# Expensus — Personal Expense Management & Financial Intelligence

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-Framework-red?logo=django)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)

<p align="center">
  A high-precision, multi-tenant personal expense management application engineered with a <strong>modular Django REST Framework</strong> backend and a modern <strong>React + TypeScript + Tailwind CSS</strong> frontend.
</p>

</div>

---

## 🌟 Key Highlights & Features

- **💰 Exact Decimal Precision:** Eliminates floating-point rounding errors across all monetary transactions using Python `decimal.Decimal` and PostgreSQL `NUMERIC(10,2)`.
- **🛡️ Zero-Trust Multi-Tenancy:** Strict user-level data isolation where all queries, aggregates, and mutations are scoped automatically to `request.user`.
- **🔐 Secure JWT Authentication:** Stateless token authorization powered by SimpleJWT with short-lived access tokens, automatic refresh rotation, and server-side token blacklisting on logout.
- **⚡ Real-Time Financial Aggregation:** Server-side database aggregations (`Sum`, `Count`, `Coalesce`, `TruncMonth`) delivering instant summary statistics, category breakdown distributions, and trailing 6-month historical trends.
- **🏷️ Dynamic Category Taxonomy:** Customizable categories with Lucide SVG icons and preset color palettes, protected by database cascade deletion rules (`models.PROTECT`).
- **🎨 Glassmorphic Dark UI:** Responsive design system built with Tailwind CSS design tokens, Inter typography, accessible form inputs, and animated feedback toasts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query v5), React Router v6, Axios, Lucide Icons |
| **Backend** | Python 3.11+, Django 5.x, Django REST Framework, django-filter, djangorestframework-simplejwt |
| **Database** | PostgreSQL 16 (Development / Production), SQLite (Isolated CI/CD Testing) |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Repository Architecture

```text
Expensus/
├── backend/                        # Django REST API Modular Monolith
│   ├── config/                     # Split settings (base, development, production) & root URLs
│   ├── users/                      # Custom User model, JWT auth, registration, profile & security
│   ├── categories/                 # Category models, serializers, ViewSets & tests
│   ├── expenses/                   # Expense models, dual read/write serializers, filters & tests
│   ├── analytics/                  # Financial aggregation engine, services & dashboard API
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                       # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── app/                    # App entrypoint, providers, and protected routing
│   │   ├── components/             # Layout (Navbar, Sidebar) & UI primitives (Button, Card, Input, Toast)
│   │   ├── features/               # Domain modules (auth, categories, expenses, dashboard)
│   │   ├── services/               # Axios API client with automatic JWT token refresh queue
│   │   └── types/                  # Strict TypeScript contracts and DTOs
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                           # Architecture Documentation & Pedagogical Logs
│   ├── 00-project-overview.md
│   ├── 01-requirements.md
│   ├── 02-architecture.md
│   ├── 03-database-design.md
│   ├── 04-api-design.md
│   ├── 05-authentication.md
│   ├── 06-frontend-architecture.md
│   ├── 07-testing.md
│   ├── 08-deployment.md
│   ├── decisions.md                # Architecture Decision Records (ADRs)
│   ├── learning-log.md             # Pedagogical concept guides & check questions
│   └── implementation-log.md       # Chronological development milestone audit
│
└── docker-compose.yml              # Local container stack configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.11+)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/iamriyasaryam/Expensus.git
cd Expensus
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Run backend development server
python backend/manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Visit **`http://localhost:5173`** to access the web application.

---

## 🧪 Running Automated Tests

Run the complete backend unit and integration test suite (covering models, permissions, multi-tenancy, filtering, and arithmetic):

```bash
# Windows PowerShell:
$env:USE_SQLITE="True"; .\.venv\Scripts\python backend/manage.py test users categories expenses analytics

# macOS / Linux:
USE_SQLITE=True python backend/manage.py test users categories expenses analytics
```

Verify frontend TypeScript compilation and bundle production:
```bash
cd frontend
npm run build
```

---

## 🗺️ Implementation Roadmap

- [x] **Phase 0:** Architecture & System Specifications (`docs/`)
- [x] **Phase 1:** Repository & Development Environment Setup
- [x] **Phase 2:** Backend Foundation & Custom User Model (`AUTH_USER_MODEL`)
- [x] **Phase 3:** Relational Database Modeling (`Category`, `Expense`, constraints, indexes)
- [x] **Phase 4:** Category REST API (Multi-tenancy & `ProtectedError` interception)
- [x] **Phase 5:** Expense REST API (`select_related`, `django-filter`, search & pagination)
- [x] **Phase 6:** JWT Authentication & Security (Rotation, blacklisting, profile & password change)
- [x] **Phase 7:** Analytics & Dashboard Aggregation Engine (`Sum`, `Coalesce`, `TruncMonth`)
- [x] **Phase 8:** Frontend Foundation & Design System (Vite, Tailwind CSS, Axios interceptors)
- [x] **Phase 9:** Frontend Authentication Flow (Form validation, password toggles, Toast feedback)
- [x] **Phase 10:** Category Management UI (Icon/color selectors, CRUD modals, cascade protection alerts)
- [ ] **Phase 11:** Expense Management UI (Paginated ledger table, multi-parameter filters, modals)
- [ ] **Phase 12:** Analytics Dashboard UI (Interactive Recharts charts, spending curves, KPI widgets)
- [ ] **Phase 13:** End-to-End Integration, Dockerization & Production Polish

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
