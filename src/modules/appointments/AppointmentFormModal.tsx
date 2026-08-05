import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, Select, Field } from '../../components/Form';
import { appointmentsApi } from '../../api/appointments';
import { patientsApi } from '../../api/patients';
import { doctorsApi } from '../../api/doctors';
import { useToast } from '../../context/ToastContext';
import type { Appointment, Patient, Doctor } from '../../types';

const toLocalInput = (iso: string) => {
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

export function AppointmentFormModal({
  appointment,
  onClose,
  onSaved,
}: {
  appointment?: Appointment | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Partial<Appointment>>(
    appointment || { status: 'scheduled', scheduled_at: '' }
  );
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof Appointment, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    patientsApi.list().then((r) => setPatients(r.items)).catch(() => {});
    doctorsApi.list().then((r) => setDoctors(r.items)).catch(() => {});
    if (appointment) setForm({ ...appointment, scheduled_at: toLocalInput(appointment.scheduled_at) as any });
  }, [appointment]);

  const submit = async () => {
    if (!form.patient_id || !form.doctor_id || !form.scheduled_at) {
      toast('Patient, doctor, and time are required', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, scheduled_at: new Date(form.scheduled_at!).toISOString() };
      if (appointment) await appointmentsApi.update(appointment.id, payload);
      else await appointmentsApi.create(payload);
      toast('Appointment saved', 'success');
      onSaved();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={appointment ? 'Edit Appointment' : 'New Appointment'} onClose={onClose}>
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
          options={doctors.map((d) => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
        />
      </Field>
      <Field>
        <TextField
          label="Scheduled at"
          type="datetime-local"
          value={form.scheduled_at || ''}
          onChange={(v) => set('scheduled_at', v as any)}
        />
      </Field>
      <Field>
        <TextField label="Reason" value={form.reason || ''} onChange={(v) => set('reason', v)} />
      </Field>
      <Field>
        <Select
          label="Status"
          value={form.status || 'scheduled'}
          onChange={(v) => set('status', v as any)}
          options={[
            ['scheduled', 'Scheduled'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
            ['no_show', 'No-show'],
          ].map(([v, l]) => ({ value: v, label: l }))}
        />
      </Field>
      <Field>
        <TextField label="Notes" value={form.notes || ''} onChange={(v) => set('notes', v)} />
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
