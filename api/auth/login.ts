import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { comparePassword, signToken, cookieName, isProduction } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import type { Role } from '../../src/types/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendError(res, 405, 'METHOD', 'Use POST');

  let body: any;
  try {
    body = await parseBody(req);
  } catch (e: any) {
    return sendError(res, (e as ApiError).status, (e as ApiError).code, e.message);
  }

  const email = body?.email;
  const password = body?.password;
  if (!email || !password) return sendError(res, 400, 'VALIDATION', 'email and password required');

  try {
    const result = await query('SELECT id, email, password_hash, role, name FROM users WHERE email = ?', [
      email,
    ]);
    if (result.rows.length === 0) return sendError(res, 401, 'UNAUTHENTICATED', 'Invalid credentials');

    const user = result.rows[0] as any;
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return sendError(res, 401, 'UNAUTHENTICATED', 'Invalid credentials');

    const token = signToken({ userId: user.id, role: user.role as Role });
    res.setHeader(
      'Set-Cookie',
      `${cookieName()}=${token}; HttpOnly; SameSite=Lax${isProduction() ? '; Secure' : ''}; Path=/; Max-Age=28800`
    );
    return sendJson(res, 200, { id: user.id, email: user.email, role: user.role, name: user.name });
  } catch (err: any) {
    return sendError(res, 500, 'SERVER', err.message);
  }
}
