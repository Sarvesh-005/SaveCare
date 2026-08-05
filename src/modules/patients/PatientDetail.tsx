import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsApi } from '../../api/patients';
import { PatientFormModal } from './PatientFormModal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/date';
import type { Patient } from '../../types';

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!id) return;
    try {
      setPatient(await patientsApi.get(id));
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };
  useEffect(() => {
    load();
  }, [id]);

  if (!patient) return <div className="card">Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{patient.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => navigate('/patients')}>
            Back
          </button>
          <button className="btn" onClick={() => setShowForm(true)}>
            Edit
          </button>
        </div>
      </div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <strong>DOB:</strong> {formatDate(patient.date_of_birth)}
        </div>
        <div>
          <strong>Gender:</strong> {patient.gender}
        </div>
        <div>
          <strong>Phone:</strong> {patient.phone || '—'}
        </div>
        <div>
          <strong>Email:</strong> {patient.email || '—'}
        </div>
        <div>
          <strong>Blood:</strong> {patient.blood_group || '—'}
        </div>
        <div>
          <strong>Allergies:</strong> {patient.allergies || 'None'}
        </div>
        <div>
          <strong>Address:</strong> {patient.address || '—'}
        </div>
        <div>
          <strong>Emergency:</strong> {patient.emergency_contact || '—'}
        </div>
      </div>
      {showForm && (
        <PatientFormModal
          patient={patient}
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
