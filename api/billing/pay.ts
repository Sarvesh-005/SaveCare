import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';

const ALLOW = requireRole(['admin', 'receptionist']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');
  if (req.method !== 'POST') return sendError(res, 405, 'METHOD', 'Use POST');

  const id = req.query.id as string;
  if (!id) throw new ApiError(400, 'VALIDATION', 'id required');

  try {
    const b: any = await parseBody(req);
    const paidAmount = Number(b.paid_amount_cents) || 0;

    const existing = await query('SELECT total_cents, paid_amount_cents, status FROM bills WHERE id = ?', [id]);
    if (existing.rows.length === 0)
      return sendError(res, 404, 'NOT_FOUND', 'Bill not found');

    const bill = existing.rows[0] as any;
    const newPaid = bill.paid_amount_cents + paidAmount;
    let status: string;

    if (newPaid >= bill.total_cents) status = 'paid';
    else if (newPaid > 0) status = 'partial';
    else status = 'unpaid';

    await query(
      'UPDATE bills SET paid_amount_cents = ?, status = ?, paid_at = datetime("now"), method = ? WHERE id = ?',
      [newPaid, status, b.method || 'cash', id]
    );

    const r = await query('SELECT * FROM bills WHERE id = ?', [id]);
    return sendJson(res, 200, r.rows[0]);
  } catch (err: any) {
    if (err instanceof ApiError) return sendError(res, err.status, err.code, err.message);
    return sendError(res, 500, 'SERVER', err.message);
  }
}
