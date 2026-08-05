import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import { sumItems } from './money.js';
import type { Bill } from '../../src/types/index.js';

const ALLOW = requireRole(['admin', 'receptionist', 'doctor']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');

  try {
    if (req.method === 'GET') {
      const id = req.query.id as string | undefined;
      if (id) {
        const r = await query(
          'SELECT b.*, p.name AS patient_name FROM bills b JOIN patients p ON p.id = b.patient_id WHERE b.id = ?',
          [id]
        );
        if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Bill not found');
        return sendJson(res, 200, r.rows[0]);
      }
      
      const patientId = req.query.patient_id as string | undefined;
      const status = req.query.status as string | undefined;
      
      let sql = 'SELECT b.*, p.name AS patient_name FROM bills b JOIN patients p ON p.id = b.patient_id WHERE 1=1';
      const params: any[] = [];
      
      if (patientId) {
        sql += ' AND b.patient_id = ?';
        params.push(patientId);
      }
      if (status) {
        sql += ' AND b.status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY b.created_at DESC';
      
      const r = await query(sql, params);
      return sendJson(res, 200, { items: r.rows });
    }

    if (req.method === 'POST') {
      if (auth.role === 'doctor') return sendError(res, 403, 'FORBIDDEN', 'Doctors cannot create bills');
      const b: any = await parseBody(req);
      if (!b.patient_id) throw new ApiError(400, 'VALIDATION', 'patient_id required');
      
      const items = Array.isArray(b.items) ? b.items : [];
      const total = sumItems(items);
      const id = randomUUID();
      
      await query(
        `INSERT INTO bills (id, patient_id, appointment_id, doctor_id, items, total_cents, status, method, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, b.patient_id, b.appointment_id || null, b.doctor_id || null, JSON.stringify(items), total, 'unpaid', b.method || 'cash', auth.userId]
      );
      
      const r = await query<Bill>('SELECT * FROM bills WHERE id = ?', [id]);
      return sendJson(res, 201, r.rows[0]);
    }

    if (req.method === 'PUT') {
      if (auth.role === 'doctor') return sendError(res, 403, 'FORBIDDEN', 'Doctors cannot edit bills');
      const id = req.query.id as string;
      const b: any = await parseBody(req);
      const items = Array.isArray(b.items) ? b.items : [];
      const total = sumItems(items);
      
      await query(
        `UPDATE bills SET patient_id = ?, items = ?, total_cents = ?, method = ? WHERE id = ?`,
        [b.patient_id, JSON.stringify(items), total, b.method, id]
      );
      
      const r = await query<Bill>('SELECT * FROM bills WHERE id = ?', [id]);
      if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Bill not found');
      return sendJson(res, 200, r.rows[0]);
    }

    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
