import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, requireRole } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import { matchSymptoms } from './matcher.js';

const ALLOW = requireRole(['admin', 'doctor']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  if (!ALLOW(auth)) return sendError(res, 403, 'FORBIDDEN', 'Insufficient role');
  if (req.method !== 'POST') return sendError(res, 405, 'METHOD', 'Use POST');

  try {
    const b: any = await parseBody(req);
    if (!Array.isArray(b.symptoms))
      throw new ApiError(400, 'VALIDATION', 'symptoms[] required');
    return sendJson(res, 200, matchSymptoms(b.symptoms));
  } catch (e: any) {
    if (e instanceof ApiError) return sendError(res, e.status, e.code, e.message);
    return sendError(res, 500, 'SERVER', e.message);
  }
}
