import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, Select, Field } from '../../components/Form';
import { recordsApi } from '../../api/records';
import { patientsApi } from '../../api/patients';
import { doctorsApi } from '../../api/doctors';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { MedicalRecord, Patient, Doctor } from '../../types';

export function RecordFormModal({
  record,
  patientId,
  onClose,
  onSaved,
}: {
  record?: MedicalRecord | null;
  patientId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const readOnly = user?.role === 'receptionist';
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Partial<MedicalRecord>>(
    record || { patient_id: patientId || '', visit_date: new Date().toISOString().slice(0, 16), vitals: {} }
  );
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof MedicalRecord | 'bp' | 'hr' | 'temp' | 'weight', v: any) =>
    setForm((f) => {
      if (['bp', 'hr', 'temp', 'weight'].includes(k as string)) {
        const vitals = { ...(f.vitals || {}) } as any;
        vitals[k] = v;
        return { ...f, vitals };
      }
      return { ...f, [k]: v };
    });

  useEffect(() => {
    patientsApi.list().then((r) => setPatients(r.items)).catch(() => {});
    doctorsApi.list().then((r) => setDoctors(r.items)).catch(() => {});
  }, []);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = { ...form, visit_date: new Date(form.visit_date!).toISOString() };
      if (record) await recordsApi.update(record.id, payload);
      else await recordsApi.create(payload);
      toast('Record saved', 'success');
      onSaved();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (readOnly && !record) return null;

  return (
    <Modal title={record ? 'Edit Record' : 'New Record'} onClose={onClose}>
      <Field>
        <Select
          label="Patient"
          value={form.patient_id || ''}
          onChange={(v) => set('patient_id', v)}
          options={patients.map((p) => ({ value: p.id, label: p.name }))}
        />
      </Field>
      <Field>
        <Select
          label="Doctor"
          value={form.doctor_id || ''}
          onChange={(v) => set('doctor_id', v)}
          options={doctors.map((d) => ({ value: d.id, label: d.name }))}
        />
      </Field>
      <Field>
        <TextField
          label="Visit date"
          type="datetime-local"
          value={(form.visit_date || '').slice(0, 16)}
          onChange={(v) => set('visit_date', v)}
        />
      </Field>
      <Field>
        <TextField
          label="Chief complaint"
          value={form.chief_complaint || ''}
          onChange={(v) => set('chief_complaint', v)}
        />
      </Field>
      <Field>
        <TextField label="Diagnosis" value={form.diagnosis || ''} onChange={(v) => set('diagnosis', v)} />
      </Field>
      <Field>
        <TextField label="Treatment" value={form.treatment || ''} onChange={(v) => set('treatment', v)} />
      </Field>
      <Field>
        <TextField label="Prescription" value={form.prescription || ''} onChange={(v) => set('prescription', v)} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field>
          <TextField label="BP" value={form.vitals?.bp || ''} onChange={(v) => set('bp', v)} />
        </Field>
        <Field>
          <TextField label="HR (bpm)" type="number" value={String(form.vitals?.hr ?? '')} onChange={(v) => set('hr', Number(v))} />
        </Field>
        <Field>
          <TextField label="Temp (°C)" type="number" value={String(form.vitals?.temp ?? '')} onChange={(v) => set('temp', Number(v))} />
        </Field>
        <Field>
          <TextField label="Weight (kg)" type="number" value={String(form.vitals?.weight ?? '')} onChange={(v) => set('weight', Number(v))} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn" disabled={busy} onClick={submit}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button className="btn secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
