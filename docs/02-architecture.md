# 02 — System Architecture

## 1. Architectural Philosophy: The Modular Monolith

Expensus adopts a **Modular Monolith** pattern for the backend paired with a decoupled **Single Page Application (SPA)** on the frontend.

### Why a Modular Monolith?
* **Simplicity & Velocity:** Avoids the operational overhead of microservices (network latency, service discovery, distributed tracing, polyglot persistence) while maintaining strict domain separation.
* **Clear Domain Boundaries:** Business logic is organized into distinct Django applications (`users`, `categories`, `expenses`, `analytics`). Each app owns its models, serializers, views, and business rules.
* **Single Deployment Unit:** Deploys as a unified containerized process, greatly simplifying CI/CD and production maintenance.

```
+-------------------------------------------------------------------------+
|                                FRONTEND                                 |
|   React 18 (TypeScript) + Vite + Tailwind CSS + shadcn/ui               |
|                                                                         |
|   [ Pages ] <--> [ Features (Auth, Expenses, Categories, Dashboard) ]  |
|                             |                                           |
|                     [ TanStack Query ] (Server State & Cache)           |
|                             |                                           |
|                     [ Axios Client ] (JWT Interceptor)                  |
+-----------------------------+-------------------------------------------+
                              |
                              | HTTP / JSON (REST API + JWT Bearer)
                              v
+-------------------------------------------------------------------------+
|                                BACKEND                                  |
|   Django 5.x + Django REST Framework (WSGI / ASGI)                      |
|                                                                         |
|   [ Security Middleware (CORS, SecurityHeaders, JWT Authentication) ]   |
|                                                                         |
|   [ URL Routing (config/urls.py -> App URLs) ]                          |
|                                                                         |
|   +-------------------+  +-------------------+  +-------------------+  |
|   |    users App      |  |  categories App   |  |   expenses App    |  |
|   |  - Custom User    |  |  - Category Model |  |  - Expense Model  |  |
|   |  - SimpleJWT Auth |  |  - Serializers    |  |  - django-filter  |  |
|   |  - Serializers    |  |  - CategoryViewSet|  |  - ExpenseViewSet |  |
|   +-------------------+  +-------------------+  +-------------------+  |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                          analytics App                          |   |
|   |  - Aggregation Views (Sum, Avg, TruncMonth, GroupBy Category)   |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   [ Django ORM (Object-Relational Mapping, Decimal Precision) ]        |
+-----------------------------+-------------------------------------------+
                              |
                              | SQL / TCP Connection
                              v
+-------------------------------------------------------------------------+
|                          DATABASE: PostgreSQL                           |
|   Tables: users_user, categories_category, expenses_expense             |
+-------------------------------------------------------------------------+
```

---

## 2. End-to-End Request-Response Lifecycle

Let us trace what happens when a user creates a new expense in the application:

```
[ User Interaction ]
   │  1. User fills "New Expense" form ($45.50 for "Groceries") and clicks "Save"
   ▼
[ React Form Component ]
   │  2. Validates client-side constraints (amount > 0, category selected)
   ▼
[ TanStack Query Mutation (`useCreateExpense`) ]
   │  3. Dispatches mutation call to API service
   ▼
[ Axios HTTP Client ]
   │  4. Request Interceptor injects `Authorization: Bearer <access_token>`
   │  5. Sends `POST /api/expenses/` with JSON payload `{ amount: "45.50", category: 1, ... }`
   ▼
[ Network (HTTPS / TCP) ]
   ▼
[ Web Server & Django WSGI ]
   │  6. Receives raw HTTP request, creates `HttpRequest` object
   ▼
[ Django Middleware Pipeline ]
   │  7. `CorsMiddleware`: Checks origin header
   │  8. `JWTAuthenticationMiddleware`: Decodes token, validates signature & expiration,
   │     populates `request.user` with the authenticated User object
   ▼
[ URL Router (`config/urls.py` -> `expenses/urls.py`) ]
   │  9. Resolves URL to `ExpenseViewSet.create()`
   ▼
[ DRF Permission Layer (`IsAuthenticated`) ]
   │ 10. Checks `request.user.is_authenticated`. If false, returns `401 Unauthorized`
   ▼
[ ExpenseSerializer Validation ]
   │ 11. Validates fields (`amount` is valid positive decimal, date is valid)
   │ 12. Validates that the selected `category` actually belongs to `request.user`
   ▼
[ ExpenseViewSet & Django ORM ]
   │ 13. Calls `serializer.save(user=request.user)` (forces `user` to be the authenticated user)
   │ 14. Executes SQL `INSERT INTO expenses_expense (...) VALUES (...)`
   ▼
[ PostgreSQL Database ]
   │ 15. Writes row with atomic transaction, enforces foreign key constraints, returns generated ID
   ▼
[ DRF Response Serialization ]
   │ 16. Returns `201 Created` with serialized expense JSON
   ▼
[ Axios & TanStack Query ]
   │ 17. TanStack Query catches success response, invalidates `['expenses']` and `['dashboard']` caches
   ▼
[ React UI Re-render ]
   │ 18. UI automatically displays the new expense in the table and updates dashboard totals
```

---

## 3. Separation of Concerns & Directory Responsibilities

### Backend Architecture
* **`config/`**: Contains global Django settings (split into base, dev, prod), WSGI/ASGI entrypoints, and root URL routing.
* **`users/`**: Encapsulates user identity, custom User model extending `AbstractBaseUser`, registration, and JWT token issuance.
* **`categories/`**: Encapsulates spending categories, icon identifiers, and category validation.
* **`expenses/`**: Encapsulates transaction tracking, decimal arithmetic, filtering via `django-filter`, and pagination.
* **`analytics/`**: Encapsulates read-only aggregations and statistical queries without polluting transactional models.

### Frontend Architecture
* **`app/`**: Root application setup, router definition (`AppRouter.tsx`), and global provider tree (`QueryClientProvider`, `AuthProvider`).
* **`features/`**: Feature-first structure where all state hooks, components, and forms for a domain live together (`features/expenses`, `features/categories`, `features/dashboard`, `features/auth`).
* **`components/`**: Pure, reusable presentation components (buttons, dialogs, inputs, data tables) styled with Tailwind CSS.
* **`services/`**: Network communication abstraction using Axios instances and interceptors.
* **`types/`**: TypeScript interfaces defining exact contracts for backend entities and API responses.
