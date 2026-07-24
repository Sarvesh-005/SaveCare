# Hospital Management System — Design Spec

**Date:** 2026-07-24
**Status:** Approved (brainstorming complete) → ready for implementation planning

## Summary

A full-stack Hospital Management System deployed on Vercel. React (Vite) frontend + Vercel serverless API routes (Node/TypeScript) + hosted Postgres (Neon / Vercel Postgres free tier). Role-based JWT auth (Admin / Doctor / Receptionist) enforced server-side. Six functional modules: Patients, Doctors, Appointments, Medical Records, Billing, AI Diagnosis Assistant. The "AI" is a rule-based symptom→condition matcher (offline, deterministic, no API keys). Seeded with realistic demo data + 3 login accounts. Professional medical-dashboard UI.

**Explicit non-goal:** This is a full-featured demo/portfolio system. It is **not** HIPAA-compliant and **not** intended for real clinical use. No audit log, no PHI encryption at rest beyond Postgres defaults, no BAA. The README and spec state this plainly. The diagnosis tool's disclaimer is always visible.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript, React Router.
- **Backend:** Vercel serverless functions (one file per route group under `/api/*`). No Express — Vercel's `/api` convention turns each file into a function automatically.
- **Database:** Postgres on Neon (or Vercel Postgres) free tier. Pooled connection via `pg`.
- **Auth:** `bcryptjs` (pure JS, no native deps) for password hashing; JWT in httpOnly cookies.
- **AI:** Rule-based symptom matcher, runs in a serverless function.
- **Host:** Vercel (git push → auto-deploy, preview deploys per PR).

## Architecture & Project Structure

Single Vite project deployed as a Vercel full-stack app. Vercel serves the React build as static assets and runs `/api/*` routes as serverless functions automatically.

```
hospital-management/
├─ package.json            # Vite + React + TS; scripts: dev/build/preview/db:*
├─ vite.config.ts          # dev proxy /api → vercel dev
├─ vercel.json             # rewrites /api/* to serverless functions
├─ .env / .env.example     # DATABASE_URL, JWT_SECRET
├─ api/                    # serverless functions (one file per route group)
│  ├─ lib/
│  │  ├─ db.ts             # pg connection pool (single Neon pooled connection)
│  │  ├─ auth.ts           # verifyAuth(), requireRole(), sign/verify JWT
│  │  └─ http.ts           # response/error helpers
│  ├─ auth/                # login, me, logout
│  ├─ patients/
│  ├─ doctors/
│  ├─ appointments/
│  ├─ records/
│  ├─ billing/
│  └─ diagnosis/
│      └─ matcher.ts       # rule-based symptom→condition engine
├─ scripts/
│  ├─ schema.sql           # versioned schema + migrations table
│  ├─ migrate.ts           # applies schema.sql via pooled connection
│  └─ seed.ts              # idempotent seed: 3 accounts + demo data
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx              # router + AuthProvider + layout shell
│  ├─ api/                 # typed fetch client (one file per domain)
│  ├─ modules/             # feature-sliced frontend (one folder per domain)
│  ├─ components/          # shared UI: DataTable, Modal, Form fields, charts
│  ├─ context/             # AuthProvider, ToastProvider
│  ├─ lib/                 # id, date, money, validation
│  └─ types/               # shared TS types (imported by api/ + src/)
└─ docs/superpowers/specs/
```

### Key decisions & why

- **No Express.** Vercel's `/api` directory convention turns each file into a serverless function automatically. Fits "real backend, no server to babysit" and is the idiomatic Vercel pattern. Express would add a layer with no benefit.
- **`pg` + Neon pooled connection.** Neon pools connections at the DB level; serverless functions grab a pooled client per invocation. Standard pattern for Postgres-on-serverless; avoids connection exhaustion.
- **Shared `types/`** between `api/` and `src/` — frontend fetch client and serverless functions import the same TS interfaces, so contracts can't drift silently.
- **`scripts/seed.ts`** is idempotent and runnable via `npm run db:seed`. Creates the 3 accounts and demo rows; skips existing rows by email/name.
- **Feature-sliced frontend** (`src/modules/`) — each of the 6 domains is self-contained, so files stay focused and each module can be understood in isolation.
- **Role enforcement in the API layer**, not just the frontend. Every `/api/*` function checks the JWT and the caller's role before touching the DB. Frontend hiding routes is convenience, not security.

## Data Model

Six core tables plus the auth table. All foreign keys, money stored as integer cents (avoids float errors), timestamps in UTC.

### `users` (auth + staff accounts)
```
id (uuid pk) | email (unique) | password_hash | role (admin|doctor|receptionist)
| name | created_at
```
Three seeded accounts: `admin@care.save`, `doctor@care.save`, `reception@care.save` (passwords documented in README + spec).

### `doctors` (clinical staff, separate from login account)
```
id (uuid pk) | name | specialization | email | phone
| consultation_fee_cents (int) | available_days (text: "Mon,Tue,Wed")
| created_at
```
Kept separate from `users` so a doctor's profile can exist without login, and so non-doctor staff can be assigned to view patients. Seeded: ~5 doctors (Cardiology, Pediatrics, Neurology, Orthopedics, General Medicine).

### `patients`
```
id (uuid pk) | name | date_of_birth (date) | gender | phone | email
| address | blood_group | allergies (text) | emergency_contact
| created_at | created_by (fk users.id)
```
Seeded: ~10 patients with varied demographics and a couple of pre-existing conditions (shows up in medical records).

### `appointments` (links patients ↔ doctors)
```
id (uuid pk) | patient_id (fk) | doctor_id (fk)
| scheduled_at (timestamptz) | reason | status (scheduled|completed|cancelled|no_show)
| notes | created_by (fk users.id) | created_at
```
Seeded: ~15 appointments across past/future, mixed statuses.

### `medical_records` (clinical notes — one patient has many)
```
id (uuid pk) | patient_id (fk) | doctor_id (fk) | appointment_id (fk, nullable)
| visit_date (timestamptz) | chief_complaint | diagnosis | treatment
| prescription (text) | vitals (jsonb: bp/hr/temp/weight) | created_by (fk users.id)
| created_at
```
`vitals` as JSONB keeps it flexible without a separate table. `appointment_id` nullable because walk-in/emergency visits may have no appointment.

### `bills` (one per chargeable encounter)
```
id (uuid pk) | patient_id (fk) | appointment_id (fk, nullable)
| doctor_id (fk, nullable) | items (jsonb: [{desc, amount_cents}])
| total_cents (int) | status (unpaid|paid|partial|refunded)
| paid_amount_cents (int, default 0) | method (cash|card|insurance)
| created_by (fk users.id) | created_at | paid_at (timestamptz, nullable)
```
`items` as JSONB so a bill can bundle consultation + procedures + meds without a separate line-items table. `total_cents` recomputed from items, also stored for query simplicity.

### Relationships
```
users ──< appointments >── doctors
users ──< medical_records >── patients <── doctors
users ──< bills >── patients
medical_records.appointment_id → appointments   (optional link)
```

### Role access matrix
| Table | Admin | Doctor | Receptionist |
|---|---|---|---|
| patients | full | read+write own patients* | read+write |
| doctors | full | read | read |
| appointments | full | read+write own | read+write |
| medical_records | full | write (own patients) | read only |
| bills | full | read | read+write |
| users | full | read self | read self |

*"own patients" = patients for whom the doctor has an appointment or record.

## API Surface & Auth Flow

### Auth flow (real JWT, server-enforced)

1. **Login** — `POST /api/auth/login {email, password}` → server hashes-check with `bcryptjs`, issues a JWT containing `{userId, role, exp}` signed with `JWT_SECRET`, sets it as an **httpOnly + Secure + SameSite=Lax** cookie. httpOnly means JS can't read it → not stealable via XSS. Returns the user object (minus hash).
2. **Every request** — browser sends the cookie automatically (`credentials: 'include'` on the fetch client). `verifyAuth(req)` reads + verifies the JWT and returns `{userId, role}` or `null`.
3. **Role gating** — `requireRole(['admin','doctor'])(req)` wraps each handler; returns 403 if the caller's role isn't allowed. This is the security boundary.
4. **Logout** — `POST /api/auth/logout` clears the cookie.
5. **Me** — `GET /api/auth/me` returns the current user (drives the frontend session state).

Tokens expire after 8h; user re-logs in. No refresh-token complexity (YAGNI).

### API routes (all under `/api/*`, each a serverless function)

| Module | Routes | Notes |
|---|---|---|
| **auth** | `POST /login`, `POST /logout`, `GET /me` | cookie-based |
| **patients** | `GET ?search=&page=`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` | search across name/phone |
| **doctors** | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` | |
| **appointments** | `GET ?doctor_id=&date=&status=`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` | conflict check on create |
| **records** | `GET ?patient_id=`, `GET /:id`, `POST`, `PUT /:id` | no delete (clinical data) |
| **billing** | `GET ?patient_id=&status=`, `GET /:id`, `POST`, `PUT /:id`, `POST /:id/pay` | pay updates status + `paid_amount` |
| **diagnosis** | `POST /analyze {symptoms:[]}` | rule-based matcher, returns conditions |

### Diagnosis endpoint contract
```jsonc
// POST /api/diagnosis/analyze
{ "symptoms": ["fever", "cough", "body_ache"] }
// → 200
{ "conditions": [
   { "name": "Influenza (Flu)", "matchScore": 0.86, "urgency": "routine",
     "matchedSymptoms": ["fever","cough","body_ache"], "advice": "Rest, fluids, monitor fever..." },
   { "name": "Common Cold", "matchScore": 0.52, "urgency": "routine", ... }
 ],
 "disclaimer": "This is a rule-based screening tool, not a medical diagnosis. Consult a licensed clinician."
}
```

Matcher logic lives in `api/diagnosis/matcher.ts`: a knowledge table mapping conditions → required/associated symptoms, scored by Jaccard overlap, filtered by a threshold, sorted by score, capped at top 5. Deterministic, offline, no API keys.

### Frontend fetch client (`src/api/`)
- One thin module per domain (`patientsApi.ts`, etc.) wrapping `fetch` with `credentials:'include'`, JSON encode/decode, error normalization → throws `ApiError({code, message})`.
- Shared TS types in `src/types/` imported by both `api/` and `src/modules/`.

### Error convention (uniform)
- Response: `{ "error": { "code": "VALIDATION", "message": "..." } }`
- Status: 400 validation · 401 unauthenticated · 403 forbidden · 404 not found · 409 conflict (e.g. double-booked appointment) · 500 server.
- Frontend `ToastProvider` surfaces errors; forms show field-level validation.

### Appointment conflict check
On create, query any existing appointment for the same `doctor_id` within ±30 min of `scheduled_at` with status in (`scheduled`,`completed`); if found → 409 with a helpful message. The only non-trivial workflow constraint.

## Frontend Structure & UI

### Layout shell
```
┌─────────────────────────────────────────────────────────┐
│ ☥ CareSave HMS              [search]    Dr. ... ▾  [⏻]   │  ← top bar (60px)
├──────────┬──────────────────────────────────────────────┤
│ Dashboard│                                              │
│ Patients │                                              │
│ Doctors  │        Main content area                     │
│ Appts    │        (page outlet, max-width 1400px)       │
│ Records  │                                              │
│ Billing  │                                              │
│ AI Diag  │                                              │
│ ───────  │                                              │
│ Users*   │                                              │  ← *admin only
└──────────┴──────────────────────────────────────────────┘
   240px sidebar                    fluid
```

- **Sidebar** filters items by role (receptionist never sees Users/Records-write; doctor never sees Billing-write). Collapsible to icons on narrow screens.
- **Color/typography:** distinctive medical palette — deep teal primary (#0E7C7B), warm off-white canvas, slate text, coral accent for critical/overdue states. Inter font stack, monospace for IDs/amounts. Custom spacing, soft shadows, 10px corner radius, restrained motion. Not a Bootstrap clone.
- **Light + dark mode** via `prefers-color-scheme` (auto-detect + manual switch).
- **ToastProvider** for feedback, **AuthProvider** for session.

### Routing (React Router)
```
/login                         public
/                              Dashboard (role-tailored KPIs)
/patients                      list (admin, doctor, receptionist)
/patients/:id                  detail (profile + records + bills tabs)
/doctors                       list
/doctors/:id                   detail
/appointments                 list + scheduler view
/appointments/new             create
/records/:patientId           medical records for a patient
/billing                       invoices list
/billing/:id                   invoice detail + pay action
/diagnosis                    AI assistant
/users                        admin: staff accounts (stretch)
*                              404
```
Routes wrapped in `<Protected role={...}>` → unauthorized → redirect to `/` or `/login`.

### Pages per module
- **Dashboard** — KPI cards (patient count, today's appointments, pending bills total, unpaid bills count), a bar chart of appointments by day, recent-activity list. Role-tailored (receptionist sees today's schedule front and center; doctor sees their patients).
- **Patients** — searchable paginated `DataTable`, add/edit modal form, detail page with tabs (Profile / Records / Bills / Appointments).
- **Doctors** — list with specialization filter, detail with their upcoming appointments.
- **Appointments** — two views toggleable: a list table (filter by doctor/date/status) and a simple day/week calendar grid. Create modal with patient + doctor pickers, client-side conflict preview before submit.
- **Medical Records** — per-patient timeline of visits; create form with vitals (BP/HR/temp) + structured complaint/diagnosis/treatment/prescription. Read-only for receptionists.
- **Billing** — invoice list (filter by status), invoice detail with line-item editor, "Mark paid" with method select. Total auto-recomputed from items.
- **AI Diagnosis** — symptom multi-select (chips) or free text → "Analyze" → ranked condition cards with match score, matched symptoms highlighted, urgency badge, advice, and the disclaimer always visible. Option to "attach to patient" by selecting a patient (optional, stretch).

### Shared components (`src/components/`)
- `DataTable` — sortable, paginated, with empty/loading/error states.
- `Modal` / `Drawer` — for forms.
- `Form` primitives (`TextField`, `Select`, `DatePicker`, `MoneyInput`, `ChipSelect`) with validation.
- `StatCard`, `BarChart`, `DonutChart` (lightweight — hand-rolled SVG, no heavy chart dep) for the dashboard.

### State management
Mostly server state via a thin `useQuery`-style hook (fetch + cache + refetch on mutation). No Redux (YAGNI). Local component state for forms and UI. Auth in context.

## Testing

Lightweight but meaningful (YAGNI).

### Backend (Vitest)
- `diagnosis/matcher.ts` — scoring, threshold filtering, top-5 cap, tie-breaking.
- Appointment conflict-detection helper — same slot, ±30 min, status filter.
- Money math helpers — cents↔display, totals from JSONB items.
- Auth helpers — `verifyAuth`, `requireRole` (allow/deny per role).

### Frontend (Vitest + React Testing Library)
- Login flow → token cookie → protected route access.
- Appointment create with conflict → 409 surfaced as a toast.
- Billing total recomputes when a line-item is added/removed.

### End-to-end (stretch)
One Playwright smoke test per role: login → see the right nav → CRUD one record. Marked stretch; skip if time-constrained.

Tests run on every Vercel build via a GitHub Action gate, not a requirement to deploy.

## Deployment Flow (Vercel)

1. **First-time DB setup:** create a Neon (or Vercel Postgres) free-tier database. Add `DATABASE_URL` and a generated `JWT_SECRET` as Vercel env vars (production + preview + dev).
2. **Schema:** run a migration via a single `schema.sql` applied through the pooled connection — `npm run db:migrate` locally and once against prod. Versioned `schema.sql` + a `migrations` table (simpler/dependency-light than a full ORM).
3. **Seed:** `npm run db:seed` pushes the 3 accounts + demo rows. Idempotent (checks for existing rows by email/name, skips if present). Run once against prod after first deploy.
4. **App:** push to `main` → Vercel auto-builds (Vite build + serverless functions from `/api`) → deploys. Preview deploys per PR.
5. **Local dev:** `npm run dev` runs Vite dev server (frontend) with `/api` proxied to `vercel dev` (runs functions locally against the dev DB via `.env`). One terminal, both up.

## Security & Compliance Notes

- Passwords hashed with bcrypt (cost 10). JWT in httpOnly cookie. Roles enforced server-side. Parameterized queries throughout (no SQL injection).
- **Not HIPAA-compliant, not for real clinical use.** No audit log, no PHI encryption at rest beyond Postgres defaults, no BAA. Full-featured demo/portfolio system. README + spec state this plainly. Diagnosis tool's disclaimer is always visible.

## Success Criteria

1. All three roles can log in and see only their allowed nav + data.
2. Full CRUD works end-to-end for patients, doctors, appointments, medical records, and bills — data persists across sessions and devices (real Postgres).
3. Appointment double-booking is blocked with a clear error, client + server.
4. The diagnosis assistant returns ranked, plausible conditions with a visible disclaimer for a sample symptom set.
5. Billing totals compute correctly; payment flips status.
6. `npm run dev` brings up a working local environment in one command; `git push` deploys to Vercel.
7. The seeded demo data makes the app look alive on first visit.
8. Tests for the matcher, conflict check, money, and auth pass.

## Out of Scope (YAGNI)

Refresh tokens, audit logging, real LLM diagnosis, file/image upload for records, SMS/email notifications, multi-tenant/multi-clinic, insurance claim workflows, internationalization.

## Seeded Login Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@care.save` | `care-admin` |
| Doctor | `doctor@care.save` | `care-doctor` |
| Receptionist | `reception@care.save` | `care-reception` |

(Passwords are demo-only and documented in the README. Hashed with bcrypt in the DB.)
