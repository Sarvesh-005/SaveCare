import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast('Welcome back', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <form className="card" onSubmit={onSubmit} style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, color: 'var(--teal)' }}>☥ CareSave HMS</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 16px' }}>Sign in to continue</p>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@care.save"
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="care-admin"
        />
        <button className="btn" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Demo: admin@care.save / care-admin · doctor@care.save / care-doctor · reception@care.save / care-reception
        </p>
      </form>
    </div>
  );
}
