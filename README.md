# SaveCare — Hospital Management System

A modern, full-stack Hospital Management System built with React, Node.js, Express, and MongoDB. Includes 6 operational modules and a rule-based AI Diagnosis Assistant.

## Features & Modules

- 📊 **Dashboard** — Live KPIs (total patients, active doctors, today's appointments, pending revenue), 6-month revenue area chart, and quick action shortcuts.
- 👥 **Patients** — Full patient management with demographics, blood type badges, allergy tags, emergency contacts, search/filter, and modal workflows.
- 🩺 **Doctors** — Directory of medical specialists, specialty color tags, patient appointment counts, quick availability toggles, and detailed profiles.
- 📅 **Appointments** — Book, reschedule, complete, or cancel appointments. Dynamic patient-doctor linking with status management.
- 📁 **Medical Records** — Patient-centric medical history cards displaying symptoms, prescriptions, vital signs, lab results, and clinical notes.
- 💳 **Billing** — Dynamic invoice creation with multi-line items, live tax calculation, status tracking (Paid, Pending, Overdue), and revenue aggregation.
- 🤖 **AI Diagnosis Assistant** — Rule-based symptom analysis matching 85+ symptoms against 20+ clinical conditions. Outputs confidence %, severity tags, recommended tests, specialist routing, and direct save to patient records.
- 🌓 **Dual Dark / Light Mode** — Seamless theme toggle with persistent state across sessions.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Recharts, React Icons |
| **Backend** | Node.js, Express 4, Mongoose 8 |
| **Database** | MongoDB (local or MongoDB Atlas) |
| **Styling** | Vanilla CSS (CSS Custom Properties design system) |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Running locally on `mongodb://localhost:27017` (or set custom URI in `server/.env`)

### 1. Install Server Dependencies & Seed Data

```bash
cd server
npm install
node seed.js   # Populates doctors, patients, appointments, records & invoices
```

### 2. Install Client Dependencies

```bash
cd ../client
npm install
```

### 3. Run the Application

Start the Express backend (Port 5000):
```bash
# In savecare/server
npm run dev
```

Start the Vite frontend (Port 5173):
```bash
# In savecare/client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## API Endpoints Reference

| Module | Method | Path | Description |
|---|---|---|---|
| **Health** | GET | `/api/health` | Server status check |
| **Patients** | GET | `/api/patients` | List patients (search & filter) |
| | POST | `/api/patients` | Register new patient |
| | PUT | `/api/patients/:id` | Update patient record |
| | DELETE | `/api/patients/:id` | Soft-deactivate patient |
| **Doctors** | GET | `/api/doctors` | List doctors |
| | POST | `/api/doctors` | Add doctor |
| | PUT | `/api/doctors/:id` | Update doctor / availability |
| **Appointments** | GET | `/api/appointments` | List appointments |
| | POST | `/api/appointments` | Book appointment |
| | PUT | `/api/appointments/:id` | Reschedule / status update |
| **Records** | GET | `/api/records` | List medical records |
| | POST | `/api/records` | Add medical record |
| **Billing** | GET | `/api/billing` | List invoices |
| | POST | `/api/billing` | Generate invoice |
| | PUT | `/api/billing/:id` | Update payment status |
