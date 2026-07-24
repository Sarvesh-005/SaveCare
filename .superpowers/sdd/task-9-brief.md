### Task 9: Patients API

**Files:**
- Create: `api/patients/index.ts`

**Interfaces:**
- Consumes: `query()`, `verifyAuth`, `requireRole`, `sendJson`, `sendError`, `parseBody`, `ApiError`.
- Produces: `GET/POST/PUT/DELETE /api/patients` (with `?search=&page=`). Admin/doctor/receptionist allowed.

- [ ] **Step 1: Create `api/patients/index.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import type { Patient } from '../../src/types/index.js';

const ALLOW = requireRole(['admin', 'doctor', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');

  try {
    if (req.method === 'GET') {
      const search = (req.query.search as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = 20;
      const offset = (page - 1) * limit;
      const like = `%${search}%`;
      const where = search ? 'WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1' : '';
      const params = search ? [like, limit, offset] : [limit, offset];
      const rows = await query<Patient>(
        `SELECT * FROM patients ${where} ORDER BY created_at DESC LIMIT $${search ? 2 : 1} OFFSET $${search ? 3 : 2}`,
        params
      );
      return sendJson(res, 200, { items: rows.rows, page, limit });
    }

    if (req.method === 'POST') {
      const b: any = await parseBody(req);
      if (!b.name) throw new ApiError(400, 'VALIDATION', 'name required');
      const r = await query<Patient>(
        `INSERT INTO patients (name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [b.name, b.date_of_birth, b.gender, b.phone, b.email, b.address, b.blood_group, b.allergies, b.emergency_contact, auth.userId]
      );
      return sendJson(res, 201, r.rows[0]);
    }

    if (req.method === 'PUT') {
      const id = (req.query.id as string);
      if (!id) throw new ApiError(400, 'VALIDATION', 'id required');
      const b: any = await parseBody(req);
      const r = await query<Patient>(
        `UPDATE patients SET name=$1, date_of_birth=$2, gender=$3, phone=$4, email=$5, address=$6, blood_group=$7, allergies=$8, emergency_contact=$9
         WHERE id=$10 RETURNING *`,
        [b.name, b.date_of_birth, b.gender, b.phone, b.email, b.address, b.blood_group, b.allergies, b.emergency_contact, id]
      );
      if (r.rowCount === 0) return sendError(res, 404, 'NOT_FOUND', 'Patient not found');
      return sendJson(res, 200, r.rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = (req.query.id as string);
      if (!id) throw new ApiError(400, 'VALIDATION', 'id required');
      // Receptionist/admin can delete; doctors cannot (write-protect via role matrix for doctors on patients).
      if (auth.role === 'doctor') return sendError(res, 403, 'FORBIDDEN', 'Doctors cannot delete patients');
      await query('DELETE FROM patients WHERE id=$1', [id]);
      return sendJson(res, 200, { ok: true });
    }

    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
```

- [ ] **Step 2: Manual smoke**

With `vercel dev` running: `curl "http://localhost:3000/api/patients" -H "Cookie: <cookie from login>"` → 200 `{ items: [...] }`.

- [ ] **Step 3: Commit**

```bash
git add api/patients && git commit -m "feat(patients): CRUD api with search"
```

---

