// client/src/components/InfoBanner.jsx
import { MdClose, MdWarning, MdCheckCircle, MdInfo, MdError } from 'react-icons/md';
import { useState } from 'react';

const icons = {
  success: <MdCheckCircle size={20} />,
  warning: <MdWarning size={20} />,
  error: <MdError size={20} />,
  info: <MdInfo size={20} />
};

const styles = {
  success: { bg: 'rgba(5, 150, 105, 0.08)', border: 'var(--success)', icon: 'var(--success)' },
  warning: { bg: 'rgba(217, 119, 6, 0.08)', border: 'var(--warning)', icon: 'var(--warning)' },
  error: { bg: 'rgba(220, 38, 38, 0.08)', border: 'var(--danger)', icon: 'var(--danger)' },
  info: { bg: 'rgba(37, 99, 235, 0.08)', border: 'var(--info)', icon: 'var(--info)' }
};

export default function InfoBanner({
  type = 'info',
  title,
  message,
  action,
  actionLabel = 'Learn More',
  dismissible = true,
  onDismiss
}) {
  const [dismissed, setDismissed] = useState(false);
  const style = styles[type] || styles.info;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div style={{
      background: style.bg,
      border: `1.5px solid ${style.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
        <div style={{ color: style.icon, display: 'flex', flexShrink: 0 }}>
          {icons[type]}
        </div>
        <div style={{ flex: 1 }}>
          {title && (
            <div style={{
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--text-primary)',
              marginBottom: message ? 2 : 0,
              fontFamily: "'Poppins', sans-serif"
            }}>
              {title}
            </div>
          )}
          {message && (
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {action && (
          <button
            onClick={action}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: '6px 12px',
              color: style.border,
              fontWeight: 700
            }}
          >
            {actionLabel}
          </button>
        )}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
          >
            <MdClose size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
