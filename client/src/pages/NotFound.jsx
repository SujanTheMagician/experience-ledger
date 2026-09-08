import { Link } from 'react-router-dom';
import './Auth.css';

function NotFound() {
  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-brand">Experience Ledger</div>
        <h1>404 — Page not found</h1>
        <p className="auth-subtitle">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn-primary" style={{ width: '100%' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
