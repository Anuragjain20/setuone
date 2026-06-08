# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seva-Setu (branded "SetuOne") is a home-services marketplace for Indore, India. Customers book verified craftsmen (plumbers, electricians, carpenters, etc.) online and pay cash on completion. The codebase is two separate deployments that talk over HTTP:

- **`backend/`** — FastAPI + SQLAlchemy + SQLite, deployed to Vercel (Python serverless)
- **`frontend/`** — React 19 + Vite + Tailwind CSS v4, deployed to Vercel (static)

## Development Commands

### Backend (run from `backend/`)

```bash
# Install dependencies
pip install -r requirements.txt

# Run dev server (port 8000)
uvicorn main:app --reload

# Run migrations
alembic upgrade head

# Seed initial data (services, site config, demo craftsmen)
python seed.py

# Run all tests
pytest tests/

# Run a single test function
pytest tests/test_api.py::test_otp_auth_flow
```

Copy `backend/.env.example` to `backend/.env` before running locally.

### Frontend (run from `frontend/`)

```bash
npm install
npm run dev          # Vite dev server on port 5173
npm run build        # Production build → dist/
npm run typecheck    # TypeScript check without emitting
```

During `npm run dev`, API calls to `/api/*` and `/uploads/*` are proxied to the backend URL configured via `VITE_API_URL` env var (defaults to the production Vercel backend URL).

## Architecture

### Backend

All backend logic lives in `backend/main.py` — a single FastAPI app with no sub-routers. The models and data layer are:

- `models.py` — SQLAlchemy ORM models: `User`, `Service`, `Craftsman`, `Booking`, `Testimonial`, `SiteConfig`, `Notification`
- `database.py` — SQLAlchemy engine setup; handles Vercel's read-only filesystem by copying the SQLite file to `/tmp` at startup
- `alembic/` — migration history; run `alembic upgrade head` before seeding

**Auth model** — two separate auth systems:
1. *User auth*: OTP-based (phone → 4-digit OTP stored in DB → server-side session via `itsdangerous`/`SessionMiddleware`). In non-production environments, the OTP is returned in the response as `devOtp`.
2. *Admin auth*: username/password from env vars (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), sets `session["admin_auth"] = True`.

`require_admin()` accepts either system. Admin phone numbers listed in `ADMIN_PHONES` env var can also gain admin access after user OTP login.

**Safe-field pattern** — `PATCH` endpoints only write columns listed in `BOOKING_SAFE_FIELDS` / `CRAFTSMAN_SAFE_FIELDS` sets. New mutable fields must be added there explicitly.

**camelCase ↔ snake_case** — the DB uses snake_case columns; all API responses serialize to camelCase via `to_dict()` methods on the models. Inbound PATCH payloads use a `camel_map` dict for translation.

**Craftsman `skills` and `service_areas`** — stored as JSON strings in `Text` columns, exposed as Python lists via `@property` getters/setters.

**Price clamping** — MVP prices are clamped to ₹100–₹200 via `clamp_mvp_price()`. Online payments are intentionally disabled (returns 410).

**File uploads** — stored under `UPLOAD_DIR` (defaults to `uploads/` locally, `/tmp/uploads` on Vercel). Allowed types: jpg, jpeg, png, gif, webp, pdf. Max 10 MB.

### Frontend

Routing uses `wouter` (not React Router). All routes are defined in `frontend/src/App.tsx`.

State management uses `@tanstack/react-query` for server data. There are no client-side global stores — auth state is managed by `AuthContext` (`frontend/src/context/AuthContext.tsx`) which polls `/api/auth/me`.

**API client** — `frontend/src/api/` contains a generated typed client plus a hand-written `custom-fetch.ts` wrapper that handles error parsing, optional Bearer tokens, and optional base URL override (for non-browser runtimes).

**UI components** — `frontend/src/components/ui/` contains shadcn/ui components (Radix UI primitives + Tailwind). Do not edit these generated files; add custom components under `frontend/src/components/`.

**Path alias** — `@/` maps to `frontend/src/`.

**Admin routes** are guarded by `AdminGuard` (`frontend/src/components/admin-guard.tsx`), which checks `/api/admin/me` before rendering `/admin/*` pages.

### Deployment

- `frontend/vercel.json` rewrites `/api/*` and `/uploads/*` to the production backend URL, and all other paths to `index.html` for SPA routing.
- Backend is deployed separately as a Vercel Python function.
- The Docker setup in `backend/Dockerfile` runs `alembic upgrade head && python seed.py && uvicorn ...` and is an alternative for non-Vercel deployments.

## Key Environment Variables

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./dev.db` | Postgres URL for production |
| `SESSION_SECRET` | `change-me-in-production` | Must be set in prod or server refuses to start |
| `ENVIRONMENT` | `development` | Set to `production` to enable strict checks |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `admin` (dev only) | Required in production |
| `ADMIN_PHONES` | *(empty)* | Comma-separated phones with admin access via OTP auth |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS; ignored in non-production (allows all) |
| `VITE_API_URL` | `https://setuone-gamma.vercel.app` | Frontend dev proxy target |
