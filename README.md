# CareSave HMS

A full-stack Hospital Management System demo: Patients, Doctors, Appointments, Medical Records, Billing, and a rule-based AI Diagnosis assistant. Built with React + Vercel serverless functions + Postgres.

> ⚠️ **Not for clinical use.** This is a demo/portfolio project. It is not HIPAA-compliant, carries no BAA, and the diagnosis assistant is a rule-based screening tool, not a medical diagnosis. Do not use with real patient data.

## Stack
- **Frontend:** React 18 + Vite + TypeScript, React Router
- **Backend:** Vercel serverless `/api`, Neon Postgres
- **Auth:** JWT in httpOnly cookies, bcryptjs
- **AI Diagnosis:** Rule-based symptom matcher (offline, deterministic)

## Local Dev

### Quick Start (Frontend Only)
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Full Stack Setup (with Backend)
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Create a Neon or local Postgres database

3. Create `.env` file (copy from `.env.example`):
   ```
   DATABASE_URL=postgres://user:pass@host/db
   JWT_SECRET=your-secret-key-here
   ```

4. Set up the database (future: create scripts/schema.sql and scripts/migrate.ts):
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Run frontend + backend:
   ```bash
   npm run dev          # Frontend (Vite on :5173)
   npm run dev:api      # Backend (Vercel functions on :3000) [separate terminal]
   ```

**For development without a database:** The frontend-only dev server runs at http://localhost:5173 and will gracefully handle API errors, showing mock loading/error states.

## Demo Logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@care.save | care-admin |
| Doctor | doctor@care.save | care-doctor |
| Receptionist | reception@care.save | care-reception |

## Deploy to Vercel
1. Push to GitHub; import the repo in Vercel.
2. Add env vars `DATABASE_URL`, `JWT_SECRET` (production + preview).
3. Run the DB migration + seed once against production Postgres: `npm run db:migrate` and `npm run db:seed` (point `.env` at the prod DB).
4. Vercel builds `vite build` and serves `/api/*` as serverless functions automatically.

## Tests
`npm test` — Vitest. Covers auth, HTTP helpers, appointment conflict check, money helpers, and diagnosis matcher.

## Features
- **Patients:** Full CRUD + search
- **Doctors:** Management + appointment scheduling
- **Appointments:** Conflict detection (±30 min window)
- **Medical Records:** Clinical notes with vitals
- **Billing:** Invoices, line items, payment tracking
- **AI Diagnosis:** Rule-based symptom matcher with disclaimer
- **Dashboard:** KPIs, charts, recent activity
- **Role-based access:** Admin, Doctor, Receptionist with scoped UI + API enforcement

## Project Structure
```
hospital-management/
├─ api/
│  ├─ auth/              # login, logout, me
│  ├─ patients/          # CRUD
│  ├─ doctors/           # CRUD
│  ├─ appointments/      # CRUD + conflict check
│  ├─ records/           # CRUD (no delete)
│  ├─ billing/           # CRUD + pay endpoint
│  ├─ diagnosis/analyze  # symptom matcher
│  ├─ stats/             # dashboard KPIs
│  └─ lib/               # db, auth, http helpers
├─ src/
│  ├─ modules/           # feature-sliced (patients, doctors, etc.)
│  ├─ components/        # shared UI (DataTable, Modal, Form, charts)
│  ├─ api/               # typed fetch client
│  ├─ context/           # Auth, Toast providers
│  ├─ lib/               # money, date helpers
│  └─ types/             # shared TS interfaces
├─ scripts/
│  ├─ schema.sql         # DB schema
│  ├─ migrate.ts         # apply schema
│  └─ seed.ts            # demo data
```

## Non-Goals (YAGNI)
- Refresh tokens
- Audit logging
- Real LLM diagnosis
- File upload
- SMS/email notifications
- Multi-clinic support
- HIPAA/BAA compliance
