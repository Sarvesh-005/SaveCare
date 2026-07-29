import { Patient, Doctor } from '../src/types';

export const patients: Patient[] = [
  { id: 'p1', name: 'Asha Rao', date_of_birth: '1990-05-12', gender: 'female', phone: '9876543210', email: 'asha@example.com', address: 'Mumbai', blood_group: 'B+', allergies: 'None', emergency_contact: 'Rao:9876501111', created_at: new Date().toISOString(), created_by: 'seed' },
  { id: 'p2', name: 'Rohit Kumar', date_of_birth: '1985-11-03', gender: 'male', phone: '9123456780', email: 'rohit@example.com', address: 'Delhi', blood_group: 'O+', allergies: 'Penicillin', emergency_contact: 'Kumar:9123400000', created_at: new Date().toISOString(), created_by: 'seed' },
];

export const doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Meera Singh', specialization: 'General Physician', email: 'meera@clinic.com', phone: '9000011111', consultation_fee_cents: 5000, available_days: 'Mon,Tue,Wed', created_at: new Date().toISOString() },
  { id: 'd2', name: 'Dr. Anil Gupta', specialization: 'Pediatrics', email: 'anil@clinic.com', phone: '9000022222', consultation_fee_cents: 7000, available_days: 'Thu,Fri', created_at: new Date().toISOString() },
];

export const appointments = [
  { id: 'a1', patient_id: 'p1', doctor_id: 'd1', scheduled_at: new Date().toISOString(), reason: 'Fever', status: 'scheduled', notes: '', created_by: 'seed', created_at: new Date().toISOString() },
];
