### Task 11: Patients UI (list, form modal, detail)

**Files:**
- Create: `src/modules/patients/PatientsList.tsx`, `src/modules/patients/PatientFormModal.tsx`, `src/modules/patients/PatientDetail.tsx`, `src/lib/date.ts`
- Modify: `src/App.tsx` (add routes)

**Interfaces:**
- Produces: `/patients` list page, `/patients/new` and `/patients/:id/edit` via modal, `/patients/:id` detail page.

- [ ] **Step 1: Create `src/lib/date.ts`**

```ts
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
```

- [ ] **Step 2: Create `src/modules/patients/PatientFormModal.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, Select, Field } from '../../components/Form';
import { patientsApi } from '../../api/patients';
import { useToast } from '../../context/ToastContext';
import type { Patient } from '../../types';

const empty: Partial<Patient> = { name: '', gender: 'male', blood_group: 'O+', allergies: '' };

export function PatientFormModal({ patient, onClose, onSaved }: { patient?: Patient | null; onClose: () => void; onSaved: () => void; }) {
  const [form, setForm] = useState<Partial<Patient>>(patient || empty);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof Patient, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { setForm(patient || empty); }, [patient]);

  const submit = async () => {
    setBusy(true);
    try {
      if (patient) await patientsApi.update(patient.id, form);
      else await patientsApi.create(form);
      toast('Patient saved', 'success');
      onSaved();
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={patient ? 'Edit Patient' : 'New Patient'} onClose={onClose}>
      <Field><TextField label="Name" value={form.name || ''} onChange={(v) => set('name', v)} /></Field>
      <Field><TextField label="Date of birth" type="date" value={form.date_of_birth || ''} onChange={(v) => set('date_of_birth', v)} /></Field>
      <Field><Select label="Gender" value={form.gender || 'male'} onChange={(v) => set('gender', v)} options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} /></Field>
      <Field><TextField label="Phone" value={form.phone || ''} onChange={(v) => set('phone', v)} /></Field>
      <Field><TextField label="Email" value={form.email || ''} onChange={(v) => set('email', v)} /></Field>
      <Field><TextField label="Address" value={form.address || ''} onChange={(v) => set('address', v)} /></Field>
      <Field><Select label="Blood group" value={form.blood_group || 'O+'} onChange={(v) => set('blood_group', v)} options={['O+','O-','A+','A-','B+','B-','AB+','AB-'].map((b)=>({value:b,label:b}))} /></Field>
      <Field><TextField label="Allergies" value={form.allergies || ''} onChange={(v) => set('allergies', v)} /></Field>
      <Field><TextField label="Emergency contact" value={form.emergency_contact || ''} onChange={(v) => set('emergency_contact', v)} /></Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create `src/modules/patients/PatientsList.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { patientsApi } from '../../api/patients';
import { formatDate } from '../../lib/date';
import { useAuth } from '../../context/AuthContext';
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
    try { const r = await patientsApi.list(search); setItems(r.items); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Patients</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} />
          {canCreate && <button className="btn" onClick={() => setShowForm(true)}>+ New patient</button>}
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
        <PatientFormModalInline onSaved={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

// Inline import to avoid circular: form modal lives in same folder.
import { PatientFormModal } from './PatientFormModal';
function PatientFormModalInline(props: { onSaved: () => void; onClose: () => void }) {
  return <PatientFormModal {...props} />;
}
```

- [ ] **Step 4: Create `src/modules/patients/PatientDetail.tsx`**

```tsx
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
    try { setPatient(await patientsApi.get(id)); }
    catch (e: any) { toast(e.message, 'error'); }
  };
  useEffect(() => { load(); }, [id]);

  if (!patient) return <div className="card">Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{patient.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => navigate('/patients')}>Back</button>
          <button className="btn" onClick={() => setShowForm(true)}>Edit</button>
        </div>
      </div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><strong>DOB:</strong> {formatDate(patient.date_of_birth)}</div>
        <div><strong>Gender:</strong> {patient.gender}</div>
        <div><strong>Phone:</strong> {patient.phone || '—'}</div>
        <div><strong>Email:</strong> {patient.email || '—'}</div>
        <div><strong>Blood:</strong> {patient.blood_group || '—'}</div>
        <div><strong>Allergies:</strong> {patient.allergies || 'None'}</div>
        <div><strong>Address:</strong> {patient.address || '—'}</div>
        <div><strong>Emergency:</strong> {patient.emergency_contact || '—'}</div>
      </div>
      {showForm && <PatientFormModal patient={patient} onSaved={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
}
```

- [ ] **Step 5: Wire routes in `src/App.tsx`**

Replace the `<Route path="/" ...>` block's parent and add patient routes inside the Protected Layout group:

```tsx
import { PatientsList } from './modules/patients/PatientsList';
import { PatientDetail } from './modules/patients/PatientDetail';
// inside <Route element={<Protected><Layout /></Protected>}>
<Route path="/patients" element={<PatientsList />} />
<Route path="/patients/:id" element={<PatientDetail />} />
```

- [ ] **Step 6: Verify**

Run dev, log in, navigate to Patients, search, open a patient, edit, save.
Expected: list loads, search debounced, detail renders, edit persists.

- [ ] **Step 7: Commit**

```bash
git add src/modules/patients src/lib/date.ts src/App.tsx && git commit -m "feat(patients): list, detail, form modal UI"
```

---

## Phase 2 — Doctors + Appointments

