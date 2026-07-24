### Task 12: Doctors API + UI

**Files:**
- Create: `api/doctors/index.ts`, `src/api/doctors.ts`, `src/modules/doctors/DoctorsList.tsx`, `src/modules/doctors/DoctorFormModal.tsx`, `src/modules/doctors/DoctorDetail.tsx`
- Modify: `src/App.tsx` (routes)

**Interfaces:**
- Produces: `GET/POST/PUT/DELETE /api/doctors`; `doctorsApi`; `/doctors` list + detail.

- [ ] **Step 1: Create `api/doctors/index.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import type { Doctor } from '../../src/types/index.js';

const ALLOW = requireRole(['admin', 'doctor', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');

  try {
    if (req.method === 'GET') {
      const id = req.query.id as string | undefined;
      if (id) {
        const r = await query<Doctor>('SELECT * FROM doctors WHERE id=$1', [id]);
        if (r.rowCount === 0) return sendError(res, 404, 'NOT_FOUND', 'Doctor not found');
        return sendJson(res, 200, r.rows[0]);
      }
      const r = await query<Doctor>('SELECT * FROM doctors ORDER BY name');
      return sendJson(res, 200, { items: r.rows });
    }
    if (req.method === 'POST') {
      if (auth.role === 'receptionist' || auth.role === 'doctor') return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const b: any = await parseBody(req);
      const r = await query<Doctor>(
        `INSERT INTO doctors (name, specialization, email, phone, consultation_fee_cents, available_days) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [b.name, b.specialization, b.email, b.phone, b.consultation_fee_cents || 0, b.available_days || '']
      );
      return sendJson(res, 201, r.rows[0]);
    }
    if (req.method === 'PUT') {
      if (auth.role !== 'admin') return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const id = req.query.id as string;
      const b: any = await parseBody(req);
      const r = await query<Doctor>(
        `UPDATE doctors SET name=$1, specialization=$2, email=$3, phone=$4, consultation_fee_cents=$5, available_days=$6 WHERE id=$7 RETURNING *`,
        [b.name, b.specialization, b.email, b.phone, b.consultation_fee_cents, b.available_days, id]
      );
      if (r.rowCount === 0) return sendError(res, 404, 'NOT_FOUND', 'Doctor not found');
      return sendJson(res, 200, r.rows[0]);
    }
    if (req.method === 'DELETE') {
      if (auth.role !== 'admin') return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const id = req.query.id as string;
      await query('DELETE FROM doctors WHERE id=$1', [id]);
      return sendJson(res, 200, { ok: true });
    }
    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
```

- [ ] **Step 2: Create `src/api/doctors.ts`**

```ts
import { apiFetch } from './client';
import type { Doctor } from '../types';

export const doctorsApi = {
  list: () => apiFetch('/api/doctors') as Promise<{ items: Doctor[] }>,
  get: (id: string) => apiFetch(`/api/doctors?id=${id}`) as Promise<Doctor>,
  create: (data: Partial<Doctor>) => apiFetch('/api/doctors', { method: 'POST', body: JSON.stringify(data) }) as Promise<Doctor>,
  update: (id: string, data: Partial<Doctor>) => apiFetch(`/api/doctors?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Doctor>,
  remove: (id: string) => apiFetch(`/api/doctors?id=${id}`, { method: 'DELETE' }),
};
```

- [ ] **Step 3: Create `src/modules/doctors/DoctorFormModal.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { TextField, MoneyInput, Field } from '../../components/Form';
import { doctorsApi } from '../../api/doctors';
import { useToast } from '../../context/ToastContext';
import type { Doctor } from '../../types';

const empty: Partial<Doctor> = { name: '', specialization: '', consultation_fee_cents: 0, available_days: 'Mon,Tue,Wed,Thu,Fri' };

export function DoctorFormModal({ doctor, onClose, onSaved }: { doctor?: Doctor | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Doctor>>(doctor || empty);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof Doctor, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => { setForm(doctor || empty); }, [doctor]);

  const submit = async () => {
    setBusy(true);
    try {
      if (doctor) await doctorsApi.update(doctor.id, form);
      else await doctorsApi.create(form);
      toast('Doctor saved', 'success');
      onSaved();
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={doctor ? 'Edit Doctor' : 'New Doctor'} onClose={onClose}>
      <Field><TextField label="Name" value={form.name || ''} onChange={(v) => set('name', v)} /></Field>
      <Field><TextField label="Specialization" value={form.specialization || ''} onChange={(v) => set('specialization', v)} /></Field>
      <Field><TextField label="Email" value={form.email || ''} onChange={(v) => set('email', v)} /></Field>
      <Field><TextField label="Phone" value={form.phone || ''} onChange={(v) => set('phone', v)} /></Field>
      <Field><MoneyInput label="Consultation fee" cents={form.consultation_fee_cents || 0} onChange={(c) => set('consultation_fee_cents', c)} /></Field>
      <Field><TextField label="Available days" value={form.available_days || ''} onChange={(v) => set('available_days', v)} /></Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save'}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Create `src/modules/doctors/DoctorsList.tsx`**

```tsx
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

  const load = async () => { setLoading(true); try { const r = await doctorsApi.list(); setItems(r.items); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Doctors</h1>
        {isAdmin && <button className="btn" onClick={() => setShowForm(true)}>+ New doctor</button>}
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
      {showForm && <DoctorFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/modules/doctors/DoctorDetail.tsx`**

```tsx
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

  useEffect(() => { if (id) doctorsApi.get(id).then(setDoctor).catch((e) => toast(e.message, 'error')); }, [id]);
  if (!doctor) return <div className="card">Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{doctor.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => navigate('/doctors')}>Back</button>
          {user?.role === 'admin' && <button className="btn" onClick={() => setShowForm(true)}>Edit</button>}
        </div>
      </div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><strong>Specialization:</strong> {doctor.specialization}</div>
        <div><strong>Email:</strong> {doctor.email || '—'}</div>
        <div><strong>Phone:</strong> {doctor.phone || '—'}</div>
        <div><strong>Fee:</strong> ${(doctor.consultation_fee_cents / 100).toFixed(2)}</div>
        <div><strong>Available:</strong> {doctor.available_days || '—'}</div>
      </div>
      {showForm && <DoctorFormModal doctor={doctor} onSaved={() => { setShowForm(false); if (id) doctorsApi.get(id).then(setDoctor); }} onClose={() => setShowForm(false)} />}
    </div>
  );
}
```

- [ ] **Step 6: Wire routes in `src/App.tsx`**

```tsx
import { DoctorsList } from './modules/doctors/DoctorsList';
import { DoctorDetail } from './modules/doctors/DoctorDetail';
// add inside the Layout group:
<Route path="/doctors" element={<DoctorsList />} />
<Route path="/doctors/:id" element={<DoctorDetail />} />
```

- [ ] **Step 7: Verify + commit**

```bash
git add api/doctors src/api/doctors.ts src/modules/doctors src/App.tsx && git commit -m "feat(doctors): CRUD api + list/detail/form UI"
```

---

