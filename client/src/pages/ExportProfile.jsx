import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { fetchExperiences } from '../api/experiences';
import './ExportProfile.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ExportProfile() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchExperiences({ student: user.id, status: 'Approved' })
      .then((data) => {
        if (!cancelled) setExperiences(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <div className="export-profile">
      <div className="export-profile-header">
        <div>
          <h1>Export Profile</h1>
          <p className="review-queue-subtitle">Your verified, recruiter-ready achievement record.</p>
        </div>
        <button className="btn-primary export-profile-print-btn" onClick={() => window.print()}>
          🖨 Print / Save as PDF
        </button>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="review-queue-subtitle">Loading your verified experiences…</p>}

      {!loading && (
        <div className="side-card">
          <h3>{user.name}'s Verified Ledger</h3>

          {experiences.length === 0 && (
            <div className="dashboard-empty">
              <p className="dashboard-empty-title">Nothing verified yet</p>
              <p className="dashboard-empty-subtitle">
                Once a mentor approves one of your experiences, it will appear here as part of your exportable profile.
              </p>
            </div>
          )}

          {experiences.map((item) => (
            <div key={item.id} className="export-profile-entry">
              <div className="export-profile-entry-top">
                <h3>{item.role} — {item.organization}</h3>
              </div>
              <p className="export-profile-meta">
                {item.duration || formatDate(item.created_at)} · Verified {formatDate(item.updated_at)}
              </p>
              {item.description && <p className="export-profile-text">{item.description}</p>}
              {item.outcome && <p className="export-profile-text"><strong>Outcome:</strong> {item.outcome}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportProfile;
