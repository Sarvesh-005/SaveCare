// client/src/components/Toast.jsx
import { useEffect, useState } from 'react';
import { MdClose, MdCheckCircle, MdWarning, MdError, MdInfo } from 'react-icons/md';

const icons = {
  success: <MdCheckCircle size={20} />,
  warning: <MdWarning size={20} />,
  error: <MdError size={20} />,
  info: <MdInfo size={20} />
};

const colors = {
  success: { bg: 'rgba(5, 150, 105, 0.1)', border: 'var(--success)', text: 'var(--success)' },
  warning: { bg: 'rgba(217, 119, 6, 0.1)', border: 'var(--warning)', text: 'var(--warning)' },
  error: { bg: 'rgba(220, 38, 38, 0.1)', border: 'var(--danger)', text: 'var(--danger)' },
  info: { bg: 'rgba(37, 99, 235, 0.1)', border: 'var(--info)', text: 'var(--info)' }
};

export function Toast({ type = 'info', title, message, onClose, autoClose = 4000 }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const color = colors[type] || colors.info;

  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  return (
    <div style={{
      background: color.bg,
      border: `1.5px solid ${color.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      boxShadow: 'var(--shadow-lg)',
      animation: isLeaving ? 'slideUp 0.3s ease-in forwards' : 'slideInRight 0.3s ease-out',
      maxWidth: 400
    }}>
      <div style={{ color: color.text, display: 'flex', flexShrink: 0 }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--text-primary)',
          marginBottom: title && message ? 4 : 0
        }}>{title}</div>}
        {message && <div style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>{message}</div>}
      </div>
      <button onClick={() => {
        setIsLeaving(true);
        setTimeout(onClose, 300);
      }} className="btn btn-ghost" style={{ padding: '4px 8px' }}>
        <MdClose size={18} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 500,
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
            autoClose={toast.autoClose}
          />
        </div>
      ))}
    </div>
  );
}
