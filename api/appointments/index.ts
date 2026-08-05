import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import { hasConflict } from './conflict.js';
import type { Appointment } from '../../src/types/index.js';

const ALLOW = requireRole(['admin', 'doctor', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');

  try {
    if (req.method === 'GET') {
      const id = req.query.id as string | undefined;
      if (id) {
        const r = await query<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]);
        if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Appointment not found');
        return sendJson(res, 200, r.rows[0]);
      }
      
      const doctorId = req.query.doctor_id as string | undefined;
      const date = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;
      
      let sql = `SELECT a.*, p.name AS patient_name, d.name AS doctor_name
                 FROM appointments a 
                 JOIN patients p ON p.id = a.patient_id 
                 JOIN doctors d ON d.id = a.doctor_id WHERE 1=1`;
      const params: any[] = [];
      
      if (doctorId) {
        sql += ' AND a.doctor_id = ?';
        params.push(doctorId);
      }
      if (status) {
        sql += ' AND a.status = ?';
        params.push(status);
      }
      if (date) {
        sql += ' AND date(a.scheduled_at) = ?';
        params.push(date);
      }
      
      sql += ' ORDER BY a.scheduled_at DESC';
      
      const r = await query(sql, params);
      return sendJson(res, 200, { items: r.rows });
    }

    if (req.method === 'POST') {
      const b: any = await parseBody(req);
      if (!b.patient_id || !b.doctor_id || !b.scheduled_at)
        throw new ApiError(400, 'VALIDATION', 'patient_id, doctor_id, scheduled_at required');
      
      // Conflict check: existing active appts for this doctor within ±30 min.
      const existing = await query('SELECT scheduled_at, status FROM appointments WHERE doctor_id = ?', [
        b.doctor_id,
      ]);
      if (hasConflict(existing.rows as any, b.scheduled_at)) {
        return sendError(res, 409, 'CONFLICT', 'Doctor already has an appointment within 30 minutes of this time.');
      }
      
      const id = randomUUID();
      await query(
        `INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, reason, status, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, b.patient_id, b.doctor_id, b.scheduled_at, b.reason || '', b.status || 'scheduled', b.notes || '', auth.userId]
      );
      
      const r = await query<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]);
      return sendJson(res, 201, r.rows[0]);
    }

    if (req.method === 'PUT') {
      const id = req.query.id as string;
      const b: any = await parseBody(req);
      
      await query(
        `UPDATE appointments SET patient_id = ?, doctor_id = ?, scheduled_at = ?, reason = ?, status = ?, notes = ? WHERE id = ?`,
        [b.patient_id, b.doctor_id, b.scheduled_at, b.reason, b.status, b.notes, id]
      );
      
      const r = await query<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]);
      if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Appointment not found');
      return sendJson(res, 200, r.rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      await query('DELETE FROM appointments WHERE id = ?', [id]);
      return sendJson(res, 200, { ok: true });
    }

    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
