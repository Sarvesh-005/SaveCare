### Task 10: Patients fetch client + shared UI components

**Files:**
- Create: `src/api/patients.ts`, `src/components/DataTable.tsx`, `src/components/Modal.tsx`, `src/components/Form.tsx`

**Interfaces:**
- Produces:
  - `patientsApi.list(search, page)`, `.get(id)`, `.create(data)`, `.update(id, data)`, `.remove(id)`
  - `DataTable` component
  - `Modal` component
  - `TextField`, `Select`, `MoneyInput`, `ChipSelect` form primitives

- [ ] **Step 1: Create `src/api/patients.ts`**

```ts
import { apiFetch } from './client';
import type { Patient } from '../types';

export const patientsApi = {
  list: (search = '', page = 1) =>
    apiFetch(`/api/patients?search=${encodeURIComponent(search)}&page=${page}`) as Promise<{ items: Patient[]; page: number; limit: number }>,
  get: (id: string) => apiFetch(`/api/patients/${id}`) as Promise<Patient>,
  create: (data: Partial<Patient>) => apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) }) as Promise<Patient>,
  update: (id: string, data: Partial<Patient>) => apiFetch(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Patient>,
  remove: (id: string) => apiFetch(`/api/patients/${id}`, { method: 'DELETE' }),
};
```

Note: `GET /api/patients/:id` isn't in Task 9's handler (it handles query params). To support `patientsApi.get`, add an `id` query branch in Task 9's GET — **revision**: Task 9 GET already accepts `?id=`. Update `patientsApi.get`:

```ts
get: (id: string) => apiFetch(`/api/patients?id=${id}`) as Promise<Patient>,
```

And add to Task 9 GET handler, before the list branch:

```ts
const id = req.query.id as string | undefined;
if (id) {
  const r = await query<Patient>('SELECT * FROM patients WHERE id=$1', [id]);
  if (r.rowCount === 0) return sendError(res, 404, 'NOT_FOUND', 'Patient not found');
  return sendJson(res, 200, r.rows[0]);
}
```

(Apply this edit to `api/patients/index.ts`.)

- [ ] **Step 2: Create `src/components/DataTable.tsx`**

```tsx
interface Column<T> { key: keyof T | string; header: string; render?: (row: T) => React.ReactNode; }
interface Props<T> { columns: Column<T>[]; rows: T[]; loading?: boolean; onRowClick?: (row: T) => void; emptyLabel?: string; }

export function DataTable<T extends { id: string }>({ columns, rows, loading, onRowClick, emptyLabel = 'No records' }: Props<T>) {
  if (loading) return <div className="card">Loading…</div>;
  if (rows.length === 0) return <div className="card" style={{ color: 'var(--text-muted)' }}>{emptyLabel}</div>;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
            {columns.map((c) => <th key={String(c.key)} style={{ padding: 12, fontSize: 12, color: 'var(--text-muted)' }}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onRowClick?.(row)} style={{ borderTop: '1px solid var(--border)', cursor: onRowClick ? 'pointer' : 'default' }}>
              {columns.map((c) => <td key={String(c.key)} style={{ padding: 12 }}>{c.render ? c.render(row) : String((row as any)[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/Modal.tsx`**

```tsx
import { ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
      <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: 480, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn secondary" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/Form.tsx`**

```tsx
import { ReactNode } from 'react';

export function TextField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <div>
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function MoneyInput({ label, cents, onChange }: { label: string; cents: number; onChange: (cents: number) => void; }) {
  return (
    <div>
      <label>{label}</label>
      <input type="number" min={0} step="0.01" value={(cents / 100).toFixed(2)} onChange={(e) => onChange(Math.round(parseFloat(e.target.value || '0') * 100))} />
    </div>
  );
}

export function ChipSelect({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (item: string) => void; }) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onToggle(o)} className="btn" style={{ background: selected.includes(o) ? 'var(--teal)' : 'transparent', color: selected.includes(o) ? '#fff' : 'var(--text)', border: '1px solid var(--border)', padding: '4px 10px', fontSize: 12 }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <div style={{ marginBottom: 8 }}>{children}</div>;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/api/patients.ts src/components/DataTable.tsx src/components/Modal.tsx src/components/Form.tsx api/patients/index.ts && git commit -m "feat(patients): fetch client + shared UI primitives"
```

---

