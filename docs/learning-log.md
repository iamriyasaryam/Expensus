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

