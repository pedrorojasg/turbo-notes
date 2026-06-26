# Notes-Taking App — Turbo AI Challenge

A full-stack notes application: create, edit, categorize, and filter plain-text
notes with debounced autosave and per-category theming. Built with a **Django REST
Framework** backend and a **Next.js (App Router)** frontend.

**Live demo** _(deployment is a self-added bonus — see [below](#deployment))_
- Frontend (Vercel): https://turbo-notes-pink.vercel.app
- Backend API (Railway): https://turbo-notes-production.up.railway.app
- Demo video (5 min): _<!-- TODO: paste your demo video link here -->_

---

## Table of contents
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Key design & technical decisions](#key-design--technical-decisions)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Tests](#tests)
- [Deployment](#deployment)
- [How AI was used](#how-ai-was-used)
- [Project structure](#project-structure)

---

## Screenshots

| Login | Notes grid | Editor |
|---|---|---|
| ![Login](docs/screenshots/login.png) | ![Notes grid](docs/screenshots/notes.png) | ![Editor](docs/screenshots/editor.png) |

---

## Features

- **Email + password auth** with JWT (register, login, logout).
- **3 categories auto-seeded per user** on signup — *Random Thoughts*, *School*,
  *Personal* — each with its own color.
- **Notes CRUD**, strictly scoped to the authenticated user.
- **Create note** → instantly opens a blank note in the editor (no explicit "save").
- **Debounced autosave** (~500 ms) on title/content edits; **immediate save** on
  category change. A live "Last Edited" timestamp reflects the server's `updated_at`.
- **Category recolor**: changing a note's category retints the editor card.
- **Sidebar filtering** by category, with per-category note counts.
- **Empty state**, **404 handling** (`notFound()`), **error boundaries**, and
  streaming **loading skeletons**.
- High-fidelity UI matched to the Figma design (colors, type, spacing pulled from
  the design file via the Figma MCP).

---

## Tech stack

**Backend** — Django 5.1.4, Django REST Framework 3.15.2, SimpleJWT 5.3.1,
PostgreSQL (Supabase), Gunicorn, WhiteNoise, `dj-database-url`. Runs in Docker.

**Frontend** — Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind CSS v4,
Zod (server-side validation), Vitest + React Testing Library.

---

## Architecture

```
Browser ──► Next.js (Vercel)  ──►  Django REST API (Railway)  ──►  Postgres (Supabase)
            │  Server Components fetch with the JWT from an httpOnly cookie
            │  BFF route handlers proxy client mutations and attach the token
            └─ the JWT never touches client-side JavaScript
```

### Rendering strategy

| Route | Strategy | Why |
|---|---|---|
| `/` | Server redirect | → `/notes` if the auth cookie is present, else `/login` |
| `/login`, `/signup` | Static shell + Client form | No per-request data; submission runs through a **Server Action** |
| `/notes` | **Dynamic SSR** (`no-store`) | Reads the httpOnly cookie server-side, fetches notes + categories; `?category=` filters server-side |
| `/notes/[id]` | **Dynamic SSR** + client editor | Server fetches the note for first paint; the client component handles inline editing + autosave; `notFound()` for missing/forbidden ids |

`loading.tsx` provides streaming skeletons on `/notes` and `/notes/[id]`;
`error.tsx` / `global-error.tsx` are error boundaries; `not-found.tsx` renders 404s.

---

## Key design & technical decisions

- **Auth via httpOnly cookies + a BFF, not tokens in JS.** Login/signup run as
  **Next.js Server Actions** that call Django, then store the access/refresh JWTs in
  `httpOnly`, `SameSite=Lax`, `Secure` (prod) cookies. Server Components read the
  cookie and call Django directly; client-side mutations go through Next.js **route
  handlers** (`app/api/notes/*`) that attach the token from the cookie. Result: the
  JWT is never exposed to client JavaScript, and the browser only ever talks
  same-origin (no CORS for the user, no token leakage).
- **Custom user model.** `accounts.User` extends `AbstractBaseUser` +
  `PermissionsMixin` with **email as the login field** (no username) and a custom
  `UserManager`. Set before the first migration.
- **Category seeding on registration.** The register serializer's `create()` seeds
  the three default categories with their exact Figma colors, so every new user has
  a usable workspace immediately.
- **Strict user scoping.** `NoteViewSet.get_queryset()` filters to `request.user`,
  and `perform_create` / `perform_update` set the owner from the request — a user can
  never read or mutate another user's notes (verified by isolation tests).
- **Autosave model.** The editor keeps the latest field values in a ref to avoid
  stale closures, debounces title/content saves at 500 ms, and saves category
  changes immediately. `updated_at` (`auto_now`) drives the "Last Edited" label.
- **Design tokens from Figma, not eyeballing.** Colors, fonts, radii, and spacing
  were pulled from the Figma file via the Figma MCP and encoded as Tailwind tokens /
  a typed category color map. Category colors use inline `style` (not dynamic
  Tailwind classes) so they survive production purging.
- **Self-hosted fonts** via `next/font` (Inter + Inria Serif) — no render-blocking
  external font request, no layout shift.

---

## Running locally

**Prerequisites:** Docker (for the backend + Postgres) and Node.js 20+ (for the
frontend).

### 1. Backend (Django + Postgres in Docker)

```bash
# from the repo root
cp backend/.env.example backend/.env      # adjust if needed
docker compose up --build
```

This starts Postgres and the Django dev server, runs migrations automatically, and
serves the API at **http://localhost:8000**.

### 2. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local                # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

The app is served at **http://localhost:3000**.

Sign up → you'll get the three seeded categories → create and edit notes.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Example (local) | Notes |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.dev` | `config.settings.prod` in production |
| `SECRET_KEY` | `dev-secret-change-me` | Long random string in production |
| `DJANGO_DEBUG` | `1` | `0` in production |
| `DATABASE_URL` | `postgres://notes:notes@localhost:5432/notes` | Omit locally to fall back to SQLite; Supabase **session pooler** URI in production |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Railway host in production |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Vercel origin in production |
| `CSRF_TRUSTED_ORIGINS` | — | Required in production (Railway origin) |
| `ACCESS_TOKEN_LIFETIME_MIN` | `30` | JWT access lifetime |
| `REFRESH_TOKEN_LIFETIME_DAYS` | `7` | JWT refresh lifetime |

### Frontend (`frontend/.env.local`)

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Django base URL. In production, the deployed Railway URL. **Baked in at build time — redeploy after changing.** |

---

## Tests

**Backend — 33 tests** (Django `APITestCase`): registration + seeding, login,
notes CRUD, user isolation, category filtering, `updated_at` behavior, category
counts.

```bash
docker compose exec web python manage.py test
```

**Frontend — 64 unit tests** (Vitest + React Testing Library): date utils,
schemas, category color map, `NoteCard`, `Sidebar`, `EmptyState`,
`CategoryDropdown`, `PasswordInput`, the `NoteEditor` autosave/debounce behavior,
the BFF route handlers (auth header + status passthrough), `NewNoteButton`, and
the auth forms.

```bash
cd frontend
npm test
```

**Frontend — Playwright E2E** _(bonus: an extra layer beyond the unit suite)_.
The Vitest tests cover components and logic in isolation; this adds a single
**end-to-end** test that drives a **real browser against the full stack** (Next.js
→ Django → Postgres) to catch integration/UI regressions that unit tests can't —
exactly the class of wiring issues that surfaced during deployment. The happy path
signs up, verifies seeded categories + empty state, creates a note, edits it with
autosave, confirms it persists on the grid, and logs out.

```bash
cd frontend
# Requires the backend running (docker compose up) and the dev server (auto-started).
npm run test:e2e
# Or against a deployed URL (no local servers needed):
E2E_BASE_URL=https://turbo-notes-pink.vercel.app npm run test:e2e
```

---

## Deployment

> **Note — this is a bonus, beyond the challenge requirements.** The challenge only
> asked for a public repo, this README, and a demo video. I additionally deployed
> the whole stack to a live, publicly reachable environment to demonstrate that it
> runs end-to-end in production (and to debug real-world concerns like port binding,
> connection pooling, and build-time env vars).

The app is deployed across three services:

- **Database — Supabase Postgres.** Connection string (session pooler, port 5432)
  set as `DATABASE_URL` on the backend.
- **Backend — Railway** (Docker). On deploy, `start.sh` runs `migrate` +
  `collectstatic` and starts Gunicorn on the platform-provided `$PORT`. Production
  settings enable HSTS, secure cookies, and WhiteNoise static serving.
- **Frontend — Vercel** (root directory `frontend/`). `NEXT_PUBLIC_API_URL` points
  to the Railway backend.

Because the BFF keeps the browser same-origin with the Next.js server, the JWT
cookie is first-party to the Vercel domain — no cross-site cookie configuration is
needed between Vercel and Railway.

---

## How AI was used

This project was built with **Claude (Claude Code)** as a pair-programming agent.
AI was used throughout, with the developer directing, reviewing, and approving every
step:

- **Planning.** Produced a locked, day-by-day implementation plan (`PLAN.md`) from
  the challenge brief and Figma file before any code was written.
- **Design-to-code via the Figma MCP.** Pulled exact design tokens and per-screen
  layout (`get_design_context` / `get_metadata`) directly from the Figma file rather
  than approximating, and downloaded illustration assets from the design.
- **Implementation.** Scaffolded the Django models/serializers/viewsets and the
  Next.js routes, components, BFF auth, and autosave, following the conventions in
  `CLAUDE.md` (e.g. App Router specifics, Tailwind v4 `@theme`, `next/font`).
- **Test coverage.** Wrote the backend `APITestCase` suite and the frontend Vitest
  suite.
- **Deployment & debugging.** Diagnosed deploy issues against the live
  services — Railway port-binding, a missing `start.sh` in the built image, and a
  `NEXT_PUBLIC_API_URL` misconfiguration — by probing the deployed endpoints and
  reading logs.

All Git commits are authored by the repository owner and were manually reviewed
before committing.

---

## Project structure

```
.
├── README.md
├── PLAN.md                  # the implementation plan
├── docker-compose.yml       # local: Django web + Postgres
├── backend/
│   ├── Dockerfile
│   ├── start.sh             # prod entrypoint: migrate + collectstatic + gunicorn
│   ├── requirements.txt
│   ├── config/              # split settings (base/dev/prod), urls, wsgi
│   ├── accounts/            # custom user, JWT auth, category seeding (+ tests)
│   └── notes/               # Category + Note models, serializers, viewsets (+ tests)
└── frontend/
    ├── app/                 # App Router: routes, route handlers, error/loading/not-found
    ├── components/          # UI mapped from Figma
    ├── lib/                 # auth actions, schemas, date utils, color map
    └── __tests__/           # Vitest unit tests
```
