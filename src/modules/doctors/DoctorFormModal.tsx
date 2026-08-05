import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, MoneyInput, Field } from '../../components/Form';
import { doctorsApi } from '../../api/doctors';
import { useToast } from '../../context/ToastContext';
import type { Doctor } from '../../types';

const empty: Partial<Doctor> = {
  name: '',
  specialization: '',
  consultation_fee_cents: 0,
  available_days: 'Mon,Tue,Wed,Thu,Fri',
};

export function DoctorFormModal({
  doctor,
  onClose,
  onSaved,
}: {
  doctor?: Doctor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Doctor>>(doctor || empty);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof Doctor, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    setForm(doctor || empty);
  }, [doctor]);

  const submit = async () => {
    setBusy(true);
    try {
      if (doctor) await doctorsApi.update(doctor.id, form);
      else await doctorsApi.create(form);
      toast('Doctor saved', 'success');
      onSaved();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={doctor ? 'Edit Doctor' : 'New Doctor'} onClose={onClose}>
      <Field>
        <TextField label="Name" value={form.name || ''} onChange={(v) => set('name', v)} />
      </Field>
      <Field>
        <TextField
          label="Specialization"
          value={form.specialization || ''}
          onChange={(v) => set('specialization', v)}
        />
      </Field>
      <Field>
        <TextField label="Email" value={form.email || ''} onChange={(v) => set('email', v)} />
      </Field>
      <Field>
        <TextField label="Phone" value={form.phone || ''} onChange={(v) => set('phone', v)} />
      </Field>
      <Field>
        <MoneyInput
          label="Consultation fee"
          cents={form.consultation_fee_cents || 0}
          onChange={(c) => set('consultation_fee_cents', c)}
        />
      </Field>
      <Field>
        <TextField
          label="Available days"
          value={form.available_days || ''}
          onChange={(v) => set('available_days', v)}
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
