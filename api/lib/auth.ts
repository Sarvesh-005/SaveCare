import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';
import type { Role } from '../../src/types/index.js';

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8h
const COOKIE_NAME = 'care_save_token';

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export function signToken(payload: { userId: string; role: Role }): string {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyToken(token: string | null | undefined): { userId: string; role: Role } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string; role: Role };
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromReq(req: VercelRequest): string | null {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export function verifyAuth(req: VercelRequest): { userId: string; role: Role } | null {
  return verifyToken(getTokenFromReq(req));
}

export type AuthUser = { userId: string; role: Role };

export function requireRole(roles: Role[]): (user: AuthUser | null) => boolean {
  return (user) => !!user && roles.includes(user.role);
}

export function cookieName(): string {
  return COOKIE_NAME;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
