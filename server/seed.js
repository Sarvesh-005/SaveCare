// server/seed.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import MedicalRecord from './models/MedicalRecord.js';
import Invoice from './models/Invoice.js';

dotenv.config();
await connectDB();

// Clear existing data
await Patient.deleteMany();
await Doctor.deleteMany();
await Appointment.deleteMany();
await MedicalRecord.deleteMany();
await Invoice.deleteMany();

const doctors = await Doctor.insertMany([
  { firstName:'Sarah',  lastName:'Chen',    specialization:'Cardiology',        department:'Cardiac Care',         phone:'555-0101', email:'s.chen@savecare.com',    licenseNumber:'MD-001', available:true },
  { firstName:'James',  lastName:'Okafor',  specialization:'Neurology',         department:'Neuroscience',         phone:'555-0102', email:'j.okafor@savecare.com',  licenseNumber:'MD-002', available:true },
  { firstName:'Priya',  lastName:'Sharma',  specialization:'General Medicine',  department:'Internal Medicine',    phone:'555-0103', email:'p.sharma@savecare.com',  licenseNumber:'MD-003', available:true },
  { firstName:'Marcus', lastName:'Webb',    specialization:'Orthopedics',       department:'Musculoskeletal',      phone:'555-0104', email:'m.webb@savecare.com',    licenseNumber:'MD-004', available:false },
  { firstName:'Elena',  lastName:'Torres',  specialization:'Dermatology',       department:'Skin & Allergy',       phone:'555-0105', email:'e.torres@savecare.com',  licenseNumber:'MD-005', available:true },
  { firstName:'Raj',    lastName:'Patel',   specialization:'Pediatrics',        department:'Child Health',         phone:'555-0106', email:'r.patel@savecare.com',   licenseNumber:'MD-006', available:true },
  { firstName:'Emma',   lastName:'Wilson',  specialization:'Psychiatry',        department:'Mental Health',        phone:'555-0107', email:'e.wilson@savecare.com',  licenseNumber:'MD-007', available:true },
]);

const patients = await Patient.insertMany([
  { firstName:'Alice',   lastName:'Johnson',  dateOfBirth:new Date('1985-03-12'), gender:'female', bloodType:'O+',  phone:'555-1001', email:'alice@email.com',   allergies:['Penicillin'] },
  { firstName:'Bob',     lastName:'Martinez', dateOfBirth:new Date('1978-07-22'), gender:'male',   bloodType:'A+',  phone:'555-1002', email:'bob@email.com' },
  { firstName:'Carol',   lastName:'Williams', dateOfBirth:new Date('1992-11-05'), gender:'female', bloodType:'B-',  phone:'555-1003', email:'carol@email.com',   allergies:['Sulfa'] },
  { firstName:'David',   lastName:'Brown',    dateOfBirth:new Date('1965-01-30'), gender:'male',   bloodType:'AB+', phone:'555-1004', email:'david@email.com' },
  { firstName:'Eva',     lastName:'Garcia',   dateOfBirth:new Date('2000-09-18'), gender:'female', bloodType:'O-',  phone:'555-1005', email:'eva@email.com' },
  { firstName:'Frank',   lastName:'Lee',      dateOfBirth:new Date('1955-04-10'), gender:'male',   bloodType:'A-',  phone:'555-1006', email:'frank@email.com',   allergies:['Aspirin','Ibuprofen'] },
  { firstName:'Grace',   lastName:'Kim',      dateOfBirth:new Date('1990-08-25'), gender:'female', bloodType:'B+',  phone:'555-1007', email:'grace@email.com' },
  { firstName:'Henry',   lastName:'Nguyen',   dateOfBirth:new Date('1972-12-01'), gender:'male',   bloodType:'O+',  phone:'555-1008', email:'henry@email.com' },
]);

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

const appointments = await Appointment.insertMany([
  { patientId:patients[0]._id, doctorId:doctors[0]._id, date:today,     time:'09:00', type:'consultation', status:'scheduled',  reason:'Chest pain evaluation' },
  { patientId:patients[1]._id, doctorId:doctors[2]._id, date:today,     time:'10:30', type:'followup',     status:'scheduled',  reason:'Blood pressure follow-up' },
  { patientId:patients[2]._id, doctorId:doctors[1]._id, date:today,     time:'11:00', type:'consultation', status:'completed',  reason:'Headache assessment' },
  { patientId:patients[3]._id, doctorId:doctors[3]._id, date:tomorrow,  time:'14:00', type:'consultation', status:'scheduled',  reason:'Knee pain' },
  { patientId:patients[4]._id, doctorId:doctors[4]._id, date:tomorrow,  time:'15:30', type:'consultation', status:'scheduled',  reason:'Skin rash examination' },
  { patientId:patients[5]._id, doctorId:doctors[2]._id, date:yesterday, time:'09:00', type:'followup',     status:'completed',  reason:'Diabetes management' },
  { patientId:patients[6]._id, doctorId:doctors[6]._id, date:yesterday, time:'11:00', type:'consultation', status:'completed',  reason:'Anxiety and sleep issues' },
  { patientId:patients[7]._id, doctorId:doctors[0]._id, date:today,     time:'13:00', type:'emergency',    status:'scheduled',  reason:'Palpitations' },
]);

await MedicalRecord.insertMany([
  {
    patientId:patients[2]._id, doctorId:doctors[1]._id, appointmentId:appointments[2]._id,
    diagnosis:'Migraine with aura',
    symptoms:['severeHeadache','nausea','lightSensitivity','aura'],
    prescription:[{ medication:'Sumatriptan 50mg', dosage:'1 tablet at onset', duration:'As needed' }],
    labResults:[{ test:'MRI Brain', result:'Normal', unit:'', normalRange:'Normal' }],
    notes:'Patient reports 3-4 episodes per month. Trigger identified as stress and lack of sleep.',
    vitalSigns:{ bloodPressure:'120/78', heartRate:72, temperature:36.8 }
  },
  {
    patientId:patients[5]._id, doctorId:doctors[2]._id, appointmentId:appointments[5]._id,
    diagnosis:'Type 2 Diabetes Mellitus',
    symptoms:['frequentUrination','excessiveThirst','fatigue','blurredVision'],
    prescription:[{ medication:'Metformin 500mg', dosage:'Twice daily with meals', duration:'Ongoing' }],
    labResults:[
      { test:'HbA1c', result:'8.2', unit:'%', normalRange:'<7%' },
      { test:'Fasting Blood Glucose', result:'160', unit:'mg/dL', normalRange:'70-100 mg/dL' }
    ],
    notes:'Patient counselled on diet and exercise. Follow-up in 3 months.',
    vitalSigns:{ bloodPressure:'135/85', heartRate:78, temperature:37.0, weight:92, height:175 }
  },
  {
    patientId:patients[6]._id, doctorId:doctors[6]._id, appointmentId:appointments[6]._id,
    diagnosis:'Generalised Anxiety Disorder',
    symptoms:['sleepDisturbance','concentrationDifficulty','fatigue','socialWithdrawal'],
    prescription:[{ medication:'Sertraline 50mg', dosage:'Once daily in morning', duration:'12 weeks initial' }],
    labResults:[{ test:'TSH', result:'2.1', unit:'mIU/L', normalRange:'0.4-4.0 mIU/L' }],
    notes:'PHQ-9 score 14 (moderate). Referred to CBT therapy.',
    vitalSigns:{ bloodPressure:'118/76', heartRate:82, temperature:36.6 }
  },
]);

// Seed invoices with some paid, some pending
const inv1 = new Invoice({
  patientId:patients[2]._id, appointmentId:appointments[2]._id,
  items:[
    { description:'Neurology Consultation', quantity:1, unitPrice:250, total:250 },
    { description:'MRI Brain Scan',         quantity:1, unitPrice:800, total:800 },
  ],
  subtotal:1050, tax:10, total:1155, status:'paid', paymentMethod:'card',
  issuedAt:yesterday, paidAt:yesterday
});
await inv1.save();

const inv2 = new Invoice({
  patientId:patients[5]._id, appointmentId:appointments[5]._id,
  items:[
    { description:'General Medicine Consultation', quantity:1, unitPrice:150, total:150 },
    { description:'HbA1c Test',                    quantity:1, unitPrice:80,  total:80 },
    { description:'Fasting Blood Glucose',          quantity:1, unitPrice:40,  total:40 },
  ],
  subtotal:270, tax:5, total:283.5, status:'paid', paymentMethod:'insurance',
  issuedAt:yesterday, paidAt:yesterday
});
await inv2.save();

const inv3 = new Invoice({
  patientId:patients[0]._id,
  items:[{ description:'Cardiology Consultation', quantity:1, unitPrice:300, total:300 }],
  subtotal:300, tax:10, total:330, status:'pending', issuedAt:today
});
await inv3.save();

const inv4 = new Invoice({
  patientId:patients[1]._id,
  items:[
    { description:'Follow-up Consultation', quantity:1, unitPrice:120, total:120 },
    { description:'Blood Pressure Monitoring Kit', quantity:1, unitPrice:65, total:65 },
  ],
  subtotal:185, tax:5, total:194.25, status:'pending', issuedAt:today
});
await inv4.save();

const inv5 = new Invoice({
  patientId:patients[3]._id,
  items:[{ description:'Orthopedics Consultation', quantity:1, unitPrice:200, total:200 }],
  subtotal:200, tax:10, total:220, status:'overdue', issuedAt:yesterday
});
await inv5.save();

console.log('✅ Seed complete!');
console.log(`   Doctors:      ${doctors.length}`);
console.log(`   Patients:     ${patients.length}`);
console.log(`   Appointments: ${appointments.length}`);
console.log(`   Records:      3`);
console.log(`   Invoices:     5`);
mongoose.disconnect();
