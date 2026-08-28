# 04 — REST API Design & Contracts

## 1. Global API Conventions

* **Base URL:** `/api`
* **Data Format:** JSON (`application/json`)
* **Authentication Header:** `Authorization: Bearer <access_token>`
* **Standard Pagination Structure:**
```json
{
  "count": 48,
  "next": "https://api.expensus.com/api/expenses/?page=2",
  "previous": null,
  "results": [ ... ]
}
```
* **Standard Error Response Structure:**
```json
{
  "detail": "Invalid credentials.",
  "errors": {
    "email": ["A user with this email already exists."],
    "amount": ["Ensure that this value is greater than 0."]
  }
}
```

---

## 2. API Endpoints Catalog

### Authentication Endpoints (`/api/auth/`)
| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new user account | No | `201 Created` |
| `POST` | `/api/auth/login/` | Authenticate & retrieve JWT pair | No | `200 OK` |
| `POST` | `/api/auth/refresh/` | Exchange refresh token for new access token | No | `200 OK` |
| `GET` | `/api/auth/me/` | Retrieve current authenticated user profile | Yes | `200 OK` |

#### Payload Examples
* **POST `/api/auth/register/` Request:**
```json
{
  "email": "riya@example.com",
  "password": "SecurePassword123!",
  "first_name": "Riya",
  "last_name": "Saryam"
}
```
* **POST `/api/auth/login/` Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "riya@example.com",
    "first_name": "Riya",
    "last_name": "Saryam"
  }
}
```

---

### Categories Endpoints (`/api/categories/`)
| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories/` | List all categories for the authenticated user | Yes | `200 OK` |
| `POST` | `/api/categories/` | Create a new custom category | Yes | `201 Created` |
| `GET` | `/api/categories/{id}/` | Retrieve specific category details | Yes | `200 OK` |
| `PUT`/`PATCH`| `/api/categories/{id}/` | Update an existing category | Yes | `200 OK` |
| `DELETE` | `/api/categories/{id}/` | Delete a category (if no active expenses) | Yes | `204 No Content` |

#### Payload Examples
* **POST `/api/categories/` Request:**
```json
{
  "name": "Groceries",
  "icon": "shopping-cart",
  "color": "#10B981"
}
```
* **GET `/api/categories/` Response:**
```json
[
  {
    "id": 1,
    "name": "Groceries",
    "icon": "shopping-cart",
    "color": "#10B981",
    "created_at": "2026-08-28T10:00:00Z"
  }
]
```

---

### Expenses Endpoints (`/api/expenses/`)
| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses/` | List, filter, search, and paginate user expenses | Yes | `200 OK` |
| `POST` | `/api/expenses/` | Create a new expense record | Yes | `201 Created` |
| `GET` | `/api/expenses/{id}/` | Retrieve specific expense record | Yes | `200 OK` |
| `PUT`/`PATCH`| `/api/expenses/{id}/` | Update specific expense | Yes | `200 OK` |
| `DELETE` | `/api/expenses/{id}/` | Delete specific expense | Yes | `204 No Content` |

#### Query Parameters for `GET /api/expenses/`
* `page`: Page number (integer, default `1`)
* `page_size`: Results per page (integer, default `10`, max `100`)
* `category`: Filter by category ID (e.g. `?category=1`)
* `start_date`: Filter on or after date (`YYYY-MM-DD`, e.g. `?start_date=2026-08-01`)
* `end_date`: Filter on or before date (`YYYY-MM-DD`, e.g. `?end_date=2026-08-31`)
* `payment_method`: Filter by payment method (`CASH`, `CREDIT_CARD`, `UPI`, etc.)
* `search`: Case-insensitive text search on `description` (e.g. `?search=supermarket`)
* `ordering`: Sort field (e.g. `?ordering=-expense_date` or `?ordering=amount`)

#### Payload Examples
* **POST `/api/expenses/` Request:**
```json
{
  "category": 1,
  "amount": "45.50",
  "description": "Weekly grocery trip at Whole Foods",
  "expense_date": "2026-08-28",
  "payment_method": "CREDIT_CARD"
}
```
* **GET `/api/expenses/{id}/` Response:**
```json
{
  "id": 101,
  "category": {
    "id": 1,
    "name": "Groceries",
    "icon": "shopping-cart",
    "color": "#10B981"
  },
  "amount": "45.50",
  "description": "Weekly grocery trip at Whole Foods",
  "expense_date": "2026-08-28",
  "payment_method": "CREDIT_CARD",
  "created_at": "2026-08-28T10:15:30Z",
  "updated_at": "2026-08-28T10:15:30Z"
}
```

---

### Analytics & Dashboard Endpoints (`/api/analytics/`)
| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard/` | Retrieve summary stats, monthly trend, & category breakdown | Yes | `200 OK` |

#### Payload Example
* **GET `/api/analytics/dashboard/?month=2026-08` Response:**
```json
{
  "summary": {
    "total_spending_all_time": "14250.00",
    "total_spending_month": "1840.50",
    "total_spending_today": "45.50",
    "expense_count_month": 32
  },
  "category_breakdown": [
    {
      "category_id": 1,
      "category_name": "Groceries",
      "color": "#10B981",
      "total_amount": "620.00",
      "percentage": 33.69
    },
    {
      "category_id": 2,
      "category_name": "Rent",
      "color": "#3B82F6",
      "total_amount": "1000.00",
      "percentage": 54.33
    }
  ],
  "monthly_trend": [
    { "month": "2026-03", "total": "1650.00" },
    { "month": "2026-04", "total": "1720.00" },
    { "month": "2026-05", "total": "1580.00" },
    { "month": "2026-06", "total": "1890.00" },
    { "month": "2026-07", "total": "1750.00" },
    { "month": "2026-08", "total": "1840.50" }
  ],
  "recent_expenses": [
    {
      "id": 101,
      "category_name": "Groceries",
      "amount": "45.50",
      "description": "Weekly grocery trip",
      "expense_date": "2026-08-28"
    }
  ]
}
```
