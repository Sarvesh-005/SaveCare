// client/src/components/Header.jsx
import { useTheme } from '../context/ThemeContext';
import { useApp }   from '../context/AppContext';
import { MdSunny, MdNightlight, MdRefresh, MdCloudDone, MdCloudOff } from 'react-icons/md';

export default function Header({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  const { fetchAll, loading, isSupabaseConnected } = useApp();

  return (
    <header style={{
      padding: '18px 40px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: '-0.5px',
          margin: 0
        }}>{title}</h1>
        {subtitle && <p style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 4,
          fontWeight: 500
        }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Supabase Status Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 99,
          fontSize: 12, fontWeight: 700,
          background: isSupabaseConnected ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)',
          color: isSupabaseConnected ? 'var(--success)' : 'var(--warning)',
          border: `1.5px solid ${isSupabaseConnected ? 'rgba(5, 150, 105, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {isSupabaseConnected ? <MdCloudDone size={16} /> : <MdCloudOff size={16} />}
          {isSupabaseConnected ? 'Connected' : 'Setup Required'}
        </div>

        <button
          className="btn btn-ghost"
          onClick={fetchAll}
          title="Refresh data"
          style={{
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <MdRefresh size={20} style={{
            animation: loading ? 'spin 0.8s linear infinite' : 'none'
          }} />
        </button>

        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? <MdSunny size={20} /> : <MdNightlight size={20} />}
        </button>

        <div className="avatar" style={{
          background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
          color: '#fff',
          marginLeft: 4,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 185, 129, 0.25)',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700
        }}>A</div>
      </div>
    </header>
  );
}
