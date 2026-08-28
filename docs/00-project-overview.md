# 00 — Project Overview: Expensus

## 1. Mission & Vision
**Expensus** is a personal expense-management application designed to provide users with clear visibility into their personal cash flow, spending habits, and categorical expenditures. 

The philosophy behind Expensus is **intentional simplicity, structural elegance, and robust financial integrity**. Rather than overwhelming users with unnecessary social features, predictive crypto trackers, or bloated menus, Expensus focuses on the core financial workflow:
1. Quick and precise expense recording.
2. Intuitive classification by custom categories.
3. Rapid searching, filtering, and pagination across historical transactions.
4. Actionable analytics through clean visual aggregations (monthly totals, category distributions, recent activity).

---

## 2. Target Audience & User Persona
* **Primary Persona: The Conscious Spender / Budget Tracker**
  * **Profile:** An individual looking to track personal daily expenses across various categories (e.g., Food, Housing, Utilities, Transportation, Entertainment, Health).
  * **Core Needs:** 
    * Fast data entry on desktop and mobile browsers.
    * Real-time calculation of monthly spending vs. category budgets.
    * Privacy and strict data isolation (only the authenticated user can access their personal financial records).
    * Clear visual feedback (charts, graphs, clean tables).

---

## 3. High-Level System Overview
Expensus is architected as a **modular monolith** with a decoupled frontend:
* **Frontend:** A responsive Single Page Application (SPA) built with React 18, TypeScript, Vite, and Tailwind CSS.
* **Backend:** A RESTful API built with Python, Django, and Django REST Framework (DRF).
* **Database:** A relational PostgreSQL database with exact decimal precision for financial arithmetic.
* **Security & Auth:** Stateless JSON Web Token (JWT) authentication isolating tenant data per user.

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|   React 18 + TypeScript + Tailwind CSS + TanStack Query     |
+------------------------------+------------------------------+
                               |
                               | HTTPS / REST (JSON + JWT)
                               v
+-------------------------------------------------------------+
|                    Django REST Framework                    |
|      (Auth / Users, Categories, Expenses, Analytics)        |
+------------------------------+------------------------------+
                               |
                               | Django ORM (SQL / Decimal)
                               v
+-------------------------------------------------------------+
|                     PostgreSQL Database                     |
+-------------------------------------------------------------+
```

---

## 4. Key Architectural & Product Principles
1. **Financial Precision:** All monetary amounts are handled as high-precision decimals (`Decimal`/`NUMERIC`), never IEEE-754 floating-point numbers.
2. **Strict Multi-Tenancy / Data Isolation:** Every database entity (`Category`, `Expense`) strictly belongs to a specific `User`. The backend enforces user ownership from the verified JWT payload, never trusting user IDs sent in client payloads.
3. **Pedagogical Clarity:** Every component, endpoint, database relationship, and design decision is documented with clear rationale to serve as an engineering benchmark.
