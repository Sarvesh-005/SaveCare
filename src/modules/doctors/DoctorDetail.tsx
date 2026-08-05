import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsApi } from '../../api/doctors';
import { DoctorFormModal } from './DoctorFormModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { Doctor } from '../../types';

export function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) doctorsApi.get(id).then(setDoctor).catch((e) => toast(e.message, 'error'));
  }, [id]);
  if (!doctor) return <div className="card">Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{doctor.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => navigate('/doctors')}>
            Back
          </button>
          {user?.role === 'admin' && (
            <button className="btn" onClick={() => setShowForm(true)}>
              Edit
            </button>
          )}
        </div>
      </div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <strong>Specialization:</strong> {doctor.specialization}
        </div>
        <div>
          <strong>Email:</strong> {doctor.email || '—'}
        </div>
        <div>
          <strong>Phone:</strong> {doctor.phone || '—'}
        </div>
        <div>
          <strong>Fee:</strong> ${(doctor.consultation_fee_cents / 100).toFixed(2)}
        </div>
        <div>
          <strong>Available:</strong> {doctor.available_days || '—'}
        </div>
      </div>
      {showForm && (
        <DoctorFormModal
          doctor={doctor}
          onSaved={() => {
            setShowForm(false);
            if (id) doctorsApi.get(id).then(setDoctor);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
