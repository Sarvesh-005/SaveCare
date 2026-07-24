### Task 6: HTTP helpers (TDD)

**Files:**
- Create: `api/lib/http.ts`, `api/lib/http.test.ts`

**Interfaces:**
- Produces:
  - `sendJson(res, status: number, body: unknown): void`
  - `sendError(res, status: number, code: string, message: string): void`
  - `parseBody(req): Promise<unknown>`
  - `ApiError` class `{ status, code, message }`

- [ ] **Step 1: Write the failing tests**

`api/lib/http.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ApiError, errorBody } from './http.js';

describe('ApiError', () => {
  it('carries status, code, message', () => {
    const e = new ApiError(404, 'NOT_FOUND', 'nope');
    expect(e.status).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
    expect(e.message).toBe('nope');
  });
});

describe('errorBody', () => {
  it('shapes the error response', () => {
    expect(errorBody('VALIDATION', 'bad input')).toEqual({ error: { code: 'VALIDATION', message: 'bad input' } });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- http`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

`api/lib/http.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- http`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/lib/http.ts api/lib/http.test.ts && git commit -m "feat(http): response/error helpers + body parser + tests"
```

---

