import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError } from '../lib/http.js';

const ALLOW = requireRole(['admin', 'doctor', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');
  if (req.method !== 'GET') return sendError(res, 405, 'METHOD', 'Use GET');

  try {
    const [p, a, b, todayA] = await Promise.all([
      query('SELECT COUNT(*) AS c FROM patients'),
      query('SELECT COUNT(*) AS c FROM appointments WHERE status = ?', ['scheduled']),
      query(
        "SELECT COALESCE(SUM(total_cents - paid_amount_cents), 0) AS c FROM bills WHERE status IN (?, ?)",
        ['unpaid', 'partial']
      ),
      query(
        "SELECT COUNT(*) AS c FROM appointments WHERE date(scheduled_at) = date('now')",
        []
      ),
    ]);

    return sendJson(res, 200, {
      patient_count: (p.rows[0] as any)?.c || 0,
      upcoming_appointments: (a.rows[0] as any)?.c || 0,
      pending_bills_cents: (b.rows[0] as any)?.c || 0,
      todays_appointments: (todayA.rows[0] as any)?.c || 0,
    });
  } catch (err: any) {
    return sendError(res, 500, 'SERVER', err.message);
  }
}
