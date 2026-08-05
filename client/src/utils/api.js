// client/src/utils/api.js

// Demo data fallbacks
const DEMO_PATIENTS = [
  { id:'pat1', firstName:'Alice', lastName:'Johnson', dateOfBirth:'1985-03-12', gender:'female', bloodType:'O+', phone:'555-1001', email:'alice@email.com', allergies:['Penicillin'] },
  { id:'pat2', firstName:'Bob', lastName:'Martinez', dateOfBirth:'1978-07-22', gender:'male', bloodType:'A+', phone:'555-1002', email:'bob@email.com', allergies:[] },
  { id:'pat3', firstName:'Carol', lastName:'Williams', dateOfBirth:'1992-11-05', gender:'female', bloodType:'B-', phone:'555-1003', email:'carol@email.com', allergies:['Sulfa'] }
];

const DEMO_DOCTORS = [
  { id:'doc1', firstName:'Sarah', lastName:'Chen', specialization:'Cardiology', department:'Cardiac Care', phone:'555-0101', email:'s.chen@savecare.com', licenseNumber:'MD-001', available:true },
  { id:'doc2', firstName:'James', lastName:'Okafor', specialization:'Neurology', department:'Neuroscience', phone:'555-0102', email:'j.okafor@savecare.com', licenseNumber:'MD-002', available:true },
  { id:'doc3', firstName:'Priya', lastName:'Sharma', specialization:'General Medicine', department:'Internal Medicine', phone:'555-0103', email:'p.sharma@savecare.com', licenseNumber:'MD-003', available:true },
  { id:'doc4', firstName:'Marcus', lastName:'Webb', specialization:'Orthopedics', department:'Musculoskeletal', phone:'555-0104', email:'m.webb@savecare.com', licenseNumber:'MD-004', available:false },
  { id:'doc5', firstName:'Elena', lastName:'Torres', specialization:'Dermatology', department:'Skin & Allergy', phone:'555-0105', email:'e.torres@savecare.com', licenseNumber:'MD-005', available:true }
];

const DEMO_APPOINTMENTS = [
  { id:'apt1', patientId:DEMO_PATIENTS[0], doctorId:DEMO_DOCTORS[0], date:'2026-08-05', time:'09:00', type:'consultation', status:'scheduled', reason:'Chest pain evaluation' },
  { id:'apt2', patientId:DEMO_PATIENTS[1], doctorId:DEMO_DOCTORS[2], date:'2026-08-05', time:'10:30', type:'followup', status:'scheduled', reason:'Blood pressure follow-up' }
];

const DEMO_RECORDS = [
  { id:'rec1', patientId:DEMO_PATIENTS[2], doctorId:DEMO_DOCTORS[1], diagnosis:'Migraine with aura', symptoms:['severeHeadache','nausea','lightSensitivity'], notes:'Patient reports 3-4 episodes per month.', vitalSigns:{bloodPressure:'120/78', heartRate:72, temperature:36.8} }
];

const DEMO_INVOICES = [
  { id:'inv1', patientId:DEMO_PATIENTS[2], appointmentId:DEMO_APPOINTMENTS[0], items:[{description:'Neurology Consultation', quantity:1, unitPrice:250, total:250}], subtotal:250, tax:10, total:275, status:'paid', paymentMethod:'card', issuedAt:'2026-08-01' }
];

export const api = {
  async get(url) {
    try {
      // Return demo data based on endpoint
      if (url.includes('/patients')) return DEMO_PATIENTS;
      if (url.includes('/doctors')) return DEMO_DOCTORS;
      if (url.includes('/appointments')) return DEMO_APPOINTMENTS;
      if (url.includes('/records')) return DEMO_RECORDS;
      if (url.includes('/billing')) return DEMO_INVOICES;
      
      return [];
    } catch (err) {
      console.warn('API error, returning demo data:', err.message);
      return [];
    }
  },

  async post(url, body) {
    try {
      const newItem = { id: Math.random().toString(36).substr(2, 9), ...body };
      return newItem;
    } catch (err) {
      console.error('POST error:', err);
      throw err;
    }
  },

  async put(url, body) {
    try {
      return { id: url.split('/').pop(), ...body };
    } catch (err) {
      console.error('PUT error:', err);
      throw err;
    }
  },

  async del(url) {
    try {
      return { message: 'Deleted successfully' };
    } catch (err) {
      console.error('DELETE error:', err);
      throw err;
    }
  }
};
