import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
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
      // Check for id parameter first
      const id = req.query.id as string | undefined;
      if (id) {
        const r = await query<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
        if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Patient not found');
        return sendJson(res, 200, r.rows[0]);
      }

      // List with search
      const search = (req.query.search as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = 20;
      const offset = (page - 1) * limit;
      const like = `%${search}%`;
      let sql = 'SELECT * FROM patients';
      const params: any[] = [];
      
      if (search) {
        sql += ' WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?';
        params.push(like, like, like);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await query<Patient>(sql, params);
      return sendJson(res, 200, { items: rows.rows, page, limit });
    }

    if (req.method === 'POST') {
      const b: any = await parseBody(req);
      if (!b.name) throw new ApiError(400, 'VALIDATION', 'name required');
      
      const id = randomUUID();
      await query(
        `INSERT INTO patients (id, name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.name,
          b.date_of_birth || null,
          b.gender || 'male',
          b.phone || null,
          b.email || null,
          b.address || null,
          b.blood_group || null,
          b.allergies || null,
          b.emergency_contact || null,
          auth.userId,
        ]
      );
      
      const r = await query<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
      return sendJson(res, 201, r.rows[0]);
    }

    if (req.method === 'PUT') {
      const id = req.query.id as string;
      if (!id) throw new ApiError(400, 'VALIDATION', 'id required');
      const b: any = await parseBody(req);
      
      await query(
        `UPDATE patients SET name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ?, allergies = ?, emergency_contact = ?
         WHERE id = ?`,
        [
          b.name,
          b.date_of_birth,
          b.gender,
          b.phone,
          b.email,
          b.address,
          b.blood_group,
          b.allergies,
          b.emergency_contact,
          id,
        ]
      );
      
      const r = await query<Patient>('SELECT * FROM patients WHERE id = ?', [id]);
      if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Patient not found');
      return sendJson(res, 200, r.rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) throw new ApiError(400, 'VALIDATION', 'id required');
      // Receptionist/admin can delete; doctors cannot
      if (auth.role === 'doctor')
        return sendError(res, 403, 'FORBIDDEN', 'Doctors cannot delete patients');
      await query('DELETE FROM patients WHERE id = ?', [id]);
      return sendJson(res, 200, { ok: true });
    }

    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
