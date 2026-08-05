// client/src/utils/api.js
import { supabase } from '../lib/supabase';
import { mapFromSupabase, mapToSupabase } from './supabaseHelpers';

// Helper to extract table name and ID from API endpoint path
function parseEndpoint(url) {
  const clean = url.replace(/^\/api\//, '').split('?')[0];
  const parts = clean.split('/').filter(Boolean);
  
  const routeMap = {
    patients: 'patients',
    doctors: 'doctors',
    appointments: 'appointments',
    records: 'medical_records',
    billing: 'invoices'
  };

  const table = routeMap[parts[0]] || parts[0];
  const id = parts[1] && parts[1] !== 'patient' ? parts[1] : null;
  const isPatientRecordQuery = parts[0] === 'records' && parts[1] === 'patient' ? parts[2] : null;

  return { table, id, isPatientRecordQuery, rawRoute: parts[0] };
}

export const api = {
  async get(url) {
    const { table, id, isPatientRecordQuery } = parseEndpoint(url);

    if (isPatientRecordQuery) {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*, patients(*), doctors(*)')
        .eq('patient_id', isPatientRecordQuery)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => mapFromSupabase('medical_records', row));
    }

    let query = supabase.from(table).select(getSelectQuery(table));

    if (id) {
      const { data, error } = await query.eq('id', id).single();
      if (error) throw error;
      return mapFromSupabase(table, data);
    }

    if (table === 'patients') query = query.eq('is_active', true).order('created_at', { ascending: false });
    if (table === 'doctors') query = query.order('last_name', { ascending: true });
    if (table === 'appointments') query = query.order('date', { ascending: true });
    if (table === 'medical_records' || table === 'invoices') query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(row => mapFromSupabase(table, row));
  },

  async post(url, body) {
    const { table } = parseEndpoint(url);
    const dbPayload = mapToSupabase(table, body);

    const { data, error } = await supabase
      .from(table)
      .insert(dbPayload)
      .select(getSelectQuery(table))
      .single();

    if (error) throw error;
    return mapFromSupabase(table, data);
  },

  async put(url, body) {
    const { table, id } = parseEndpoint(url);
    if (!id) throw new Error('ID required for update');

    const dbPayload = mapToSupabase(table, body);

    const { data, error } = await supabase
      .from(table)
      .update(dbPayload)
      .eq('id', id)
      .select(getSelectQuery(table))
      .single();

    if (error) throw error;
    return mapFromSupabase(table, data);
  },

  async del(url) {
    const { table, id } = parseEndpoint(url);
    if (!id) throw new Error('ID required for deletion');

    if (table === 'patients') {
      const { error } = await supabase.from('patients').update({ is_active: false }).eq('id', id);
      if (error) throw error;
      return { message: 'Patient deactivated' };
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { message: 'Deleted successfully' };
  }
};

function getSelectQuery(table) {
  switch (table) {
    case 'appointments':
      return '*, patients(*), doctors(*)';
    case 'medical_records':
      return '*, patients(*), doctors(*)';
    case 'invoices':
      return '*, patients(*), appointments(*)';
    default:
      return '*';
  }
}
