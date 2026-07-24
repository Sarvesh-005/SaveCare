### Task 7: Auth API (login / logout / me)

**Files:**
- Create: `api/auth/login.ts`, `api/auth/logout.ts`, `api/auth/me.ts`

**Interfaces:**
- Consumes: `query()` (db), `comparePassword`, `signToken`, `verifyAuth`, `cookieName`, `isProduction` (auth), `sendJson`, `sendError`, `parseBody` (http).
- Produces: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

- [ ] **Step 1: Create `api/auth/login.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { comparePassword, signToken, cookieName, isProduction } from '../lib/auth.js';
import { sendJson, sendError, parseBody, ApiError } from '../lib/http.js';
import type { Role } from '../../src/types/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendError(res, 405, 'METHOD', 'Use POST');

  let body: any;
  try { body = await parseBody(req); } catch (e: any) {
    return sendError(res, (e as ApiError).status, (e as ApiError).code, e.message);
  }
  const email = body?.email;
  const password = body?.password;
  if (!email || !password) return sendError(res, 400, 'VALIDATION', 'email and password required');

  const result = await query('SELECT id, email, password_hash, role, name FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) return sendError(res, 401, 'UNAUTHENTICATED', 'Invalid credentials');

  const user = result.rows[0];
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return sendError(res, 401, 'UNAUTHENTICATED', 'Invalid credentials');

  const token = signToken({ userId: user.id, role: user.role as Role });
  res.setHeader('Set-Cookie', `${cookieName()}=${token}; HttpOnly; SameSite=Lax${isProduction() ? '; Secure' : ''}; Path=/; Max-Age=28800`);
  return sendJson(res, 200, { id: user.id, email: user.email, role: user.role, name: user.name });
}
```

- [ ] **Step 2: Create `api/auth/logout.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cookieName, isProduction } from '../lib/auth.js';
import { sendJson } from '../lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: { code: 'METHOD', message: 'Use POST' } });
  res.setHeader('Set-Cookie', `${cookieName()}=; HttpOnly; SameSite=Lax${isProduction() ? '; Secure' : ''}; Path=/; Max-Age=0`);
  return sendJson(res, 200, { ok: true });
}
```

- [ ] **Step 3: Create `api/auth/me.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db.js';
import { verifyAuth } from '../lib/auth.js';
import { sendJson, sendError } from '../lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return sendError(res, 405, 'METHOD', 'Use GET');
  const auth = verifyAuth(req);
  if (!auth) return sendError(res, 401, 'UNAUTHENTICATED', 'Not logged in');
  const result = await query('SELECT id, email, role, name FROM users WHERE id = $1', [auth.userId]);
  if (result.rowCount === 0) return sendError(res, 401, 'UNAUTHENTICATED', 'User not found');
  const u = result.rows[0];
  return sendJson(res, 200, { id: u.id, email: u.email, role: u.role, name: u.name });
}
```

- [ ] **Step 4: Manual smoke (requires running DB + `vercel dev`)**

Run `npm run dev` in one terminal, then in another:
```
curl -X POST http://localhost:5173/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@care.save\",\"password\":\"care-admin\"}"
```
Expected: 200 with `{ id, email, role, name }` and a `Set-Cookie` header.

- [ ] **Step 5: Commit**

```bash
git add api/auth && git commit -m "feat(auth): login, logout, me endpoints"
```

---

