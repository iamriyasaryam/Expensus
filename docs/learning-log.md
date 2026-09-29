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

---

# Milestone 07: Phase 6 — Authentication & JWT Security

## Concept
1. **Stateless JWT Architecture (`Header.Payload.Signature`):**
   * Eliminates database session lookups on every incoming API request. Identity is cryptographically verified by decoding the signature using the server's private secret key.
2. **Two-Tier Token Architecture & Rotation:**
   * **Access Token (Short-lived, e.g., 30 min):** Transmitted via `Authorization: Bearer <access>` to authorize API requests.
   * **Refresh Token (Long-lived, e.g., 7 days):** Exchanged at `/api/auth/refresh/` for a new access token when the access token expires.
   * **Token Rotation & Blacklisting:** Every time a refresh token is used, a new refresh token is issued and the old refresh token is blacklisted (`rest_framework_simplejwt.token_blacklist`), mitigating replay and token theft risks.
3. **Embedded User Profile in Login Response:**
   * Customizing `TokenObtainPairSerializer` to return the authenticated `user` metadata (`id`, `email`, `first_name`, `last_name`, `full_name`) alongside the JWT tokens, reducing frontend startup roundtrips.
4. **Explicit Logout via Server-Side Blacklisting:**
   * Adding a `/api/auth/logout/` endpoint that adds the provided refresh token's unique identifier (`jti`) to the database blacklist table, preventing it from ever being refreshed again.
5. **Secure Profile & Password Modification:**
   * `/api/auth/me/` exposes `GET` and `PATCH` for user details while keeping `email` read-only.
   * `/api/auth/change-password/` validates current password hash against PBKDF2 before applying new password complexity checks and persisting the new hash.

---

## Why
* Authentication is the security backbone for all user-isolated data (categories, expenses, analytics).
* Stateless JWT allows clean cross-origin communication between the React frontend and Django backend without cookie domain complications.
* Refresh token blacklisting ensures that logging out actually invalidates active sessions on the server.

---

## How
* `backend/users/serializers.py` defines `RegisterSerializer`, `CustomTokenObtainPairSerializer`, `UserSerializer`, and `ChangePasswordSerializer`.
* `backend/users/views.py` implements `RegisterView`, `CustomTokenObtainPairView`, `UserProfileView`, `ChangePasswordView`, and `LogoutView`.
* `backend/users/urls.py` binds routes to `/api/auth/`.
* `backend/config/settings/base.py` enables `rest_framework_simplejwt.token_blacklist` and `BLACKLIST_AFTER_ROTATION = True`.

---

## Implementation
* **Auth Serializers:** [backend/users/serializers.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/serializers.py)
* **Auth Views:** [backend/users/views.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/views.py)
* **URL Router:** [backend/users/urls.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/urls.py)
* **Auth Test Suite:** [backend/users/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/users/tests.py)

---

## Example
### Refresh Token Blacklisting on Logout
```python
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Stores jti in token_blacklist_blacklistedtoken table
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

---

## Questions to Test Your Understanding
1. **Why is password hashing with PBKDF2/Argon2 one-way, and why do we never store plaintext passwords?**
2. **What is the security risk of storing access tokens in localStorage, and how does short access token lifetime mitigate token leakage?**
3. **What is the role of the `jti` (JWT ID) claim when implementing token blacklisting?**
4. **Why did we customize `TokenObtainPairSerializer` to embed user details into the login payload?**

---

# Milestone 08: Phase 7 — Analytics & Dashboard API

## Concept
1. **Server-Side Financial Aggregations (`Sum`, `Count`, `Coalesce`):**
   * Computing multi-metric totals (`total_spending_all_time`, `total_spending_month`, `total_spending_today`, `expense_count_month`) directly in the PostgreSQL engine rather than pulling raw transaction arrays to client memory.
   * `Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())` guarantees that queries on zero-expense months safely evaluate to numeric `Decimal('0.00')` rather than SQL `NULL` (`None`).
2. **Relational Group By & Percentage Distribution:**
   * Combining `.values('category__id', 'category__name', ...)` with `.annotate(total_amount=Sum('amount'))` to generate an indexed category spending distribution.
   * Applying zero-division guards when calculating spending percentage:
     $$\text{percentage} = \begin{cases} \text{round}\left(\frac{\text{cat\_total}}{\text{month\_total}} \times 100, 2\right) & \text{if } \text{month\_total} > 0 \\ 0.00 & \text{otherwise} \end{cases}$$
3. **Temporal Grouping & Trailing Window (`TruncMonth`):**
   * Truncating date stamps to month boundaries to assemble trailing 6-month historical spending curves.
   * Chronologically generating all 6 month keys (`['YYYY-MM', ...]`) and mapping SQL query results to ensure empty months are populated with `0.00` rather than missing from chart axes.
4. **Clean Service Layer Architecture (`AnalyticsService`):**
   * Isolating complex ORM aggregation pipelines and temporal algorithms inside a dedicated service layer, keeping API views clean and lightweight.

---

## Why
* Real-time financial dashboards are the primary visual feature of Expensus.
* Calculating sums, counts, and category proportions on the database server minimizes network bandwidth and avoids client-side compute lag.
* A single cohesive endpoint (`/api/analytics/dashboard/`) eliminates 4+ independent HTTP requests on dashboard load.

---

## How
* `backend/analytics/services.py` defines `AnalyticsService.get_dashboard_data(user, month_str)`.
* `backend/analytics/serializers.py` validates and serializes the structured dashboard payload.
* `backend/analytics/views.py` exposes `DashboardAnalyticsView` with `IsAuthenticated`.
* `backend/analytics/urls.py` routes `/api/analytics/dashboard/`.

---

## Implementation
* **Analytics Service:** [backend/analytics/services.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/services.py)
* **Analytics Serializers:** [backend/analytics/serializers.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/serializers.py)
* **Analytics View:** [backend/analytics/views.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/views.py)
* **URL Router:** [backend/analytics/urls.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/urls.py)
* **Analytics Tests:** [backend/analytics/tests.py](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/backend/analytics/tests.py)

---

## Example
### Category Breakdown Aggregation with Decimal Precision
```python
category_qs = Expense.objects.filter(
    user=user,
    expense_date__range=(month_start, month_end)
).values(
    'category__id', 'category__name', 'category__icon', 'category__color'
).annotate(
    total_amount=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
).order_by('-total_amount')

category_breakdown = []
for item in category_qs:
    cat_total = item['total_amount']
    percentage = round((cat_total / total_spending_month) * Decimal('100.00'), 2) if total_spending_month > 0 else Decimal('0.00')
    category_breakdown.append({
        'category_id': item['category__id'],
        'category_name': item['category__name'],
        'icon': item['category__icon'] or '',
        'color': item['category__color'] or '#6B7280',
        'total_amount': str(cat_total),
        'percentage': float(percentage),
    })
```

---

## Questions to Test Your Understanding
1. **Why do we wrap `Sum('amount')` in `Coalesce(..., Decimal('0.00'))` in Django ORM aggregates?**
2. **What does `TruncMonth('expense_date')` do, and how does it assist in generating multi-month financial charts?**
3. **How does the service layer handle the scenario where a user has spent $0 in a particular month across the trailing 6-month window?**
4. **Why is it advantageous to structure the financial aggregation logic in a dedicated `services.py` rather than directly in `views.py`?**

---

# Milestone 09: Phase 8 — Frontend Foundation & Design System

## Concept
1. **Separation of Server State & Client State:**
   * **Server State (TanStack Query v5):** Remote, asynchronous, cacheable financial records (expenses, categories, dashboard analytics).
   * **Client State (React Context / Local State):** UI view models, active filters, form inputs, modal dialog visibility, authenticated token persistence.
2. **Axios Centralized Interceptor & Refresh Token Queue:**
   * **Request Interceptor:** Dynamically reads `access_token` from `localStorage` and injects `Authorization: Bearer <token>`.
   * **Response Interceptor:** Catches `401 Unauthorized`, pauses incoming requests in a Promise queue (`failedQueue`), exchanges `refresh_token` at `/api/auth/refresh/` for a fresh access token, and retries all pending requests seamlessly.
3. **Design System & Glassmorphism Token Architecture:**
   * Defined consistent HSL design tokens, dark mode palette, Inter typography, and glassmorphic card utilities (`glass-panel`, `glass-panel-glow`) in `tailwind.config.js` and `src/index.css`.
4. **Declarative Route Guarding with React Router v6:**
   * `ProtectedRoute`: Evaluates `useAuth()` status. If unauthenticated, saves current location and redirects to `/login`.
   * `PublicRoute`: If authenticated, redirects immediately to `/dashboard`.
5. **Component Primitives & Application Shell:**
   * Developed accessible, reusable UI building blocks (`Button`, `Card`, `Input`, `Badge`, `LoadingSpinner`) and full application layout (`Navbar`, `Sidebar`, `MainLayout`).

---

## Why
* A solid architectural foundation prevents messy state bugs and spaghetti code as domain features scale.
* Centralized Axios interceptors eliminate repetitive token management boilerplate from individual page components.
* Design-token consistency guarantees a polished, responsive user experience.

---

## How
* `frontend/package.json` configures Vite, React 18, TypeScript, Tailwind CSS, TanStack Query, Axios, and Lucide icons.
* `frontend/src/services/api.ts` configures interceptors and token refresh queues.
* `frontend/src/features/auth/AuthContext.tsx` manages login, registration, logout, and token hydration.
* `frontend/src/app/AppRouter.tsx` wires public and protected route trees.

---

## Implementation
* **Vite & Tailwind Config:** [frontend/vite.config.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/vite.config.ts), [tailwind.config.js](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/tailwind.config.js), [index.css](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/index.css)
* **TypeScript Types:** [frontend/src/types/](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/types/)
* **Axios API Service:** [frontend/src/services/api.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/services/api.ts) & [authService.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/services/authService.ts)
* **Auth Context:** [frontend/src/features/auth/AuthContext.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/auth/AuthContext.tsx)
* **Layout & UI Primitives:** [frontend/src/components/](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/components/)
* **Router & Pages:** [frontend/src/app/AppRouter.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/app/AppRouter.tsx), [DashboardPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/DashboardPage.tsx), [LoginPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/LoginPage.tsx), [RegisterPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/RegisterPage.tsx)

---

## Example
### Axios Token Refresh Queue Mechanism
```typescript
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${token}`;
    }
    return api(originalRequest);
  });
}
```

---

## Questions to Test Your Understanding
1. **What is the difference between Server State and Client State in a modern React application?**
2. **How does the Axios response interceptor prevent infinite 401 request loops?**
3. **Why do we queue pending HTTP requests in `failedQueue` while a token refresh is in flight?**
4. **How does `ProtectedRoute` preserve the user's intended navigation URL after they log in?**

---

# Milestone 10: Phase 9 — Frontend Authentication Flow

## Concept
1. **Client-Side Pre-Flight Validation:**
   * Validating form inputs (RFC-compliant email format regex, password minimum length $\ge 8$, password match) prior to issuing network requests.
   * Instant visual feedback reduces unnecessary server load and improves UX.
2. **Password Visibility Mechanics & Accessible Toggle Controls:**
   * Implementing dynamic input `type="text"` vs `type="password"` state switching with `Eye` and `EyeOff` icons.
3. **Interactive Notification Feedback (`Toast`):**
   * Auto-dismissing animated alerts communicating mutation status (success, error) for profile changes and password updates.
4. **Secure Profile & Credential Management:**
   * Exposing `/api/auth/me/` updates with synchronized UI header state and cryptographic password rotation via `/api/auth/change-password/`.

---

## Why
* Authentication forms are the first user touchpoint; clear visual error handling and password aids prevent signup churn.
* Providing immediate toast feedback on credential changes assures users of account security.

---

## How
* `frontend/src/components/ui/Toast.tsx` implements timed notification badges.
* `frontend/src/pages/LoginPage.tsx` and `RegisterPage.tsx` incorporate real-time password criteria and visibility toggles.
* `frontend/src/pages/ProfilePage.tsx` integrates personal details editing and password update flows with toast alerts.

---

## Implementation
* **Toast Notification Component:** [frontend/src/components/ui/Toast.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/components/ui/Toast.tsx)
* **Login Form Flow:** [frontend/src/pages/LoginPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/LoginPage.tsx)
* **Registration Form Flow:** [frontend/src/pages/RegisterPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/RegisterPage.tsx)
* **Profile & Password Manager:** [frontend/src/pages/ProfilePage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/ProfilePage.tsx)

---

## Example
### Real-Time Password Match & Length Validation Indicators
```tsx
{password.length > 0 && (
  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
    <div className="flex items-center gap-2">
      {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
      <span className={isLengthValid ? 'text-emerald-400' : 'text-slate-400'}>At least 8 characters</span>
    </div>
    {password2.length > 0 && (
      <div className="flex items-center gap-2">
        {isMatchValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
        <span className={isMatchValid ? 'text-emerald-400' : 'text-rose-400'}>{isMatchValid ? 'Passwords match' : 'Passwords do not match'}</span>
      </div>
    )}
  </div>
)}
```

---

## Questions to Test Your Understanding
1. **Why is it essential to perform password validation on both the frontend and the backend?**
2. **How does the `Toast` component ensure that background timers are cleaned up if the component unmounts?**
3. **Why do we keep the `email` field read-only in `ProfilePage`?**
4. **How does `updateUser` in `AuthContext` keep the top Navbar avatar synchronized when a user updates their first name?**

---

# Milestone 11: Phase 10 — Category Management UI

## Concept
1. **Server State Caching & Optimistic Invalidation with TanStack Query:**
   * Querying categories using `useQuery(['categories'])` with stale-time caching.
   * Applying `useMutation` hooks for category creation, editing, and deletion that automatically trigger `queryClient.invalidateQueries({ queryKey: ['categories'] })` and `queryClient.invalidateQueries({ queryKey: ['dashboard'] })`, re-fetching fresh state without page reloads.
2. **Dynamic Lucide Icon Registry:**
   * Storing string identifiers in the database (`'shopping-cart'`, `'utensils'`, `'home'`, `'car'`, etc.) and dynamically mapping them to React Lucide components with color badges via [categoryIcons.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/categoryIcons.tsx).
3. **Modal Dialog Workflow & Form State Management:**
   * Modal dialog supporting dual Create and Edit modes with live badge previewing, customizable color palettes, and icon grid selection.
4. **Cascade Deletion Interception (`ProtectedError`):**
   * Intercepting backend HTTP 400 responses with `code: "category_protected"` and rendering a dedicated explanation alert informing the user that active expenses must first be deleted or reassigned.

---

## Why
* Spending categories are the organizational foundation for transaction accounting and analytics.
* Handling relational database errors gracefully in the UI prevents application crashes and educates users on data integrity rules.

---

## How
* `frontend/src/services/categoryService.ts` handles REST network calls.
* `frontend/src/features/categories/useCategories.ts` encapsulates TanStack Query hooks.
* `frontend/src/features/categories/CategoryModal.tsx` provides interactive creation and editing with icon/color pickers.
* `frontend/src/features/categories/DeleteCategoryDialog.tsx` handles deletion confirmation and cascade protection alerts.
* `frontend/src/pages/CategoriesPage.tsx` brings the category grid, search filter, and action modals together.

---

## Implementation
* **Category Service:** [frontend/src/services/categoryService.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/services/categoryService.ts)
* **Category Query Hooks:** [frontend/src/features/categories/useCategories.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/useCategories.ts)
* **Icon & Color Registry:** [frontend/src/features/categories/categoryIcons.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/categoryIcons.tsx)
* **Category Card & Modals:** [frontend/src/features/categories/CategoryCard.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/CategoryCard.tsx), [CategoryModal.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/CategoryModal.tsx), [DeleteCategoryDialog.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/categories/DeleteCategoryDialog.tsx)
* **Categories Page:** [frontend/src/pages/CategoriesPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/CategoriesPage.tsx)

---

## Example
### Intercepting `category_protected` Cascade Error in Delete Dialog
```tsx
try {
  await onConfirm(category.id);
  onClose();
} catch (err: any) {
  if (err.response?.data?.code === 'category_protected') {
    setErrorDetail({
      code: 'category_protected',
      message: 'This category cannot be deleted because active expenses are assigned to it. To delete this category, please delete or reassign its expenses first.',
    });
  }
}
```

---

## Questions to Test Your Understanding
1. **Why does `useCreateCategory` call `queryClient.invalidateQueries({ queryKey: ['categories'] })` on success?**
2. **How does `CategoryIcon` safely handle unknown or null icon names stored in the database?**
3. **What error code is returned by Django when deleting a category with attached expenses, and how does the UI react to it?**
4. **Why is it beneficial to separate network fetching (`categoryService.ts`) from React hook state (`useCategories.ts`)?**

---

# Milestone 12: Phase 11 — Expense Management UI

## Concept
1. **Server-Side Paginated State Management:**
   * Querying paginated API endpoints (`/api/expenses/?page=1&page_size=10`) using TanStack Query v5.
   * Applying `placeholderData: keepPreviousData` to ensure previous table rows remain visible while fetching the next page, eliminating UI layout shift and flickering.
2. **Multi-Faceted Query Synchronization:**
   * Synchronizing multiple filter criteria (text search on description, category selection, payment method choices, date range boundaries) into an atomic filter state.
   * Automatically resetting current page to `page = 1` whenever any filter condition changes to avoid out-of-bounds page requests.
3. **Dual Create & Edit Modal Workflows:**
   * Modal dialog that dynamically binds to either empty state (creation) or an existing `Expense` model instance (editing).
   * Strict financial decimal input handling, validating that `amount > 0` and converting strings to numeric representations before submitting to the backend.
4. **Cross-Domain Cache Invalidation:**
   * When any expense mutation (create, update, delete) resolves successfully, the query client invalidates both `['expenses']` and `['dashboard']` caches, ensuring both the ledger and analytics dashboards update without requiring full-page reloads.

---

## Why
* A financial ledger is the central workflow of an expense tracker; users need rapid search, filtering, and pagination without lag.
* Server-driven pagination ensures consistent application performance whether the user has 10 or 10,000 recorded expenses.
* Seamless cross-domain cache invalidation guarantees financial consistency across the entire user experience.

---

## How
* `frontend/src/services/expenseService.ts` handles REST network requests with query parameters.
* `frontend/src/features/expenses/useExpenses.ts` encapsulates TanStack Query hooks with automatic cache invalidations.
* `frontend/src/features/expenses/ExpenseFilterBar.tsx` renders search inputs, category selectors, payment filters, and date pickers.
* `frontend/src/features/expenses/ExpenseTable.tsx` displays category badges, formatted currency amounts, payment method tags, action buttons, and pagination footers.
* `frontend/src/features/expenses/ExpenseModal.tsx` provides form inputs with real-time decimal validation.
* `frontend/src/features/expenses/DeleteExpenseDialog.tsx` handles expense removal confirmation.
* `frontend/src/pages/ExpensesPage.tsx` integrates the table, filters, modals, and Toast alerts.

---

## Implementation
* **Expense Service:** [frontend/src/services/expenseService.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/services/expenseService.ts)
* **Expense Query Hooks:** [frontend/src/features/expenses/useExpenses.ts](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/expenses/useExpenses.ts)
* **Filter Bar Component:** [frontend/src/features/expenses/ExpenseFilterBar.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/expenses/ExpenseFilterBar.tsx)
* **Expense Table Component:** [frontend/src/features/expenses/ExpenseTable.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/expenses/ExpenseTable.tsx)
* **Expense Modals:** [frontend/src/features/expenses/ExpenseModal.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/expenses/ExpenseModal.tsx), [DeleteExpenseDialog.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/features/expenses/DeleteExpenseDialog.tsx)
* **Expenses Page:** [frontend/src/pages/ExpensesPage.tsx](file:///c:/Users/Riya%20Saryam/OneDrive/Desktop/Expensus/frontend/src/pages/ExpensesPage.tsx)

---

## Example
### Paginated Expense Query with TanStack Query v5
```typescript
export function useExpenses(params: ExpenseFilterParams = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => getExpenses(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseCreatePayload) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

---

## Questions to Test Your Understanding
1. **Why do we pass `placeholderData: keepPreviousData` when querying paginated data in TanStack Query?**
2. **Why must we reset the active page number to 1 whenever a filter parameter (e.g. search query or category) changes?**
3. **Why do expense mutation hooks invalidate both `['expenses']` and `['dashboard']` query keys?**
4. **How does the `ExpenseModal` handle the distinction between creating a new expense and editing an existing expense?**








