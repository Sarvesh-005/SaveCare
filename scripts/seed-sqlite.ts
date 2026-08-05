import { randomUUID } from 'node:crypto';
import { query, run } from '../api/lib/db-sqlite.js';
import { hashPassword } from '../api/lib/auth.js';

const PASSWORDS = {
  admin: 'care-admin',
  doctor: 'care-doctor',
  reception: 'care-reception',
};

async function ensureUser(email: string, role: string, name: string, pw: string) {
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.rows.length > 0) return (existing.rows[0] as any).id;

  const hash = await hashPassword(pw);
  const id = randomUUID();
  await run(
    `INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)`,
    [id, email, hash, role, name]
  );
  return id;
}

async function ensureDoctor(name: string, spec: string, feeCents: number, days: string) {
  const existing = await query(
    'SELECT id FROM doctors WHERE name = ? AND specialization = ?',
    [name, spec]
  );
  if (existing.rows.length > 0) return (existing.rows[0] as any).id;

  const id = randomUUID();
  await run(
    `INSERT INTO doctors (id, name, specialization, email, phone, consultation_fee_cents, available_days)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, spec, `${name.split(' ')[0].toLowerCase()}@care.save`, '555-0100', feeCents, days]
  );
  return id;
}

async function ensurePatient(
  p: { name: string; dob: string; gender: string; phone: string; blood: string; allergies: string },
  createdBy: string
) {
  const existing = await query('SELECT id FROM patients WHERE name = ? AND date_of_birth = ?', [
    p.name,
    p.dob,
  ]);
  if (existing.rows.length > 0) return (existing.rows[0] as any).id;

  const id = randomUUID();
  await run(
    `INSERT INTO patients (id, name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      p.name,
      p.dob,
      p.gender,
      p.phone,
      `${p.name.split(' ')[0].toLowerCase()}@email.com`,
      '123 Main St',
      p.blood,
      p.allergies,
      '555-0199',
      createdBy,
    ]
  );
  return id;
}

async function main() {
  try {
    console.log('Seeding database...');

    const adminId = await ensureUser('admin@care.save', 'admin', 'Admin User', PASSWORDS.admin);
    const doctorUserId = await ensureUser('doctor@care.save', 'doctor', 'Dr. Alice Chen', PASSWORDS.doctor);
    const receptionId = await ensureUser(
      'reception@care.save',
      'receptionist',
      'Reception Desk',
      PASSWORDS.reception
    );

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

    // Create appointments
    const now = Date.now();
    const day = 86400000;
    const slots = Array.from({ length: 15 }, (_, i) => {
      const offset = (i - 7) * day;
      return new Date(now + offset).toISOString();
    });

    for (let i = 0; i < 15; i++) {
      const pid = patientIds[i % patientIds.length];
      const did = doctorIds[i % doctorIds.length];
      const status = i % 4 === 0 ? 'completed' : i % 5 === 0 ? 'cancelled' : 'scheduled';
      const appointmentId = randomUUID();

      const existing = await query(
        'SELECT id FROM appointments WHERE patient_id = ? AND doctor_id = ? AND scheduled_at = ?',
        [pid, did, slots[i]]
      );

      if (existing.rows.length === 0) {
        await run(
          `INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, reason, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [appointmentId, pid, did, slots[i], ['Checkup', 'Follow-up', 'Consultation', 'Emergency'][i % 4], status, receptionId]
        );
      }
    }

    // Add sample medical record
    const recordId = randomUUID();
    await run(
      `INSERT INTO medical_records (id, patient_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment, prescription, vitals, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordId,
        patientIds[0],
        doctorIds[0],
        new Date(now - day).toISOString(),
        'Chest pain',
        'Hypertension',
        'Lifestyle counseling',
        'Lisinopril 10mg',
        JSON.stringify({ bp: '150/95', hr: 82, temp: 36.8 }),
        doctorUserId,
      ]
    );

    // Add sample bill
    const billId = randomUUID();
    await run(
      `INSERT INTO bills (id, patient_id, doctor_id, items, total_cents, status, method, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billId,
        patientIds[0],
        doctorIds[0],
        JSON.stringify([
          { desc: 'Cardiology consult', amount_cents: 8000 },
          { desc: 'ECG', amount_cents: 3000 },
        ]),
        11000,
        'unpaid',
        'cash',
        receptionId,
      ]
    );

    console.log('✓ Seed complete.');
    console.log('Demo logins:');
    console.log('  admin@care.save / care-admin');
    console.log('  doctor@care.save / care-doctor');
    console.log('  reception@care.save / care-reception');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
