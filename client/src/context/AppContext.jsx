// client/src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records,      setRecords]      = useState([]);
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch demo data
      const [p, d, a, r, i] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/doctors'),
        api.get('/api/appointments'),
        api.get('/api/records'),
        api.get('/api/billing')
      ]);

      setPatients(p || []);
      setDoctors(d || []);
      setAppointments(a || []);
      setRecords(r || []);
      setInvoices(i || []);
      setIsSupabaseConnected(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsSupabaseConnected(false);
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
      console.error(`Failed to refresh ${entity}:`, err);
    }
  }, []);

  useEffect(() => { 
    fetchAll(); 
  }, [fetchAll]);

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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
