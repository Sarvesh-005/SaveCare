import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface NavItem {
  to: string;
  label: string;
  roles: Role[];
}

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
      <aside
        style={{
          width: 240,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--teal)', marginBottom: 24 }}>
          ☥ CareSave HMS
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              style={({ isActive }) => ({
                padding: '8px 12px',
                borderRadius: 8,
                color: isActive ? 'var(--teal)' : 'var(--text)',
                background: isActive ? 'rgba(14,124,123,0.1)' : 'transparent',
                textDecoration: 'none',
              })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            height: 60,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            gap: 12,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            {user?.name} · {user?.role}
          </span>
          <button
            className="btn secondary"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </header>
        <main
          style={{
            flex: 1,
            padding: 24,
            maxWidth: 1400,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
