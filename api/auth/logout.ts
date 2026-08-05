import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cookieName, isProduction } from '../lib/auth.js';
import { sendJson } from '../lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST')
    return sendJson(res, 405, { error: { code: 'METHOD', message: 'Use POST' } });
  res.setHeader(
    'Set-Cookie',
    `${cookieName()}=; HttpOnly; SameSite=Lax${isProduction() ? '; Secure' : ''}; Path=/; Max-Age=0`
  );
  return sendJson(res, 200, { ok: true });
}
