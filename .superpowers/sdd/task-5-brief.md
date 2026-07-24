### Task 5: Auth library (TDD)

**Files:**
- Create: `api/lib/auth.ts`, `api/lib/auth.test.ts`

**Interfaces:**
- Produces:
  - `hashPassword(pw: string): Promise<string>`
  - `comparePassword(pw: string, hash: string): Promise<boolean>`
  - `signToken(payload: { userId: string; role: Role }): string`
  - `verifyToken(token: string | null | undefined): { userId: string; role: Role } | null`
  - `getTokenFromReq(req: VercelRequest): string | null`
  - `verifyAuth(req: VercelRequest): { userId: string; role: Role } | null`
  - `requireRole(roles: Role[]): (user: { role: Role } | null) => boolean`

- [ ] **Step 1: Write the failing tests**

`api/lib/auth.test.ts`:

```ts
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
    expect(payload).toEqual({ userId: 'u1', role: 'admin' });
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- auth`
Expected: FAIL — module `./auth.js` not found / functions undefined.

- [ ] **Step 3: Write the implementation**

`api/lib/auth.ts`:

```ts
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

export function requireRole(roles: Role[]): (user: { role: Role } | null) => boolean {
  return (user) => !!user && roles.includes(user.role);
}

export function cookieName(): string {
  return COOKIE_NAME;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- auth`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add api/lib/auth.ts api/lib/auth.test.ts && git commit -m "feat(auth): password hashing, jwt, role gating + tests"
```

---

