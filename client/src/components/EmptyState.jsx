// client/src/components/EmptyState.jsx
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel = 'Get Started'
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
      textAlign: 'center',
      minHeight: 300
    }}>
      {Icon && (
        <div style={{
          fontSize: 64,
          marginBottom: 24,
          opacity: 0.3,
          animation: 'float 3s ease-in-out infinite'
        }}>
          {Icon}
        </div>
      )}

      {title && (
        <h3 style={{
          fontSize: 20,
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 8,
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h3>
      )}

      {description && (
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          marginBottom: 24,
          maxWidth: 400,
          lineHeight: 1.6,
          fontWeight: 500
        }}>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action}
          className="btn btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
