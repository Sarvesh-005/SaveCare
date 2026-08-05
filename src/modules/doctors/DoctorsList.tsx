import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { doctorsApi } from '../../api/doctors';
import { useAuth } from '../../context/AuthContext';
import { DoctorFormModal } from './DoctorFormModal';
import type { Doctor } from '../../types';

export function DoctorsList() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const r = await doctorsApi.list();
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
        <h1 style={{ margin: 0 }}>Doctors</h1>
        {isAdmin && (
          <button className="btn" onClick={() => setShowForm(true)}>
            + New doctor
          </button>
        )}
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'specialization', header: 'Specialization' },
          { key: 'phone', header: 'Phone' },
          { key: 'consultation_fee_cents', header: 'Fee', render: (r) => `$${(r.consultation_fee_cents / 100).toFixed(2)}` },
          { key: 'available_days', header: 'Available' },
        ]}
        rows={items}
        loading={loading}
        onRowClick={(r) => navigate(`/doctors/${r.id}`)}
      />
      {showForm && (
        <DoctorFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
