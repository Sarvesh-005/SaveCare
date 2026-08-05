// client/src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdLocalHospital, MdCalendarToday,
  MdFolderOpen, MdReceipt, MdPsychology
} from 'react-icons/md';

const NAV_ITEMS = [
  { to: '/',             icon: <MdDashboard />,     label: 'Dashboard' },
  { to: '/patients',    icon: <MdPeople />,          label: 'Patients' },
  { to: '/doctors',     icon: <MdLocalHospital />,   label: 'Doctors' },
  { to: '/appointments',icon: <MdCalendarToday />,   label: 'Appointments' },
  { to: '/records',     icon: <MdFolderOpen />,      label: 'Medical Records' },
  { to: '/billing',     icon: <MdReceipt />,         label: 'Billing' },
  { to: '/ai',          icon: <MdPsychology />,      label: 'AI Diagnosis' },
];

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)', background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo Section */}
      <div style={{
        padding: '32px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'linear-gradient(180deg, rgba(15,185,129,0.05), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0, boxShadow: '0 4px 12px rgba(15, 185, 129, 0.3)',
            fontWeight: 700
          }}>🏥</div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: 16,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.5px'
            }}>SaveCare</div>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: 2
            }}>Hospital System</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--text-muted)',
          padding: '8px 12px',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontFamily: "'Poppins', sans-serif"
        }}>
          Main Menu
        </div>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 'var(--radius-sm)',
              marginBottom: 6, textDecoration: 'none',
              fontSize: 14, fontWeight: isActive ? 700 : 600,
              color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(15,185,129,0.12)' : 'transparent',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: isActive ? '3px solid var(--accent-teal)' : '3px solid transparent',
              position: 'relative',
              overflow: 'hidden'
            })}
          >
            <span style={{ fontSize: 20, display: 'flex', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        fontSize: 11,
        color: 'var(--text-muted)',
        fontWeight: 600,
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(15,185,129,0.03))'
      }}>
        SaveCare v1.0
      </div>
    </aside>
  );
}
