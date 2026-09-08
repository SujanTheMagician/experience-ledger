import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Auth.css';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'placement_officer', label: 'Placement Officer' },
];

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/', { replace: true });
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
        <h1>Create your account</h1>
        <p className="auth-subtitle">Start building your verified achievement ledger.</p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" required value={form.name} onChange={updateField('name')} autoComplete="name" />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={updateField('email')} autoComplete="username" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={updateField('password')}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="role">I am a</label>
            <select id="role" value={form.role} onChange={updateField('role')}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
