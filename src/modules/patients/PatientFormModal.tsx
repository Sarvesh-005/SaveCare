import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, Select, Field } from '../../components/Form';
import { patientsApi } from '../../api/patients';
import { useToast } from '../../context/ToastContext';
import type { Patient } from '../../types';

const empty: Partial<Patient> = { name: '', gender: 'male', blood_group: 'O+', allergies: '' };

export function PatientFormModal({
  patient,
  onClose,
  onSaved,
}: {
  patient?: Patient | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Patient>>(patient || empty);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof Patient, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setForm(patient || empty);
  }, [patient]);

  const submit = async () => {
    setBusy(true);
    try {
      if (patient) await patientsApi.update(patient.id, form);
      else await patientsApi.create(form);
      toast('Patient saved', 'success');
      onSaved();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={patient ? 'Edit Patient' : 'New Patient'} onClose={onClose}>
      <Field>
        <TextField label="Name" value={form.name || ''} onChange={(v) => set('name', v)} />
      </Field>
      <Field>
        <TextField
          label="Date of birth"
          type="date"
          value={form.date_of_birth || ''}
          onChange={(v) => set('date_of_birth', v)}
        />
      </Field>
      <Field>
        <Select
          label="Gender"
          value={form.gender || 'male'}
          onChange={(v) => set('gender', v as any)}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </Field>
      <Field>
        <TextField label="Phone" value={form.phone || ''} onChange={(v) => set('phone', v)} />
      </Field>
      <Field>
        <TextField label="Email" value={form.email || ''} onChange={(v) => set('email', v)} />
      </Field>
      <Field>
        <TextField label="Address" value={form.address || ''} onChange={(v) => set('address', v)} />
      </Field>
      <Field>
        <Select
          label="Blood group"
          value={form.blood_group || 'O+'}
          onChange={(v) => set('blood_group', v)}
          options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => ({
            value: b,
            label: b,
          }))}
        />
      </Field>
      <Field>
        <TextField label="Allergies" value={form.allergies || ''} onChange={(v) => set('allergies', v)} />
      </Field>
      <Field>
        <TextField
          label="Emergency contact"
          value={form.emergency_contact || ''}
          onChange={(v) => set('emergency_contact', v)}
        />
      </Field>
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
