import type { VercelRequest, VercelResponse } from '@vercel/node';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorBody(code: string, message: string) {
  return { error: { code, message } };
}

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}

export function sendError(res: VercelResponse, status: number, code: string, message: string): void {
  sendJson(res, status, errorBody(code, message));
}

export async function parseBody(req: VercelRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new ApiError(400, 'VALIDATION', 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}
