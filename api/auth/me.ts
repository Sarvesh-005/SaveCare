import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth } from '../lib/auth.js';
import { sendJson, sendError } from '../lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return sendError(res, 405, 'METHOD', 'Use GET');

  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');

  try {
    const result = await query('SELECT id, email, role, name FROM users WHERE id = ?', [auth.userId]);
    if (result.rows.length === 0) return sendError(res, 401, 'UNAUTHENTICATED', 'User not found');

    const u = result.rows[0] as any;
    return sendJson(res, 200, { id: u.id, email: u.email, role: u.role, name: u.name });
  } catch (err: any) {
    return sendError(res, 500, 'SERVER', err.message);
  }
}
