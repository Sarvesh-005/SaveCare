import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { recordsApi } from '../../api/records';
import { formatDateTime } from '../../lib/date';
import { RecordFormModal } from './RecordFormModal';
import { useAuth } from '../../context/AuthContext';
import type { MedicalRecord } from '../../types';

export function RecordsList() {
  const [items, setItems] = useState<(MedicalRecord & { patient_name?: string; doctor_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const canWrite = user?.role !== 'receptionist';

  const load = async () => {
    setLoading(true);
    try {
      const r = await recordsApi.list();
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Medical Records</h1>
        {canWrite && (
          <button className="btn" onClick={() => setShowForm(true)}>
            + New record
          </button>
        )}
      </div>
      <DataTable
        columns={[
          { key: 'visit_date', header: 'Visit', render: (r) => formatDateTime(r.visit_date) },
          { key: 'patient_name', header: 'Patient' },
          { key: 'doctor_name', header: 'Doctor' },
          { key: 'chief_complaint', header: 'Complaint' },
          { key: 'diagnosis', header: 'Diagnosis' },
        ]}
        rows={items}
        loading={loading}
      />
      {showForm && (
        <RecordFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}
