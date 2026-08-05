import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
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
        const r = await query<Doctor>('SELECT * FROM doctors WHERE id = ?', [id]);
        if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Doctor not found');
        return sendJson(res, 200, r.rows[0]);
      }
      const r = await query<Doctor>('SELECT * FROM doctors ORDER BY name');
      return sendJson(res, 200, { items: r.rows });
    }
    if (req.method === 'POST') {
      if (auth.role === 'receptionist' || auth.role === 'doctor')
        return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const b: any = await parseBody(req);
      const id = randomUUID();
      await query(
        `INSERT INTO doctors (id, name, specialization, email, phone, consultation_fee_cents, available_days) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, b.name, b.specialization, b.email, b.phone, b.consultation_fee_cents || 0, b.available_days || '']
      );
      const r = await query<Doctor>('SELECT * FROM doctors WHERE id = ?', [id]);
      return sendJson(res, 201, r.rows[0]);
    }
    if (req.method === 'PUT') {
      if (auth.role !== 'admin') return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const id = req.query.id as string;
      const b: any = await parseBody(req);
      await query(
        `UPDATE doctors SET name = ?, specialization = ?, email = ?, phone = ?, consultation_fee_cents = ?, available_days = ? WHERE id = ?`,
        [
          b.name,
          b.specialization,
          b.email,
          b.phone,
          b.consultation_fee_cents,
          b.available_days,
          id,
        ]
      );
      const r = await query<Doctor>('SELECT * FROM doctors WHERE id = ?', [id]);
      if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Doctor not found');
      return sendJson(res, 200, r.rows[0]);
    }
    if (req.method === 'DELETE') {
      if (auth.role !== 'admin') return sendError(res, 403, 'FORBIDDEN', 'Admin only');
      const id = req.query.id as string;
      await query('DELETE FROM doctors WHERE id = ?', [id]);
      return sendJson(res, 200, { ok: true });
    }
    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
