### Task 8: Frontend scaffold (styles, layout, contexts, fetch client, login page)

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/api/client.ts`, `src/api/auth.ts`, `src/context/AuthContext.tsx`, `src/context/ToastContext.tsx`, `src/components/Layout.tsx`, `src/modules/auth/LoginPage.tsx`

**Interfaces:**
- Produces:
  - `apiFetch(path, opts): Promise<any>` throwing `ApiError` (`src/api/client.ts`)
  - `authApi.login`, `authApi.logout`, `authApi.me` (`src/api/auth.ts`)
  - `AuthProvider`, `useAuth()` returning `{ user, login, logout, loading }`
  - `ToastProvider`, `useToast()` returning `{ toast(msg, type) }`
  - `Layout` shell with role-filtered sidebar
  - `LoginPage`

- [ ] **Step 1: Create `src/index.css`**

```css
:root {
  --teal: #0E7C7B;
  --teal-dark: #0a5d5c;
  --bg: #f6f7f8;
  --bg-dark: #0f1417;
  --surface: #ffffff;
  --text: #1f2a30;
  --text-muted: #6b7780;
  --border: #e3e7ea;
  --coral: #e15554;
  --radius: 10px;
  --shadow: 0 1px 3px rgba(16,40,50,0.06), 0 1px 2px rgba(16,40,50,0.04);
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f1417; --surface: #1a2024; --text: #e6eaed; --text-muted: #9aa6ad; --border: #2a3138; --shadow: 0 1px 3px rgba(0,0,0,0.4); }
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--text); font-size: 14px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
a { color: var(--teal); text-decoration: none; }
button { font: inherit; cursor: pointer; border: none; border-radius: var(--radius); }
.btn { background: var(--teal); color: #fff; padding: 8px 14px; border-radius: var(--radius); }
.btn:hover { background: var(--teal-dark); }
.btn.secondary { background: transparent; color: var(--teal); border: 1px solid var(--border); }
.btn.danger { background: var(--coral); }
.card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
input, select, textarea { font: inherit; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); width: 100%; }
label { display: block; font-size: 12px; color: var(--text-muted); margin: 8px 0 4px; }
```

- [ ] **Step 2: Create `src/api/client.ts`**

```ts
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  let data: any = null;
  const text = await res.text();
  if (text) { try { data = JSON.parse(text); } catch { data = { raw: text }; } }
  if (!res.ok) {
    const code = data?.error?.code || 'ERROR';
    const message = data?.error?.message || res.statusText;
    throw new ApiError(res.status, code, message);
  }
  return data;
}
```

- [ ] **Step 3: Create `src/api/auth.ts`**

```ts
import { apiFetch } from './client';
import type { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }) as Promise<User>,
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/api/auth/me') as Promise<User>,
};
```

- [ ] **Step 4: Create `src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthState { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; }
const AuthContext = createContext<AuthState>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    setUser(u);
  };
  const logout = async () => { await authApi.logout(); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 5: Create `src/context/ToastContext.tsx`**

```tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }
interface ToastState { toast: (message: string, type?: ToastType) => void; }
const ToastContext = createContext<ToastState>(null as any);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
        {toasts.map((t) => (
          <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.type === 'error' ? 'var(--coral)' : t.type === 'success' ? 'var(--teal)' : '#888'}` }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
```

- [ ] **Step 6: Create `src/components/Layout.tsx`**

```tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface NavItem { to: string; label: string; roles: Role[]; }

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/patients', label: 'Patients', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/doctors', label: 'Doctors', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/appointments', label: 'Appointments', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/records', label: 'Medical Records', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/billing', label: 'Billing', roles: ['admin', 'receptionist'] },
  { to: '/diagnosis', label: 'AI Diagnosis', roles: ['admin', 'doctor'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV.filter((n) => user && n.roles.includes(user.role));
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--teal)', marginBottom: 24 }}>☥ CareSave HMS</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({ padding: '8px 12px', borderRadius: 8, color: isActive ? 'var(--teal)' : 'var(--text)', background: isActive ? 'rgba(14,124,123,0.1)' : 'transparent', textDecoration: 'none' })}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 60, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>{user?.name} · {user?.role}</span>
          <button className="btn secondary" onClick={async () => { await logout(); navigate('/login'); }}>Log out</button>
        </header>
        <main style={{ flex: 1, padding: 24, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/modules/auth/LoginPage.tsx`**

```tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast('Welcome back', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <form className="card" onSubmit={onSubmit} style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, color: 'var(--teal)' }}>☥ CareSave HMS</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 16px' }}>Sign in to continue</p>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@care.save" />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="care-admin" />
        <button className="btn" disabled={busy} style={{ marginTop: 16 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Demo: admin@care.save / care-admin · doctor@care.save / care-doctor · reception@care.save / care-reception
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 8: Create `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/auth/LoginPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Protected><Layout /></Protected>}>
              <Route path="/" element={<div className="card">Dashboard (Task 22)</div>} />
              <Route path="*" element={<div className="card">Not found</div>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 9: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
```

- [ ] **Step 10: Verify dev server runs and login works**

Run: `npm run dev` (with DB migrated+seeded), open `http://localhost:5173`, log in as `admin@care.save / care-admin`.
Expected: redirects to dashboard shell with sidebar.

- [ ] **Step 11: Commit**

```bash
git add src && git commit -m "feat(frontend): styles, auth/ toast context, layout, login page, fetch client"
```

---

## Phase 1 — Patients (reference vertical slice)

