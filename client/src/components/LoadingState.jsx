// client/src/components/LoadingState.jsx
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
      minHeight: 300
    }}>
      {/* Premium spinner */}
      <div style={{
        position: 'relative',
        width: 48,
        height: 48,
        marginBottom: 24
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-teal)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderRightColor: 'var(--accent-blue)',
          animation: 'spin 1.2s linear infinite reverse'
        }} />
      </div>

      {message && (
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          fontWeight: 600,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
