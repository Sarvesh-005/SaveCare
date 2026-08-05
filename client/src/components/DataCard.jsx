// client/src/components/DataCard.jsx
export default function DataCard({
  icon,
  label,
  value,
  subtitle,
  color = 'var(--accent-teal)',
  trend,
  onClick,
  loading = false,
  className = ''
}) {
  if (loading) {
    return (
      <div className={`card ${className}`} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(90deg, var(--border-color) 25%, rgba(229,231,235,0.2) 50%, var(--border-color) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 16,
              background: 'var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 8,
              animation: 'pulse 2s infinite'
            }} />
            <div style={{
              height: 24,
              background: 'var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              animation: 'pulse 2s infinite',
              animationDelay: '0.1s'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        padding: '28px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: `linear-gradient(135deg, var(--bg-card), ${color}08)`,
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
      } : null}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      } : null}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
          color,
          fontSize: 28,
          flexShrink: 0,
          boxShadow: `0 4px 12px ${color}25`
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
            fontFamily: "'Poppins', sans-serif"
          }}>
            {label}
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            fontFamily: "'Poppins', sans-serif",
            marginBottom: subtitle ? 6 : 0
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              marginTop: 8,
              color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)'
            }}>
              {trend} from last month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
