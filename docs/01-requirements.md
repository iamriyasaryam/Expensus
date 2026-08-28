# 01 — Product & System Requirements

## 1. Functional Requirements (FR)

### Module 1: User Authentication & Authorization (AUTH)
* **FR-AUTH-1 (User Registration):** The system shall allow new users to register by providing a valid unique email, password, and optional name. Passwords must meet security complexity standards (minimum 8 characters, hashed with PBKDF2/Argon2 via Django).
* **FR-AUTH-2 (User Login / JWT):** The system shall authenticate users via email and password, returning an access token (short-lived, e.g., 15–30 mins) and a refresh token (longer-lived, e.g., 7 days).
* **FR-AUTH-3 (Token Refresh):** The system shall provide an endpoint to exchange a valid refresh token for a new access token without re-entering credentials.
* **FR-AUTH-4 (Data Isolation):** Authenticated users shall only be able to view, create, edit, and delete their own categories and expenses. No user shall ever access or manipulate another user's financial records.

### Module 2: Category Management (CAT)
* **FR-CAT-1 (Create Category):** A user shall be able to create custom categories with a `name` (e.g., "Groceries", "Rent", "Salary") and an optional `icon` identifier or color code.
* **FR-CAT-2 (List Categories):** A user shall be able to retrieve a list of all categories they own.
* **FR-CAT-3 (Update Category):** A user shall be able to rename or edit the icon of an existing category they own.
* **FR-CAT-4 (Delete Category):** A user shall be able to delete a category. If expenses are linked to the deleted category, the system shall handle deletion safely (e.g., prevent deletion if active expenses exist, or reassign expenses to an 'Uncategorized' default).

### Module 3: Expense Management (EXP)
* **FR-EXP-1 (Create Expense):** A user shall be able to record an expense by specifying:
  * `amount`: Positive decimal value (e.g., `45.50`).
  * `category`: Valid foreign key reference to a category owned by the user.
  * `description`: Optional text describing the transaction (up to 255 chars).
  * `expense_date`: The date when the expense occurred (defaults to current date).
  * `payment_method`: Choice field (e.g., `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `BANK_TRANSFER`).
* **FR-EXP-2 (Read/List Expenses):** A user shall be able to view a paginated list of their expenses sorted by date descending by default.
* **FR-EXP-3 (Update Expense):** A user shall be able to modify any field of an existing expense they own (`amount`, `category`, `description`, `expense_date`, `payment_method`).
* **FR-EXP-4 (Delete Expense):** A user shall be able to delete an expense with explicit client-side confirmation.
* **FR-EXP-5 (Search & Filter Expenses):** The system shall support querying expenses by:
  * Category ID / name
  * Date range (`start_date`, `end_date`)
  * Payment method
  * Text search on `description`
  * Ordering (by `expense_date` ascending/descending or `amount` ascending/descending)

### Module 4: Analytics & Dashboard (ANL)
* **FR-ANL-1 (Summary Cards):** The system shall compute and display:
  * Total lifetime spending
  * Current month's total spending
  * Today's spending
* **FR-ANL-2 (Monthly Trend Analysis):** The system shall provide monthly aggregated totals for the last 6–12 months to render trend charts.
* **FR-ANL-3 (Category Breakdown):** The system shall calculate the percentage and total amount spent per category for the selected month to render distribution charts (e.g., Pie/Donut charts).
* **FR-ANL-4 (Recent Transactions):** The dashboard shall display the 5 most recent expenses.

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Data Integrity & Precision
* Monetary values must be stored using fixed-point `NUMERIC(10, 2)` (or Django `DecimalField(max_digits=10, decimal_places=2)`) to eliminate floating-point calculation errors.
* Database operations affecting multiple tables must execute within ACID transactions.

### NFR-2: Security
* All API endpoints (except `/api/auth/register/` and `/api/auth/login/`) must require a valid JWT Bearer token in the `Authorization` header.
* CORS headers must restrict origins to trusted frontend domains.
* Input validation must occur at both frontend and backend serializer layers to prevent SQL injection, XSS, and parameter tampering.
* Secrets and credentials must never be committed to source control; they must be managed via `.env` files.

### NFR-3: Performance
* REST API response times for standard CRUD queries should remain under 150ms under typical loads.
* Database queries involving foreign keys (`user_id`, `category_id`, `expense_date`) must be indexed.
* Paginated responses should default to a limit of 10–25 items to prevent unbounded memory consumption.

### NFR-4: Usability & Responsiveness
* The UI must be fully responsive across mobile (>= 375px), tablet, and desktop (>= 1280px) viewports.
* All asynchronous operations (loading data, submitting forms, deleting entries) must present clear visual loading and error states.

### NFR-5: Maintainability & Code Quality
* Both frontend and backend codebases must adhere to modular separation of concerns.
* Type safety must be enforced in the frontend with strict TypeScript types matching the backend API contracts.
