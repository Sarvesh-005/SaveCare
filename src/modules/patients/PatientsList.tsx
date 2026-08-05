import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { patientsApi } from '../../api/patients';
import { formatDate } from '../../lib/date';
import { useAuth } from '../../context/AuthContext';
import { PatientFormModal } from './PatientFormModal';
import type { Patient } from '../../types';

export function PatientsList() {
  const [items, setItems] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user && ['admin', 'receptionist', 'doctor'].includes(user.role);

  const load = async () => {
    setLoading(true);
    try {
      const r = await patientsApi.list(search);
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Patients</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search name, phone, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          {canCreate && (
            <button className="btn" onClick={() => setShowForm(true)}>
              + New patient
            </button>
          )}
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'date_of_birth', header: 'DOB', render: (r) => formatDate(r.date_of_birth) },
          { key: 'gender', header: 'Gender' },
          { key: 'phone', header: 'Phone' },
          { key: 'blood_group', header: 'Blood' },
        ]}
        rows={items}
        loading={loading}
        onRowClick={(r) => navigate(`/patients/${r.id}`)}
      />
      {showForm && (
        <PatientFormModal
          onSaved={() => {
            setShowForm(false);
            load();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
