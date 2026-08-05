import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import type { MedicalRecord } from '../../src/types/index.js';

const ALLOW = requireRole(['admin', 'doctor', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');

  try {
    if (req.method === 'GET') {
      const patientId = req.query.patient_id as string | undefined;
      let sql = `SELECT m.*, p.name AS patient_name, d.name AS doctor_name
                 FROM medical_records m 
                 JOIN patients p ON p.id = m.patient_id 
                 JOIN doctors d ON d.id = m.doctor_id`;
      const params: any[] = [];
      
      if (patientId) {
        sql += ' WHERE m.patient_id = ?';
        params.push(patientId);
      }
      
      sql += ' ORDER BY m.visit_date DESC';
      
      const r = await query(sql, params);
      return sendJson(res, 200, { items: r.rows });
    }
    
    if (req.method === 'POST') {
      if (auth.role === 'receptionist') 
        return sendError(res, 403, 'FORBIDDEN', 'Receptionists are read-only for records');
      
      const b: any = await parseBody(req);
      if (!b.patient_id || !b.doctor_id)
        throw new ApiError(400, 'VALIDATION', 'patient_id and doctor_id required');
      
      const id = randomUUID();
      await query(
        `INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, visit_date, chief_complaint, diagnosis, treatment, prescription, vitals, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.patient_id,
          b.doctor_id,
          b.appointment_id || null,
          b.visit_date || new Date().toISOString(),
          b.chief_complaint,
          b.diagnosis,
          b.treatment,
          b.prescription,
          JSON.stringify(b.vitals || {}),
          auth.userId,
        ]
      );
      
      const r = await query<MedicalRecord>('SELECT * FROM medical_records WHERE id = ?', [id]);
      return sendJson(res, 201, r.rows[0]);
    }
    
    if (req.method === 'PUT') {
      if (auth.role === 'receptionist')
        return sendError(res, 403, 'FORBIDDEN', 'Receptionists are read-only for records');
      
      const id = req.query.id as string;
      const b: any = await parseBody(req);
      
      await query(
        `UPDATE medical_records SET patient_id = ?, doctor_id = ?, visit_date = ?, chief_complaint = ?, diagnosis = ?, treatment = ?, prescription = ?, vitals = ? 
         WHERE id = ?`,
        [b.patient_id, b.doctor_id, b.visit_date, b.chief_complaint, b.diagnosis, b.treatment, b.prescription, JSON.stringify(b.vitals || {}), id]
      );
      
      const r = await query<MedicalRecord>('SELECT * FROM medical_records WHERE id = ?', [id]);
      if (r.rows.length === 0) return sendError(res, 404, 'NOT_FOUND', 'Record not found');
      return sendJson(res, 200, r.rows[0]);
    }
    
    return sendError(res, 405, 'METHOD', 'Method not allowed');
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
