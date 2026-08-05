// client/src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

const INITIAL_DOCTORS = [
  { _id:'doc1', firstName:'Sarah',  lastName:'Chen',   specialization:'Cardiology',       department:'Cardiac Care',      phone:'555-0101', email:'s.chen@savecare.com',   licenseNumber:'MD-001', available:true },
  { _id:'doc2', firstName:'James',  lastName:'Okafor', specialization:'Neurology',        department:'Neuroscience',      phone:'555-0102', email:'j.okafor@savecare.com',  licenseNumber:'MD-002', available:true },
  { _id:'doc3', firstName:'Priya',  lastName:'Sharma', specialization:'General Medicine', department:'Internal Medicine', phone:'555-0103', email:'p.sharma@savecare.com',  licenseNumber:'MD-003', available:true },
  { _id:'doc4', firstName:'Marcus', lastName:'Webb',   specialization:'Orthopedics',      department:'Musculoskeletal',   phone:'555-0104', email:'m.webb@savecare.com',    licenseNumber:'MD-004', available:false },
  { _id:'doc5', firstName:'Elena',  lastName:'Torres', specialization:'Dermatology',      department:'Skin & Allergy',    phone:'555-0105', email:'e.torres@savecare.com',  licenseNumber:'MD-005', available:true }
];

const INITIAL_PATIENTS = [
  { _id:'pat1', firstName:'Alice', lastName:'Johnson',  dateOfBirth:'1985-03-12', gender:'female', bloodType:'O+', phone:'555-1001', email:'alice@email.com', allergies:['Penicillin'] },
  { _id:'pat2', firstName:'Bob',   lastName:'Martinez', dateOfBirth:'1978-07-22', gender:'male',   bloodType:'A+', phone:'555-1002', email:'bob@email.com',   allergies:[] },
  { _id:'pat3', firstName:'Carol', lastName:'Williams', dateOfBirth:'1992-11-05', gender:'female', bloodType:'B-', phone:'555-1003', email:'carol@email.com', allergies:['Sulfa'] }
];

const INITIAL_APPOINTMENTS = [
  { _id:'apt1', patientId:INITIAL_PATIENTS[0], doctorId:INITIAL_DOCTORS[0], date:'2026-08-05', time:'09:00', type:'consultation', status:'scheduled', reason:'Chest pain evaluation' },
  { _id:'apt2', patientId:INITIAL_PATIENTS[1], doctorId:INITIAL_DOCTORS[2], date:'2026-08-05', time:'10:30', type:'followup', status:'scheduled', reason:'Blood pressure follow-up' }
];

const INITIAL_RECORDS = [
  { _id:'rec1', patientId:INITIAL_PATIENTS[2], doctorId:INITIAL_DOCTORS[1], diagnosis:'Migraine with aura', symptoms:['severeHeadache','nausea','lightSensitivity'], notes:'Patient reports 3-4 episodes per month.', vitalSigns:{bloodPressure:'120/78', heartRate:72, temperature:36.8} }
];

const INITIAL_INVOICES = [
  { _id:'inv1', patientId:INITIAL_PATIENTS[2], appointmentId:INITIAL_APPOINTMENTS[0], items:[{description:'Neurology Consultation', quantity:1, unitPrice:250, total:250}], subtotal:250, tax:10, total:275, status:'paid', paymentMethod:'card', issuedAt:'2026-08-01' }
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
      // Try to fetch from API
      const [p, d, a, r, i] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/doctors'),
        api.get('/api/appointments'),
        api.get('/api/records'),
        api.get('/api/billing')
      ]);

      setIsSupabaseConnected(true);
      setPatients(p || INITIAL_PATIENTS);
      setDoctors(d || INITIAL_DOCTORS);
      setAppointments(a || INITIAL_APPOINTMENTS);
      setRecords(r || INITIAL_RECORDS);
      setInvoices(i || INITIAL_INVOICES);
    } catch (err) {
      console.warn('⚠️ Backend unavailable. Using demo data instead. Error:', err.message);
      setIsSupabaseConnected(false);
      
      // Fallback to demo data
      setPatients(INITIAL_PATIENTS);
      setDoctors(INITIAL_DOCTORS);
      setAppointments(INITIAL_APPOINTMENTS);
      setRecords(INITIAL_RECORDS);
      setInvoices(INITIAL_INVOICES);
    } finally {
      setLoading(false);
    }
  }, []);

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
      console.warn(`Failed to refresh ${entity}:`, err);
      // Keep existing data on error
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
