# 08 — Deployment, Containerization & Production Readiness

## 1. Development vs. Production Architecture

| Dimension | Local Development | Production |
| :--- | :--- | :--- |
| **Backend Server** | `python manage.py runserver` (Django Dev Server) | `gunicorn` / `uvicorn` WSGI HTTP Server |
| **Static Files** | Served dynamically by Django | Collected via `collectstatic` and served with `WhiteNoise` |
| **Debug Mode** | `DEBUG = True` (Detailed tracebacks) | `DEBUG = False` (Standardized JSON error responses) |
| **CORS** | Open to `http://localhost:5173` | Strictly locked to production frontend domain |
| **Database** | Dockerized PostgreSQL 16 | Managed PostgreSQL (e.g. AWS RDS, Supabase, Neon) |
| **Frontend Server** | Vite Dev Server with HMR | Pre-compiled static assets served via Nginx or Cloudflare CDN |
| **HTTPS / SSL** | HTTP on localhost | Forced HTTPS with HSTS & Secure Cookies |

---

## 2. Docker & Container Architecture

Expensus uses multi-stage Docker builds to keep production images lightweight, secure, and reproducible:

```mermaid
graph TD
    subgraph LocalDev ["Docker Compose (Local Development)"]
        DBContainer[PostgreSQL 16 Container: port 5432]
        BackendContainer[Django Backend Container: port 8000]
        FrontendContainer[Vite Frontend Container: port 5173]
        
        FrontendContainer -->|API Calls (localhost:8000)| BackendContainer
        BackendContainer -->|SQL (db:5432)| DBContainer
    end

    subgraph ProdDeployment ["Production Topology"]
        Client[User Browser]
        CDN[Cloudflare / Nginx Static Hosting]
        AppServer[Gunicorn Backend Cluster]
        ManagedDB[(Managed PostgreSQL Database)]

        Client -->|HTTPS (HTML/JS/CSS)| CDN
        Client -->|HTTPS /api/| AppServer
        AppServer -->|Encrypted SSL SQL| ManagedDB
    end
```

---

## 3. Production Environment Variables (`.env.production`)

```env
# Security
SECRET_KEY=generate-a-strong-64-character-secret-key
DEBUG=False
ALLOWED_HOSTS=api.expensus.com

# Database (Managed PostgreSQL)
DATABASE_URL=postgres://user:password@prod-db-host:5432/expensus_db

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://app.expensus.com

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## 4. Production Release Checklist
1. Run `python manage.py check --deploy` to identify security warnings.
2. Run database migrations: `python manage.py migrate`.
3. Collect all static assets: `python manage.py collectstatic --noinput`.
4. Validate that `DEBUG` is strictly `False`.
5. Confirm CORS only allows verified domain origins.
6. Ensure automated backups are configured for the PostgreSQL database.
