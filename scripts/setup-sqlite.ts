import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import initSqlJs from 'sql.js';
import { hashPassword } from '../api/lib/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = resolve(process.cwd(), 'caresave');
const DB_FILE = resolve(DB_DIR, 'hospital.db');

console.log('DB_DIR:', DB_DIR);
console.log('DB_FILE:', DB_FILE);

// Ensure directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

async function setup() {
  try {
    console.log('Setting up SQLite database...');

    const SQL = await initSqlJs();
    let db = new SQL.Database();

    // Read and execute schema
    const schema = readFileSync(join(__dirname, 'schema-sqlite.sql'), 'utf8');
    const statements = schema.split(';').filter((s) => s.trim());

    for (const stmt of statements) {
      if (stmt.trim()) {
        db.run(stmt);
      }
    }

    console.log('✓ Tables created');

    // Seed demo data
    const PASSWORDS = {
      admin: 'care-admin',
      doctor: 'care-doctor',
      reception: 'care-reception',
    };

    const adminId = randomUUID();
    const doctorUserId = randomUUID();
    const receptionId = randomUUID();

    const adminHash = await hashPassword(PASSWORDS.admin);
    const doctorHash = await hashPassword(PASSWORDS.doctor);
    const receptionHash = await hashPassword(PASSWORDS.reception);

    // Insert users
    db.run(
      'INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'admin@care.save', adminHash, 'admin', 'Admin User']
    );
    db.run(
      'INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
      [doctorUserId, 'doctor@care.save', doctorHash, 'doctor', 'Dr. Alice Chen']
    );
    db.run(
      'INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
      [receptionId, 'reception@care.save', receptionHash, 'receptionist', 'Reception Desk']
    );

    console.log('✓ Users created');

    // Insert doctors
    const doctorIds = [
      { name: 'Dr. Alice Chen', spec: 'Cardiology', fee: 8000 },
      { name: 'Dr. Brian Lee', spec: 'Pediatrics', fee: 6000 },
      { name: 'Dr. Carla Diaz', spec: 'Neurology', fee: 9000 },
      { name: 'Dr. David Kim', spec: 'Orthopedics', fee: 7000 },
      { name: 'Dr. Eva Brown', spec: 'General Medicine', fee: 5000 },
    ].map((d) => {
      const id = randomUUID();
      db.run(
        'INSERT INTO doctors (id, name, specialization, email, phone, consultation_fee_cents, available_days) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, d.name, d.spec, `${d.name.split(' ')[0].toLowerCase()}@care.save`, '555-0100', d.fee, 'Mon,Tue,Wed,Thu,Fri']
      );
      return id;
    });

    console.log('✓ Doctors created');

    // Insert patients
    const patientData = [
      { name: 'John Smith', dob: '1985-03-12', gender: 'male', phone: '555-1001', blood: 'O+', allergies: '' },
      { name: 'Mary Jones', dob: '1990-07-22', gender: 'female', phone: '555-1002', blood: 'A+', allergies: 'Penicillin' },
      { name: 'Robert Brown', dob: '1978-11-05', gender: 'male', phone: '555-1003', blood: 'B+', allergies: '' },
      { name: 'Patricia Taylor', dob: '2000-01-30', gender: 'female', phone: '555-1004', blood: 'AB+', allergies: '' },
      { name: 'James Wilson', dob: '1965-09-18', gender: 'male', phone: '555-1005', blood: 'O-', allergies: 'Aspirin' },
      { name: 'Linda Davis', dob: '1995-04-25', gender: 'female', phone: '555-1006', blood: 'A-', allergies: '' },
      { name: 'Michael Miller', dob: '1982-12-03', gender: 'male', phone: '555-1007', blood: 'B-', allergies: '' },
      { name: 'Sarah Garcia', dob: '1998-06-14', gender: 'female', phone: '555-1008', blood: 'O+', allergies: '' },
      { name: 'Thomas Rodriguez', dob: '1970-08-21', gender: 'male', phone: '555-1009', blood: 'A+', allergies: '' },
      { name: 'Jennifer Martinez', dob: '1988-02-09', gender: 'female', phone: '555-1010', blood: 'AB-', allergies: 'Latex' },
    ];

    const patientIds = patientData.map((p) => {
      const id = randomUUID();
      db.run(
        'INSERT INTO patients (id, name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, p.name, p.dob, p.gender, p.phone, `${p.name.split(' ')[0].toLowerCase()}@email.com`, '123 Main St', p.blood, p.allergies, '555-0199', receptionId]
      );
      return id;
    });

    console.log('✓ Patients created');

    // Insert appointments
    const now = Date.now();
    const day = 86400000;

    for (let i = 0; i < 15; i++) {
      const appointmentId = randomUUID();
      const offset = (i - 7) * day;
      const scheduledAt = new Date(now + offset).toISOString();
      const patientId = patientIds[i % patientIds.length];
      const doctorId = doctorIds[i % doctorIds.length];
      const status = i % 4 === 0 ? 'completed' : i % 5 === 0 ? 'cancelled' : 'scheduled';
      const reason = ['Checkup', 'Follow-up', 'Consultation', 'Emergency'][i % 4];

      db.run(
        'INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, reason, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [appointmentId, patientId, doctorId, scheduledAt, reason, status, receptionId]
      );
    }

    console.log('✓ Appointments created');

    // Record migration
    db.run("INSERT OR IGNORE INTO migrations (name) VALUES ('001-init')");

    // Ensure directory exists before saving
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }

    // Save database
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_FILE, buffer);

    console.log('✓ Database saved');
    console.log('\n✓ Setup complete!');
    console.log('\nDemo logins:');
    console.log('  admin@care.save / care-admin');
    console.log('  doctor@care.save / care-doctor');
    console.log('  reception@care.save / care-reception');
    console.log(`\nDatabase location: ${DB_FILE}`);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
