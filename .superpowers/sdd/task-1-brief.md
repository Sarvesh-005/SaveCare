### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vercel.json`, `vitest.config.ts`, `.env.example`, `.gitignore`, `index.html`

**Interfaces:**
- Produces: a runnable Vite+TS project with `npm run dev` (Vite on :5173 proxying `/api`→:3000) and `npm run test`. Vercel serves `/api/*` as serverless functions.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "care-save-hms",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently -k -n VITE,API \"vite\" \"vercel dev --listen 3000\"",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.11.20",
    "@types/pg": "^8.11.2",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vercel/node": "^3.0.20",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "jsdom": "^24.0.0",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4",
    "vitest": "^1.3.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "api", "scripts", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Create `vercel.json`**

```json
{
  "functions": {
    "api/**/*.ts": { "runtime": "@vercel/node@3.0.20" }
  }
}
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

- [ ] **Step 7: Create `.env.example`**

```
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
JWT_SECRET=replace-with-a-long-random-string
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
dist
.vercel
.env
*.local
```

- [ ] **Step 9: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CareSave HMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 11: Install deps and verify**

Run: `npm install`
Expected: installs without error.

- [ ] **Step 12: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Vite + Vercel + TS project"
```

---

