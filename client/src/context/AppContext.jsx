// client/src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

const INITIAL_DOCTORS = [
  { firstName:'Sarah',  lastName:'Chen',   specialization:'Cardiology',       department:'Cardiac Care',      phone:'555-0101', email:'s.chen@savecare.com',   licenseNumber:'MD-001', available:true },
  { firstName:'James',  lastName:'Okafor', specialization:'Neurology',        department:'Neuroscience',        phone:'555-0102', email:'j.okafor@savecare.com',  licenseNumber:'MD-002', available:true },
  { firstName:'Priya',  lastName:'Sharma', specialization:'General Medicine', department:'Internal Medicine',   phone:'555-0103', email:'p.sharma@savecare.com',  licenseNumber:'MD-003', available:true },
  { firstName:'Marcus', lastName:'Webb',   specialization:'Orthopedics',      department:'Musculoskeletal',     phone:'555-0104', email:'m.webb@savecare.com',    licenseNumber:'MD-004', available:false },
  { firstName:'Elena',  lastName:'Torres', specialization:'Dermatology',      department:'Skin & Allergy',      phone:'555-0105', email:'e.torres@savecare.com',  licenseNumber:'MD-005', available:true }
];

const INITIAL_PATIENTS = [
  { firstName:'Alice', lastName:'Johnson', dateOfBirth:'1985-03-12', gender:'female', bloodType:'O+', phone:'555-1001', email:'alice@email.com', allergies:['Penicillin'] },
  { firstName:'Bob',   lastName:'Martinez',dateOfBirth:'1978-07-22', gender:'male',   bloodType:'A+', phone:'555-1002', email:'bob@email.com',   allergies:[] },
  { firstName:'Carol', lastName:'Williams',dateOfBirth:'1992-11-05', gender:'female', bloodType:'B-', phone:'555-1003', email:'carol@email.com', allergies:['Sulfa'] }
];

export function AppProvider({ children }) {
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records,      setRecords]      = useState([]);
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase
      const [p, d, a, r, i] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/doctors'),
        api.get('/api/appointments'),
        api.get('/api/records'),
        api.get('/api/billing')
      ]);

      setIsSupabaseConnected(true);

      // Auto seed Supabase if tables are empty
      if (d.length === 0 && p.length === 0) {
        console.log('⚡ Supabase database is empty. Auto-seeding initial data...');
        await autoSeedSupabase();
        return fetchAll();
      }

      setPatients(p);
      setDoctors(d);
      setAppointments(a);
      setRecords(r);
      setInvoices(i);
    } catch (err) {
      console.warn('⚡ Could not query Supabase tables (schema script may need to be run in SQL Editor):', err.message);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  async function autoSeedSupabase() {
    try {
      const addedDoctors  = await Promise.all(INITIAL_DOCTORS.map(doc => api.post('/api/doctors', doc)));
      const addedPatients = await Promise.all(INITIAL_PATIENTS.map(pat => api.post('/api/patients', pat)));

      if (addedDoctors.length && addedPatients.length) {
        const appt1 = await api.post('/api/appointments', {
          patientId: addedPatients[0]._id, doctorId: addedDoctors[0]._id,
          date: new Date().toISOString().split('T')[0], time: '09:00',
          type: 'consultation', status: 'scheduled', reason: 'Chest pain evaluation'
        });

        const appt2 = await api.post('/api/appointments', {
          patientId: addedPatients[1]._id, doctorId: addedDoctors[2]._id,
          date: new Date().toISOString().split('T')[0], time: '10:30',
          type: 'followup', status: 'scheduled', reason: 'Blood pressure follow-up'
        });

        await api.post('/api/records', {
          patientId: addedPatients[2]._id, doctorId: addedDoctors[1]._id,
          diagnosis: 'Migraine with aura', symptoms: ['severeHeadache', 'nausea', 'lightSensitivity'],
          notes: 'Patient reports 3-4 episodes per month.', vitalSigns: { bloodPressure: '120/78', heartRate: 72, temperature: 36.8 }
        });

        await api.post('/api/billing', {
          patientId: addedPatients[2]._id, appointmentId: appt1._id,
          items: [{ description: 'Neurology Consultation', quantity: 1, unitPrice: 250, total: 250 }],
          subtotal: 250, tax: 10, total: 275, status: 'paid', paymentMethod: 'card'
        });
      }
    } catch (e) {
      console.error('Auto seed failed:', e.message);
    }
  }

  const refresh = useCallback(async (entity) => {
    try {
      const map = {
        patients:     { url: '/api/patients',     set: setPatients },
        doctors:      { url: '/api/doctors',      set: setDoctors },
        appointments: { url: '/api/appointments', set: setAppointments },
        records:      { url: '/api/records',      set: setRecords },
        invoices:     { url: '/api/billing',      set: setInvoices }
      };
      const { url, set } = map[entity];
      const data = await api.get(url);
      if (data) set(data);
    } catch (err) {
      console.error(`Failed to refresh ${entity} from Supabase:`, err);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <AppContext.Provider value={{
      patients, doctors, appointments, records, invoices, loading,
      isSupabaseConnected, refresh, fetchAll,
      setPatients, setDoctors, setAppointments, setRecords, setInvoices
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
