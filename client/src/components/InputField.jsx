// client/src/components/InputField.jsx
import { useState } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import Tooltip from './Tooltip';

export default function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  success,
  hint,
  helpText,
  icon: Icon,
  disabled = false,
  autoComplete = 'off'
}) {
  const [focused, setFocused] = useState(false);

  const hasError = error && error.trim().length > 0;
  const hasSuccess = success && !hasError;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          border: `1.5px solid ${hasError ? 'var(--danger)' : hasSuccess ? 'var(--success)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-sm)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: focused ? `0 0 0 4px ${hasError ? 'rgba(220, 38, 38, 0.1)' : hasSuccess ? 'rgba(5, 150, 105, 0.1)' : 'rgba(15, 185, 129, 0.1)'}` : 'none'
        }}>
          {Icon && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              color: focused ? 'var(--accent-teal)' : 'var(--text-muted)',
              transition: 'color 0.2s ease'
            }}>
              <Icon size={18} />
            </div>
          )}

          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoComplete={autoComplete}
            className="form-control"
            style={{
              flex: 1,
              padding: Icon ? '11px 14px 11px 0' : '11px 14px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 500
            }}
          />

          {hasSuccess && (
            <div style={{ paddingRight: 12, color: 'var(--success)', display: 'flex' }}>
              <MdCheckCircle size={18} />
            </div>
          )}

          {hasError && (
            <Tooltip content={error} position="top">
              <div style={{ paddingRight: 12, color: 'var(--danger)', display: 'flex' }}>
                <MdError size={18} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {(helpText || hint) && (
        <div style={{
          marginTop: 6,
          fontSize: 12,
          color: hasError ? 'var(--danger)' : 'var(--text-muted)',
          fontWeight: 500,
          lineHeight: 1.4
        }}>
          {hasError ? error : helpText || hint}
        </div>
      )}
    </div>
  );
}
