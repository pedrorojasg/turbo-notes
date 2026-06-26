# Turbo AI — Notes App: Implementation Plan

## Context

This is a 7-day **Senior Full-Stack** hiring challenge for Turbo AI. We build the
notes-taking app shown in the demo video + Figma mockups, using **Django/DRF**
(backend) and **Next.js App Router** (frontend), in a single public GitHub repo
with two folders: `backend/` and `frontend/`.

Evaluation criteria (from the statement): **Functionality**, **Code Quality +
test coverage**, **Creativity / effective AI use**, **Time Management**.
Deliverables: public repo, README (process, design/technical decisions, *how AI
was used*), and a 5-minute English demo video.

### Locked decisions
- **Note content:** plain text (title + body). No rich text.
- **Categories:** fixed 3, auto-seeded per user on signup — *Random Thoughts*,
  *School*, *Personal*. Not user-editable. (The "Drama" item in one Figma frame
  is ignored as design noise, per the video.)
- **Auth:** JWT (SimpleJWT). Tokens stored in **httpOnly cookies**; Next.js Route
  Handlers act as a **BFF proxy** to Django so tokens never touch client JS.
- **Backend** runs in Docker. **Deploy:** Railway (backend + Postgres) + Vercel
  (frontend).
- **Git authorship:** all commits are authored as the repo owner (Pedro), never as
  the AI assistant. No `Co-Authored-By: Claude` trailer on any commit. Configure
  the repo with:
  - `git config user.email "18686600+pedrorojasg@users.noreply.github.com"`
  - `git config user.name "Pedro Rojas"`
- **Commits are manually confirmed:** every commit must be explicitly confirmed by
  the user before it is made. The assistant proposes the commit (message + staged
  files) and waits for approval — it never commits autonomously.
- **Stop after each day:** implementation pauses at the end of each numbered day in
  the sequencing below for the user to review before continuing to the next day.

---

## Repo structure

```
TURBO_AI/
├── README.md            # process, decisions, AI usage, run instructions
├── PLAN.md              # this file
├── docker-compose.yml   # local: web (Django) + db (Postgres)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/          # settings, urls, wsgi (split base/dev/prod settings)
│   ├── accounts/        # custom user, auth, category seeding
│   └── notes/           # Category + Note models, serializers, viewsets, tests
└── frontend/
    ├── app/             # App Router routes
    ├── components/      # UI components mapped from Figma
    ├── lib/             # api client, auth, date utils
    └── __tests__/       # unit tests
```

---

## Backend (Django + DRF)

### Data model
- **User** (`accounts.User`) — custom model extending `AbstractBaseUser` +
  `PermissionsMixin`, **email as the login field** (no username), with a custom
  `UserManager`. Set `AUTH_USER_MODEL` before first migration.
- **Category** (`notes.Category`) — `user` FK (CASCADE), `name`, `color` (hex
  string), `is_default` flag. Unique together `(user, name)`.
- **Note** (`notes.Note`) — `user` FK (CASCADE), `category` FK
  (`models.CASCADE`/not nullable), `title`
  (blank not ok), `content` (TextField, blank ok), `created_at` (auto_now_add),
  `updated_at` (auto_now → drives "last edited"). Order by `-updated_at`.

### Category seeding
On user registration, create the 3 default categories with their Figma colors
via a `post_save` signal or inside the register serializer's `create()`. Colors:

| Category | Card background | Dot/accent |
|---|---|---|
| Random Thoughts | `#F3C9A6` (peach) | `#E2A06A` |
| School | `#F7E3B3` (yellow) | `#EBC55F` |
| Personal | `#A9D7C9` (teal) | `#5FB7A1` |

*(Approximate — exact hex pulled from Figma via `get_design_context` during build.)*

### Auth (SimpleJWT)
- `POST /api/auth/register/` → creates user + seeds categories, returns tokens.
- `POST /api/auth/login/` → `TokenObtainPairView` (email + password).
- `POST /api/auth/refresh/` → `TokenRefreshView`.
- `GET  /api/auth/me/` → current user.
- Server-side **field validation** on register (email format, password strength,
  duplicate email → 400 with clear messages).

### Resource API (DRF ViewSets, all user-scoped)
- `GET /api/categories/` — read-only, returns user's categories with note counts
  (annotated `Count`) for the sidebar.
- `GET/POST /api/notes/`, `GET/PATCH/DELETE /api/notes/{id}/`
  - `get_queryset` filtered to `request.user` (never expose other users' notes).
  - `perform_create` / `perform_update` set `user` from `request.user`.
  - `?category=<id>` query param for filtering.
  - `IsAuthenticated` on everything.

### Backend tests (Django `APITestCase`) — target the rubric's "good coverage"
- Register seeds exactly the 3 categories; duplicate email rejected.
- Login returns tokens; bad creds → 401.
- Note CRUD happy paths.
- **User isolation**: user A cannot read/update/delete user B's note (404).
- Category filter returns only matching notes.
- `updated_at` changes on edit (drives last-edited).
- Category count annotation correct.

---

## Frontend (Next.js App Router)

### Routes & rendering strategy (per CLAUDE.md "think about rendering carefully")

| Route | Strategy | Why |
|---|---|---|
| `/` | Server redirect | → `/notes` if cookie present, else `/login` |
| `/login`, `/signup` | Static shell + Client form | No per-request data; forms are client components; submit hits BFF route handler |
| `/notes` | **Dynamic SSR** (`no-store`) | Reads httpOnly cookie server-side, fetches notes + categories; first paint is data-complete and SEO-clean. `?category=` via `searchParams` for server-side filtering |
| `/notes/[id]` | **Dynamic SSR** + client editor | Server fetches the note for first paint; client component handles inline editing + autosave. `notFound()` for missing/forbidden id |

Use **Streaming** (`loading.tsx` / Suspense) on `/notes` for the grid.
Use the **`not-found` file + `notFound()`** for missing notes.

### BFF / auth wiring
- Route handlers under `app/api/auth/*` proxy register/login/logout to Django and
  set/clear the **httpOnly, Secure, SameSite cookie** holding the JWT.
- Server Components read the cookie (`cookies()`) and call Django directly with a
  `Bearer` header via a small server `apiFetch` helper.
- Client mutations (create note, autosave, change category) call **Next route
  handlers** (`app/api/notes/*`) that attach the token from the cookie and forward
  to Django → no CORS, no token in JS.
- `NEXT_PUBLIC_API_URL` holds the Django base URL (per CLAUDE.md) for swapping
  localhost ↔ Railway.

### Key behaviors (from the video)
- **New Note**: click → immediately `POST` a blank note → route to
  `/notes/[id]` editor. No explicit save.
- **Autosave**: debounced `PATCH` (~500ms) on title/content/category change;
  `updated_at` → "last edited" updates live.
- **Category change** in editor recolors the note background to the category color.
- **Sidebar**: "All Categories" + each category (color dot, name, note count);
  clicking filters the grid.
- **Empty state**: "I'm just here waiting for your charming notes..." when no notes.
- **Date formatting util** (`lib/formatDate.ts`), well unit-tested:
  - Card preview: today → `today`, yesterday → `yesterday`, older → `Month Day`
    (e.g. `July 16`), **no year**.
  - Editor timestamp: `Last Edited: July 21, 2024 at 8:39pm` (full date + time).
- **Content truncation** in preview cards (CSS line-clamp), matching the mockup.
- **Password show/hide** toggle on auth forms.

### Components (mapped from Figma)
`AuthForm`, `PasswordInput`, `Sidebar`/`CategoryList`, `NoteCard`,
`NotesGrid`, `NoteEditor`, `CategoryDropdown`, `NewNoteButton`, `EmptyState`.
Tailwind for styling; category color → background via a typed color map. Use
`next/image` (with width/height) for the cactus/illustration assets exported from
Figma.

### Design fidelity target
**High-fidelity and token-accurate, not pixel-perfect.** Pull exact design tokens
(hex colors, spacing, font family/sizes, border radius) from Figma via
`get_design_context` per screen rather than eyeballing, and match the distinctive
elements (serif headings, per-category colors, pill buttons, card truncation,
illustrations). Do **not** chase sub-pixel exactness on every frame — Time
Management is a graded criterion and the rubric weights Functionality + Code
Quality + tests above pixel-perfection.

### Frontend tests (Jest or Vitest + React Testing Library)
- `formatDate` util: today / yesterday / older / editor-format cases.
- `NoteCard`: renders title, category, truncated content, correct color.
- `Sidebar`: renders counts, active filter state.
- Auth form: client-side validation + error display.
- Category color mapping helper.

---

## Deployment

### Backend → Railway
- `Dockerfile` (python:3.x-slim, gunicorn), `requirements.txt`.
- Railway **Postgres** plugin → `DATABASE_URL`.
- Env: `SECRET_KEY`, `DEBUG=0`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
  (Vercel domain), JWT lifetimes.
- Release step: `migrate` + a `seed`/idempotent management command if needed.
- `dj-database-url` + `whitenoise` for static (admin).

### Frontend → Vercel
- `NEXT_PUBLIC_API_URL` → Railway backend URL.
- Cookies set with `Secure` + `SameSite=Lax`; confirm cross-site behavior between
  the Vercel domain and Railway domain (BFF keeps same-origin for the browser).

### Local dev
- `docker-compose up` → Django + Postgres. Frontend `npm run dev`.
- `.env.example` files on both sides.

---

## README (graded deliverable)
- Project summary + screenshots.
- Run instructions (Docker for backend, npm for frontend, env vars).
- **Key design & technical decisions** (BFF cookie auth, rendering strategy,
  custom user model, seeding, autosave).
- **How AI was used** (required) — document prompts/workflow, Figma MCP for
  design-to-code, etc.
- Link to the 5-min demo video.

---

## Suggested 7-day sequencing

> **Workflow:** stop at the end of each day for user review before starting the
> next. Any commit within a day is proposed and **manually confirmed by the user**
> first — no autonomous commits.

1. **Day 1** — Repo scaffold, Docker, backend: custom user model, JWT auth, category
   seeding + auth tests.
2. **Day 2** — Note/Category models, serializers, user-scoped viewsets, filter,
   API tests. Backend feature-complete + deployed to Railway.
3. **Day 3** — Frontend scaffold, Tailwind, BFF auth route handlers, login/signup
   wired end-to-end.
4. **Day 4** — `/notes` grid: sidebar, filtering, note cards, colors, date util +
   tests, empty state.
5. **Day 5** — Note editor: auto-create, inline edit, autosave, category recolor,
   last-edited.
6. **Day 6** — Polish to match Figma, error/404 handling, streaming/loading,
   frontend test coverage, deploy frontend to Vercel.
7. **Day 7** — README, end-to-end verification on deployed URLs, record demo video.

---

## Verification
- **Backend:** `python manage.py test` (all suites green); manual `curl`/DRF
  browsable API smoke test of auth + notes + filtering + isolation.
- **Frontend:** `npm test` green; manual walkthrough of the full flow
  (signup → seeded categories → empty state → new note → edit/autosave →
  recolor → filter → logout/login) against the **deployed** Railway + Vercel URLs.
- Cross-check each screen against the Figma frames via the Figma MCP screenshots.
```
