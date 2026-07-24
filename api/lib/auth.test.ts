import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken, requireRole } from './auth.js';
import type { Role } from '../../src/types/index.js';

describe('password hashing', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
    expect(await comparePassword('secret', hash)).toBe(true);
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});

describe('jwt', () => {
  beforeEach(() => { vi.stubEnv('JWT_SECRET', 'test-secret'); });

  it('signs and verifies a token', () => {
    const token = signToken({ userId: 'u1', role: 'admin' });
    const payload = verifyToken(token);
    expect(payload).toMatchObject({ userId: 'u1', role: 'admin' });
  });

  it('returns null for an invalid token', () => {
    expect(verifyToken('garbage')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(verifyToken(null)).toBeNull();
    expect(verifyToken(undefined)).toBeNull();
  });
});

describe('requireRole', () => {
  const allow = requireRole(['admin', 'doctor'] as Role[]);
  it('allows matching role', () => {
    expect(allow({ userId: 'u', role: 'doctor' })).toBe(true);
  });
  it('denies non-matching role', () => {
    expect(allow({ userId: 'u', role: 'receptionist' })).toBe(false);
  });
  it('denies null user', () => {
    expect(allow(null)).toBe(false);
  });
});
