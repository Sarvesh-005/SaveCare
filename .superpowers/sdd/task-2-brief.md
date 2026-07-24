### Task 2: Shared types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `User`, `Role`, `Doctor`, `Patient`, `Appointment`, `AppointmentStatus`, `MedicalRecord`, `Bill`, `BillItem`, `BillStatus`, `Condition`, `MatchResult`, `DiagnosisResponse`. Imported by `api/`, `src/`, and tests.

- [ ] **Step 1: Create `src/types/index.ts`**

```ts
export type Role = 'admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  consultation_fee_cents: number;
  available_days: string; // "Mon,Tue,Wed"
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  date_of_birth: string; // ISO date
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  blood_group: string;
  allergies: string;
  emergency_contact: string;
  created_at: string;
  created_by: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string; // ISO timestamptz
  reason: string;
  status: AppointmentStatus;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface Vitals {
  bp?: string; // "120/80"
  hr?: number; // bpm
  temp?: number; // celsius
  weight?: number; // kg
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  visit_date: string;
  chief_complaint: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  vitals: Vitals;
  created_by: string;
  created_at: string;
}

export interface BillItem {
  desc: string;
  amount_cents: number;
}

export type BillStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export interface Bill {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  doctor_id: string | null;
  items: BillItem[];
  total_cents: number;
  status: BillStatus;
  paid_amount_cents: number;
  method: 'cash' | 'card' | 'insurance';
  created_by: string;
  created_at: string;
  paid_at: string | null;
}

export type Urgency = 'routine' | 'soon' | 'urgent';

export interface Condition {
  name: string;
  symptoms: string[];
  advice: string;
  urgency: Urgency;
}

export interface MatchResult {
  name: string;
  matchScore: number;
  urgency: Urgency;
  matchedSymptoms: string[];
  advice: string;
}

export interface DiagnosisResponse {
  conditions: MatchResult[];
  disclaimer: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts && git commit -m "feat(types): shared domain types"
```

---

