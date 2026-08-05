#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup paths - work around file lock by using alternative naming
const tempDir = path.resolve(__dirname, '../.db-temp');
let dbDir = path.resolve(__dirname, '../caresave');
let dbFile = path.resolve(dbDir, 'hospital.db');

// Check if 'caresave' exists as a file (from earlier attempts)
// If so, use the file itself as the database instead of a directory
try {
  if (fs.existsSync(dbDir)) {
    const stat = fs.statSync(dbDir);
    if (!stat.isDirectory()) {
      console.log('⚠️  Found caresave as a file, will use it directly as the database');
      // Just use the file path directly
      dbFile = dbDir;
      dbDir = path.dirname(dbDir);
    }
  }
} catch (e) {
  // Ignore stat errors
}

console.log('🗄️  Setting up SQLite database...');
console.log('Target location:', dbFile);

// Use temp directory to avoid locks
try {
  fs.mkdirSync(tempDir, { recursive: true });
} catch (e) {
  console.error('Failed to create temp directory:', e.message);
  process.exit(1);
}

async function setup() {
  try {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Create schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema-sqlite.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        db.run(stmt);
      }
    }
    console.log('✓ Tables created');

    // Generate UUIDs
    const generateId = () => crypto.randomUUID();
    const adminId = generateId();
    const doctorUserId = generateId();
    const receptionId = generateId();

    // Hash passwords synchronously using bcryptjs
    const saltSync = bcryptjs.genSaltSync(10);
    const adminHash = bcryptjs.hashSync('care-admin', saltSync);
    const doctorHash = bcryptjs.hashSync('care-doctor', saltSync);
    const receptionHash = bcryptjs.hashSync('care-reception', saltSync);

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
    const doctorData = [
      { name: 'Dr. Alice Chen', spec: 'Cardiology', fee: 8000 },
      { name: 'Dr. Brian Lee', spec: 'Pediatrics', fee: 6000 },
      { name: 'Dr. Carla Diaz', spec: 'Neurology', fee: 9000 },
      { name: 'Dr. David Kim', spec: 'Orthopedics', fee: 7000 },
      { name: 'Dr. Eva Brown', spec: 'General Medicine', fee: 5000 },
    ];

    const doctorIds = doctorData.map(d => {
      const id = generateId();
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

    const patientIds = patientData.map(p => {
      const id = generateId();
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
      const appointmentId = generateId();
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

    // Export and save to temp location first
    const data = db.export();
    const buffer = Buffer.from(data);
    const tempDbFile = path.resolve(tempDir, 'hospital.db');
    fs.writeFileSync(tempDbFile, buffer);
    console.log('✓ Database saved to temp location');

    // Now try to move to final location
    // If dbFile is pointing to a file instead of directory/file combo, just write directly
    try {
      fs.writeFileSync(dbFile, buffer);
      console.log('✓ Database written to final location:', dbFile);
    } catch (writeErr) {
      if (writeErr.code === 'ENOENT') {
        // Parent directory doesn't exist, create it
        try {
          fs.mkdirSync(path.dirname(dbFile), { recursive: true });
          fs.writeFileSync(dbFile, buffer);
          console.log('✓ Database written to final location:', dbFile);
        } catch (e) {
          throw new Error('Could not create database file: ' + e.message);
        }
      } else {
        throw writeErr;
      }
    }

    // Cleanup temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n✅ Setup complete!');
    console.log('\n📧 Demo logins:');
    console.log('   admin@care.save / care-admin');
    console.log('   doctor@care.save / care-doctor');
    console.log('   reception@care.save / care-reception');
    console.log('\n📁 Database location:');
    console.log('   ' + dbFile);
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    console.error(err.stack);
    // Cleanup temp on error
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
    process.exit(1);
  }
}

setup();
