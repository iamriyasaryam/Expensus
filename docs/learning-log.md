# Expensus — Learning Log

The Learning Log tracks architectural concepts, financial computing rules, and full-stack patterns introduced across milestones.

---

# Milestone 01: Phase 0 — Project Definition & System Architecture

## Concept
1. **Architecture Decision Records (ADRs):** A standard software engineering framework to record why certain technologies, patterns, and data structures are chosen over alternatives.
2. **Fixed-Point Financial Arithmetic (`Decimal` / `NUMERIC`):** Storing and computing currency values using base-10 exact representation instead of binary floating-point (`float`).
3. **Decoupled Stateless Architecture:** Separating a React Single Page Application (SPA) from a Django REST Framework backend using JSON Web Tokens (JWT) for stateless authorization.
4. **Server State vs. Client State:** Separating persistent backend cached data from local, transient UI state.

---

## Why
* Without ADRs, engineering teams forget the trade-offs behind key decisions (e.g. why PostgreSQL over MongoDB).
* Without `Decimal`, financial software produces rounding errors (like `$0.01` discrepancies) that corrupt user financial reports and accounting ledgers.
* Without stateless JWTs, frontend and backend cannot easily run on separate origins or scale horizontally without shared session stores.
* Without separating server state, React codebases suffer from bloated global stores (Redux) attempting to duplicate database state.

---

## How
* **Decimal Precision:** In Python, the `decimal.Decimal` module provides arbitrary precision arithmetic. In PostgreSQL, `NUMERIC(10, 2)` allocates 10 total digits with 2 decimal places.
* **Stateless Authorization:** The server issues an HMAC-SHA256 signed token containing the `user_id`. When received in the `Authorization: Bearer <token>` header, the server verifies the cryptographic signature without querying a session table.
* **Server State Management:** TanStack Query intercepts network requests, caches the JSON payload with a cache key (e.g. `['expenses', { page: 1 }]`), and re-uses it until mutated or invalidated.

---

## Implementation
* **Architecture & System Contracts:** `docs/00-project-overview.md` to `docs/08-deployment.md`
* **Architectural Decisions:** `docs/decisions.md` (ADR-001 through ADR-008)
* **Master Implementation Plan:** `implementation_plan.md`

---

## Example
### Python Float vs Decimal Comparison in Expensus
```python
from decimal import Decimal

# Using standard floating point (INCORRECT for finance):
cost_1 = 0.10
cost_2 = 0.20
total_float = cost_1 + cost_2
print(f"Float Total: {total_float}")
# Output: Float Total: 0.30000000000000004  <-- Dangerous drift!

# Using Decimal (CORRECT for Expensus):
price_1 = Decimal('0.10')
price_2 = Decimal('0.20')
total_decimal = price_1 + price_2
print(f"Decimal Total: {total_decimal}")
# Output: Decimal Total: 0.30  <-- Exact math!
```

---

## Questions to Test Your Understanding
1. **Why does adding `0.1 + 0.2` in standard programming languages produce `0.30000000000000004`, and how does `Decimal/NUMERIC(10, 2)` fix this?**
2. **What are the three components of a JSON Web Token (JWT), and which component prevents a user from tampering with their `user_id` inside the token?**
3. **What is the difference between *Server State* and *Client State* in a React application? Give one concrete Expensus example for each.**
4. **Why did we choose `on_delete=models.PROTECT` when deleting a `Category` that still has associated `Expense` records, instead of `models.CASCADE`?**

---

# Milestone 02: Phase 1 — Repository & Development Environment Setup

## Concept
1. **Git Repository Hygiene & `.gitignore` Architecture:** How Git tracks files using content-addressable storage (blobs, trees, commits), and why build artifacts (`dist/`, `__pycache__`), virtual environments (`.venv/`, `node_modules/`), and sensitive credentials (`.env`) must be strictly excluded.
2. **The 12-Factor App: Configuration in the Environment:** The industry standard principle stating that configuration (database passwords, API keys, debug flags) must be injected via environment variables rather than hardcoded in source files.
3. **Containerization & Orchestration (Docker & Docker Compose):**
   * **Docker Image:** An immutable, snapshot blueprint of an operating system and software dependencies.
   * **Docker Container:** A running, isolated instance of an image.
   * **Docker Compose:** A declarative YAML tool that defines and runs multi-container Docker applications over an isolated internal network.
   * **Docker Volumes:** Persistent host storage that outlives the lifecycle of containers, ensuring database rows are not lost when containers stop.

---

## Why
* Without `.gitignore` and `.env.example`, developers risk leaking database passwords and private API keys to public repositories or causing merge conflicts over local binaries.
* Without Docker / Docker Compose, every team member must manually install PostgreSQL, matching versions, locale collations, and ports on Windows/macOS/Linux, leading to "works on my machine" bugs.

---

## How
* **Docker Compose Network:** Compose creates a default bridge network (`expensus_net`). Inside this network, containers resolve each other using service names as DNS hostnames (e.g., the backend connects to PostgreSQL using host `db` instead of `localhost` or an IP address).
* **Volume Persistence:** The named volume `postgres_data` mounts into `/var/lib/postgresql/data` inside the PostgreSQL container. When the container is restarted or updated, data remains intact.

---

## Implementation
* **Git Ignore Rules:** [.gitignore](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/.gitignore)
* **Environment Configurations:** [.env.example](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/.env.example) and [.env](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/.env)
* **Container Orchestration:** [docker-compose.yml](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/docker-compose.yml)
* **Service Definitions:** [backend/Dockerfile](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/Dockerfile) and [frontend/Dockerfile](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/Dockerfile)
* **Backend Dependency List:** [backend/requirements.txt](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/requirements.txt)

---

## Example
### How Docker Compose Resolves Services via Internal DNS
```yaml
# In docker-compose.yml:
services:
  db:                    # <-- Service Name acts as internal DNS hostname
    image: postgres:16-alpine
    ...

  backend:
    environment:
      - DB_HOST=db       # <-- Django resolves 'db' to the postgres container IP!
```

---

## Questions to Test Your Understanding
1. **Why must `.env` be included in `.gitignore`, while `.env.example` must be committed to Git?**
2. **What is the difference between a Docker Image and a Docker Container?**
3. **In `docker-compose.yml`, why does the backend container connect to PostgreSQL using `DB_HOST=db` instead of `DB_HOST=localhost`?**
4. **What is a Docker persistent volume, and what would happen to our database data if we stopped our PostgreSQL container without one?**

---

# Milestone 03: Phase 2 — Backend Foundation

## Concept
1. **Django Project vs. Django App:**
   * **Project (`config/`):** The administrative root and configuration orchestrator (contains `settings/`, `urls.py`, `wsgi.py`, and `asgi.py`).
   * **App (`users`, `categories`, `expenses`, `analytics`):** Modular, self-contained Python packages each encapsulating a single business domain with its own models, serializers, views, and routing.
2. **Split-Settings Architecture:** Decoupling settings into `base.py` (shared framework configuration, apps, middleware, DRF & JWT defaults), `development.py` (local database, verbose logging, live CORS origins), and `production.py` (strict SSL, HSTS, WhiteNoise, connection pooling).
3. **WSGI (Web Server Gateway Interface):** The synchronous standard specification allowing web servers (e.g. Gunicorn) to communicate with Python web applications.
4. **Middleware Execution Pipeline:** An ordered sequence of hooks processed on every request and response (e.g. `CorsMiddleware` runs first to handle cross-origin preflight `OPTIONS` requests before authentication occurs).
5. **Early Custom User Model Setup:** Why Django requires defining `AUTH_USER_MODEL` before initial migrations are applied to avoid circular dependency and migration table corruption.

---

## Why
* Monolithic `settings.py` files mix development keys with production secrets and make testing fragile.
* Decoupled domain apps prevent tight coupling, making the codebase clean, maintainable, and testable.
* Centralized DRF and SimpleJWT settings enforce uniform token lifetimes, authentication schemes, and pagination across all endpoints.

---

## How
* `manage.py` and `wsgi.py` point `DJANGO_SETTINGS_MODULE` to `config.settings.development`.
* `config/settings/development.py` imports `from .base import *` and loads environment variables dynamically via `python-dotenv`.
* Root `config/urls.py` delegates URL namespaces to domain apps via `django.urls.include()`.

---

## Implementation
* **Settings Package:** [backend/config/settings/base.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/config/settings/base.py), [development.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/config/settings/development.py), [production.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/config/settings/production.py)
* **Root Routing & Entrypoints:** [backend/config/urls.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/config/urls.py), [wsgi.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/config/wsgi.py), [manage.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/manage.py)
* **Domain App Configurations:** [users/apps.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/apps.py), [categories/apps.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/apps.py), [expenses/apps.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/apps.py), [analytics/apps.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/apps.py)
* **Custom User Model Baseline:** [users/models.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/models.py) and [users/admin.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/admin.py)

---

## Example
### Split-Settings Inheritance Pattern
```python
# In config/settings/development.py:
from .base import *          # Inherits DRF, JWT, INSTALLED_APPS, Middleware
from dotenv import load_dotenv

load_dotenv(BASE_DIR.parent / '.env')

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'expensus_db'),
        ...
    }
}
```

---

## Questions to Test Your Understanding
1. **What is the difference between a Django Project (`config/`) and a Django App (`expenses/`)?**
2. **Why is `CorsMiddleware` placed at the very top of the `MIDDLEWARE` list in `settings/base.py`?**
3. **Why is it critical in Django to configure a custom `User` model (`AUTH_USER_MODEL`) before running your first database migrations?**
4. **How does `config/settings/development.py` inherit settings from `base.py`, and how does it load `.env`?**

---

# Milestone 04: Phase 3 — Database Modeling & Migrations

## Concept
1. **Relational Integrity with Django ORM:** Defining relational tables (`Category`, `Expense`) linked via `ForeignKey` to `settings.AUTH_USER_MODEL`.
2. **Cascade Protection Policies (`on_delete=models.PROTECT`):** Preventing accidental orphaned records or accidental bulk deletion. If a user tries to delete a category that has 50 expenses attached, the database halts with `ProtectedError`.
3. **Multi-Tenant Composite Constraints (`UniqueConstraint`):** Scoping constraints per user (`fields=['user', 'name']`), allowing User A and User B to both have a "Groceries" category, while preventing User A from creating duplicate "Groceries" categories.
4. **Exact Decimal Precision (`DecimalField(max_digits=10, decimal_places=2)`):** Storing currency in PostgreSQL `NUMERIC(10, 2)` and computing totals in Python with `decimal.Decimal` to guarantee 100% accounting precision.
5. **Composite B-Tree Indexes:** Adding an index on `(user, expense_date)` so queries filtering on user and sorting by date execute in $O(\log n)$ logarithmic time instead of scanning every table row ($O(n)$).

---

## Why
* Financial applications cannot tolerate floating-point math errors or orphaned records.
* Database-level constraints guarantee data integrity even if API bugs or script errors bypass application validations.

---

## How
* In `backend/categories/models.py`, `Category` defines `models.UniqueConstraint(fields=['user', 'name'])`.
* In `backend/expenses/models.py`, `Expense` defines `category = models.ForeignKey(..., on_delete=models.PROTECT)`.
* Django converts these ORM declarations into SQL DDL commands via migration files (`0001_initial.py`).

---

## Implementation
* **Category Model & Admin:** [backend/categories/models.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/models.py) and [admin.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/admin.py)
* **Expense Model & Admin:** [backend/expenses/models.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/models.py) and [admin.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/admin.py)
* **Category Unit Tests:** [backend/categories/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/tests.py)
* **Expense Unit Tests:** [backend/expenses/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/tests.py)
* **Database Migrations:** `backend/categories/migrations/0001_initial.py` and `backend/expenses/migrations/0001_initial.py`

---

## Example
### Expense Model Definition with Constraints & Indexes
```python
class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey('categories.Category', on_delete=models.PROTECT, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    expense_date = models.DateField(default=timezone.now, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)

    class Meta:
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'expense_date'], name='exp_user_date_idx'),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gt=0), name='positive_expense_amount')
        ]
```

---

## Questions to Test Your Understanding
1. **What is the difference between `on_delete=models.CASCADE` and `on_delete=models.PROTECT`? Why is `PROTECT` essential for the `Category` foreign key on `Expense`?**
2. **Why do we use `models.UniqueConstraint(fields=['user', 'name'])` instead of setting `name = models.CharField(unique=True)`?**
3. **What is a database index, and why did we create a composite index on `(user, expense_date)`?**
4. **How does Python's `Decimal('45.50')` prevent arithmetic drift compared to `45.50` (float)?**

---

# Milestone 05: Phase 4 — Category REST API

## Concept
1. **DRF Serializers (Serialization & Deserialization):** Translating database model instances into JSON representations for client consumption, and validating client-submitted payloads against schema rules and uniqueness constraints before persistence.
2. **ModelViewSet & DefaultRouter Dispatch:** Combining standard REST actions (`list`, `create`, `retrieve`, `update`, `partial_update`, `destroy`) into a single view class wired automatically via URL routing.
3. **Zero-Trust User Ownership:**
   * `get_queryset()`: Enforces that `GET /api/categories/` filters rows to `user=request.user`.
   * `perform_create(serializer)`: Programmatically injects `user=request.user`, guaranteeing the frontend cannot forge ownership.
4. **Graceful Exception Interception:** Catching database-level `ProtectedError` in the `destroy()` method to return a clear, user-friendly `400 Bad Request` JSON payload rather than crashing with an unhandled 500 internal server error.
5. **API Integration Testing with `APITestCase`:** Using `APIClient` and `force_authenticate` to test endpoint security, permissions, status codes, and cross-tenant access isolation.

---

## Why
* Category management is the prerequisite domain for recording and organizing expenses.
* Without server-enforced scoping, malicious users could view or delete other users' categories by guessing IDs in the URL.
* Without catching `ProtectedError`, users attempting to delete categories with active transactions would experience broken UI states and uninformative 500 error pages.

---

## How
* `CategorySerializer` strips whitespace and performs case-insensitive duplicate checks scoped to `request.user`.
* `CategoryViewSet` inherits from `viewsets.ModelViewSet` and sets `permission_classes = [IsAuthenticated]`.
* In `destroy()`, `self.perform_destroy(instance)` is wrapped in `try...except ProtectedError`.

---

## Implementation
* **Category Serializer:** [backend/categories/serializers.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/serializers.py)
* **Category ViewSet:** [backend/categories/views.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/views.py)
* **URL Router:** [backend/categories/urls.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/urls.py)
* **Category API Tests:** [backend/categories/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/categories/tests.py)

---

## Example
### Category ViewSet with Multi-Tenancy & Protected Deletion Handling
```python
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Multi-tenant isolation:
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-inject verified user:
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete category containing active expenses.", "code": "category_protected"},
                status=status.HTTP_400_BAD_REQUEST
            )
```

---

## Questions to Test Your Understanding
1. **What is the difference between `get_queryset()` and `perform_create()` in a DRF `ModelViewSet`?**
2. **Why does the frontend never send `user_id` in the `POST /api/categories/` request payload?**
3. **What HTTP status code is returned when a category is successfully deleted, and what status code is returned if deletion is blocked by `ProtectedError`?**
4. **Why does User A querying `GET /api/categories/99/` (which belongs to User B) receive `404 Not Found` instead of `200 OK`?**

---

# Milestone 06: Phase 5 — Expense REST API

## Concept
1. **Dual Serialization Pattern (Write-ID / Read-Nested):**
   * On write (`POST`/`PATCH`): The client provides `category: 1` (integer foreign key ID) to minimize payload overhead.
   * On read (`GET`): The API returns a nested `category: {"id": 1, "name": "Groceries", "icon": "shopping-cart", "color": "#10B981"}` so the UI has full display context without making secondary network requests.
2. **Eliminating the N+1 Query Problem with `select_related`:**
   * An N+1 query problem occurs when loading $N$ expenses executes 1 query to fetch the expenses, plus $N$ additional SQL queries to fetch each expense's foreign-key `category`.
   * Using `.select_related('category')` performs an SQL `INNER JOIN` in a single query, reducing $N+1$ database roundtrips to exactly 1 roundtrip.
3. **Multi-Faceted Filtering with `django-filter` (`FilterSet`):**
   * Declarative query filtering supporting exact matches (`payment_method`, `category`), range lookups (`start_date`, `end_date`, `min_amount`, `max_amount`), and custom computed filters (`month="YYYY-MM"` filtering on year and month).
4. **Zero-Trust Relational Validation:**
   * When creating or updating an expense, the serializer checks `validate_category()` to verify that the specified category belongs to `request.user`, preventing users from assigning their expenses to another user's category.
5. **Full-Featured List Mechanics (Pagination, Search, Ordering):**
   * Configured `SearchFilter` (searches description), `OrderingFilter` (ordering by date, amount, created timestamp), and `PageNumberPagination` (default 20 records per page).

---

## Why
* Expenses are the core transactional entity of the Expensus system.
* Providing rich filtering, pagination, and sorting on the server avoids sending massive raw data dumps to the client and keeps queries fast and responsive.
* Preventing N+1 queries is critical for database scalability as transaction volumes grow.

---

## How
* `backend/expenses/serializers.py` defines `ExpenseSerializer` with `CategorySerializer(read_only=True)` and `PrimaryKeyRelatedField(write_only=True)`.
* `backend/expenses/filters.py` defines `ExpenseFilter` inheriting from `django_filters.FilterSet`.
* `backend/expenses/views.py` defines `ExpenseViewSet` configuring `filterset_class`, `search_fields`, `ordering_fields`, and `select_related('category')`.
* `backend/expenses/urls.py` registers the ViewSet with `DefaultRouter`.

---

## Implementation
* **Expense Serializer:** [backend/expenses/serializers.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/serializers.py)
* **Expense Filter:** [backend/expenses/filters.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/filters.py)
* **Expense ViewSet:** [backend/expenses/views.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/views.py)
* **URL Router:** [backend/expenses/urls.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/urls.py)
* **Expense API Tests:** [backend/expenses/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/expenses/tests.py)

---

## Example
### Expense Serializer with Dual Read/Write Category Handling & Validation
```python
class ExpenseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_id', 'amount',
            'description', 'expense_date', 'payment_method',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_category_id(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Category does not exist or does not belong to you.")
        return value
```

---

## Questions to Test Your Understanding
1. **What is the N+1 query problem, and how does `.select_related('category')` solve it?**
2. **How does `ExpenseSerializer` allow writing with `category_id: 1` while returning `category: {id: 1, name: "Food", ...}` on read?**
3. **Why must we explicitly validate in `validate_category_id` that `category.user == request.user` when saving an expense?**
4. **How does `django-filter` translate `?start_date=2026-08-01&end_date=2026-08-31` into SQL WHERE conditions?**


