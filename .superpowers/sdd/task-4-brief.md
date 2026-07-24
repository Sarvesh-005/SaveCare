### Task 4: Seed script

**Files:**
- Create: `scripts/seed.ts`
- Modify: (uses `api/lib/auth.ts` `hashPassword` — created in Task 5; to avoid a forward dependency, define `hashPassword` here is wrong — instead Task 5 creates it and this task runs after. **Reorder:** implement Task 5 first, then this task. See Task 5 for `hashPassword`.)

> **Ordering note:** Task 4 depends on `hashPassword` from Task 5. Execute Task 5 before Task 4. The numbering reflects logical grouping, not strict sequence.

**Interfaces:**
- Consumes: `hashPassword(pw: string): string` (from `api/lib/auth.ts`), `query()` (from `api/lib/db.ts`).
- Produces: `npm run db:seed` idempotently inserts 3 users, 5 doctors, 10 patients, 15 appointments, sample records, sample bills.

- [ ] **Step 1: Create `scripts/seed.ts`**

```ts
import { pool, query } from '../api/lib/db.js';
import { hashPassword } from '../api/lib/auth.js';

const PASSWORDS = {
  admin: 'care-admin',
  doctor: 'care-doctor',
  reception: 'care-reception',
};

async function ensureUser(email: string, role: string, name: string, pw: string) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount && existing.rowCount > 0) return existing.rows[0].id;
  const hash = await hashPassword(pw);
  const r = await query(
    `INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id`,
    [email, hash, role, name]
  );
  return r.rows[0].id;
}

async function ensureDoctor(name: string, spec: string, feeCents: number, days: string) {
  const existing = await query('SELECT id FROM doctors WHERE name = $1 AND specialization = $2', [name, spec]);
  if (existing.rowCount && existing.rowCount > 0) return existing.rows[0].id;
  const r = await query(
    `INSERT INTO doctors (name, specialization, email, phone, consultation_fee_cents, available_days)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [name, spec, `${name.split(' ')[0].toLowerCase()}@care.save`, '555-0100', feeCents, days]
  );
  return r.rows[0].id;
}

async function ensurePatient(p: {
  name: string; dob: string; gender: string; phone: string; blood: string; allergies: string;
}, createdBy: string) {
  const existing = await query('SELECT id FROM patients WHERE name = $1 AND date_of_birth = $2', [p.name, p.dob]);
  if (existing.rowCount && existing.rowCount > 0) return existing.rows[0].id;
  const r = await query(
    `INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [p.name, p.dob, p.gender, p.phone, `${p.name.split(' ')[0].toLowerCase()}@email.com`, '123 Main St', p.blood, p.allergies, '555-0199', createdBy]
  );
  return r.rows[0].id;
}

async function main() {
  const adminId = await ensureUser('admin@care.save', 'admin', 'Admin User', PASSWORDS.admin);
  const doctorUserId = await ensureUser('doctor@care.save', 'doctor', 'Dr. Alice Chen', PASSWORDS.doctor);
  const receptionId = await ensureUser('reception@care.save', 'receptionist', 'Reception Desk', PASSWORDS.reception);

  const specs: [string, string, number][] = [
    ['Dr. Alice Chen', 'Cardiology', 8000],
    ['Dr. Brian Lee', 'Pediatrics', 6000],
    ['Dr. Carla Diaz', 'Neurology', 9000],
    ['Dr. David Kim', 'Orthopedics', 7000],
    ['Dr. Eva Brown', 'General Medicine', 5000],
  ];
  const doctorIds: string[] = [];
  for (const [name, spec, fee] of specs) {
    doctorIds.push(await ensureDoctor(name, spec, fee, 'Mon,Tue,Wed,Thu,Fri'));
  }

  const patientData = [
    ['John Smith', '1985-03-12', 'male', '555-1001', 'O+', ''],
    ['Mary Jones', '1990-07-22', 'female', '555-1002', 'A+', 'Penicillin'],
    ['Robert Brown', '1978-11-05', 'male', '555-1003', 'B+', ''],
    ['Patricia Taylor', '2000-01-30', 'female', '555-1004', 'AB+', ''],
    ['James Wilson', '1965-09-18', 'male', '555-1005', 'O-', 'Aspirin'],
    ['Linda Davis', '1995-04-25', 'female', '555-1006', 'A-', ''],
    ['Michael Miller', '1982-12-03', 'male', '555-1007', 'B-', ''],
    ['Sarah Garcia', '1998-06-14', 'female', '555-1008', 'O+', ''],
    ['Thomas Rodriguez', '1970-08-21', 'male', '555-1009', 'A+', ''],
    ['Jennifer Martinez', '1988-02-09', 'female', '555-1010', 'AB-', 'Latex'],
  ];
  const patientIds: string[] = [];
  for (const [name, dob, gender, phone, blood, allergies] of patientData) {
    patientIds.push(await ensurePatient({ name, dob, gender, phone, blood, allergies }, receptionId));
  }

  // 15 appointments across past/future, mixed statuses.
  const now = Date.now();
  const day = 86400000;
  const slots = Array.from({ length: 15 }, (_, i) => {
    const offset = (i - 7) * day; // -7..+7 days
    return new Date(now + offset).toISOString();
  });
  for (let i = 0; i < 15; i++) {
    const pid = patientIds[i % patientIds.length];
    const did = doctorIds[i % doctorIds.length];
    const status = i % 4 === 0 ? 'completed' : i % 5 === 0 ? 'cancelled' : 'scheduled';
    await query(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, reason, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [pid, did, slots[i], ['Checkup', 'Follow-up', 'Consultation', 'Emergency'][i % 4], status, receptionId]
    );
  }

  // Sample medical records + bills for a couple of patients.
  await query(
    `INSERT INTO medical_records (patient_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment, prescription, vitals, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
    [patientIds[0], doctorIds[0], new Date(now - day).toISOString(), 'Chest pain', 'Hypertension', 'Lifestyle counseling', 'Lisinopril 10mg', JSON.stringify({ bp: '150/95', hr: 82, temp: 36.8 }), doctorUserId]
  );
  await query(
    `INSERT INTO bills (patient_id, doctor_id, items, total_cents, status, method, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
    [patientIds[0], doctorIds[0], JSON.stringify([{ desc: 'Cardiology consult', amount_cents: 8000 }, { desc: 'ECG', amount_cents: 3000 }]), 11000, 'unpaid', 'cash', receptionId]
  );

  console.log('Seed complete.');
  console.log('Logins:');
  console.log('  admin@care.save / care-admin');
  console.log('  doctor@care.save / care-doctor');
  console.log('  reception@care.save / care-reception');
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run seed (requires DB migrated)**

Run: `npm run db:migrate && npm run db:seed`
Expected: prints seed summary + logins.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.ts && git commit -m "feat(db): idempotent seed script with demo data"
```

---

