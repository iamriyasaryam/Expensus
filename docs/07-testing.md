# 07 — Testing Strategy & Quality Assurance

## 1. The Testing Pyramid

Expensus adheres to the **Testing Pyramid** methodology to ensure system reliability, fast test execution, and regression prevention:

```
          / \
         /   \
        / E2E \       <-- Critical User Flows (Login -> Add Expense -> Check Dashboard)
       /-------\
      / Integr. \     <-- DRF APITestCase (Endpoints, Permissions, Filter Queries)
     /-----------\
    /  Unit Tests \   <-- Model methods, Serializer validations, Helper functions
   /---------------\
```

---

## 2. Backend Testing Strategy

Backend tests are written using Django's built-in `django.test.TestCase` and DRF's `rest_framework.test.APITestCase`. Every test runs against an isolated PostgreSQL test database created and destroyed automatically per test run.

### 1. Model Tests (`tests/test_models.py`)
* **Decimal precision:** Test that calculations with `Decimal` do not lose cents or introduce floating-point inaccuracies.
* **Database constraints:** Verify `UniqueConstraint` on `(user, category_name)` and check constraints on positive `amount`.
* **String representations:** Test `__str__()` methods for admin and debugging clarity.

### 2. Serializer Tests (`tests/test_serializers.py`)
* **Validation rules:** Test that negative or zero amounts fail validation with appropriate error messages.
* **Category ownership validation:** Verify that assigning Category B (owned by User B) to an expense created by User A is caught and rejected by serializer validation.

### 3. API Integration & Permission Tests (`tests/test_views.py`)
* **Authentication enforcement:** Verify that unauthenticated requests to `/api/expenses/` return `401 Unauthorized`.
* **Multi-tenant data isolation:** Create User 1 and User 2. Insert expenses for both. Confirm that User 1 querying `GET /api/expenses/` receives **only** User 1's expenses.
* **Foreign key tamper resistance:** Attempt to edit or delete User 2's expense using User 1's JWT token, asserting `404 Not Found` (or `403 Forbidden`).
* **Filtering & Pagination:** Verify query parameters (`?start_date=`, `?category=`, `?page=`) return the exact filtered subsets.

---

## 3. Frontend Testing Strategy

* **Unit & Component Testing:** Using Vitest + React Testing Library to test component rendering, empty states, badge colors, and form inputs.
* **API Mocking:** Mocking Axios / TanStack Query responses using Mock Service Worker (MSW) to verify loading spinners and error alerts.
* **Critical Flow Tests:**
  * User submits expense form -> Optimistic UI update -> Success toast.
  * Invalid input -> Inline error message display.

---

## 4. Test Execution Commands

```bash
# Run Backend Test Suite
docker compose exec backend python manage.py test

# Run Specific Backend App Tests
docker compose exec backend python manage.py test expenses

# Run Frontend Tests
docker compose exec frontend npm run test
```
