import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Auth.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">Experience Ledger</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to view and manage your verified achievements.</p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={updateField('email')} autoComplete="username" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={form.password} onChange={updateField('password')} autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-demo-hint">
          Demo accounts (after <code>npm run db:seed</code>): <br />
          alex.rivera@example.com / sarah.jenkins@example.com — password: <code>password123</code>
        </div>
      </div>
    </div>
  );
}

export default Login;
