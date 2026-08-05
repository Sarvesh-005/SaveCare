// client/src/components/Button.jsx
import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  const sizeStyles = {
    sm: { padding: '7px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 15 },
    xl: { padding: '16px 32px', fontSize: 16 }
  };

  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    outline: 'btn-secondary'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantStyles[variant]} ${className}`}
      style={{
        ...sizeStyles[size],
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          animation: 'spin 0.8s linear infinite'
        }} />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={18} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={18} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
