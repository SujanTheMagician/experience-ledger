import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { fetchExperiences, deleteExperience } from '../api/experiences';
import './ReviewQueue.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MyExperiences() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchExperiences({ student: user.id })
      .then((data) => {
        if (cancelled) return;
        setExperiences(data);
        setError(null);
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

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const remove = async (id) => {
    if (!window.confirm('Delete this experience entry? This cannot be undone.')) return;
    setActioningId(id);
    try {
      await deleteExperience(id);
      setExperiences((prev) => prev.filter((item) => item.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="review-queue">
      <div className="review-queue-header">
        <div>
          <h1>My Experiences</h1>
          <p className="review-queue-subtitle">Everything you've submitted to your verified ledger.</p>
        </div>
        <Link to="/add-experience" className="btn-primary">+ Add New Experience</Link>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="review-queue-subtitle">Loading your experiences…</p>}

      {!loading && (
        <div className="review-table">
          <div className="review-table-scroll">
            <div className="review-table-head">
              <span>Organization</span>
              <span>Role</span>
              <span>Duration</span>
              <span>Submitted</span>
              <span>Status</span>
            </div>

            {experiences.length === 0 && (
              <div className="dashboard-empty">
                <p className="dashboard-empty-title">No experiences yet</p>
                <p className="dashboard-empty-subtitle">Add your first internship or project to start your verified ledger.</p>
                <Link to="/add-experience" className="btn-primary">+ Add New Experience</Link>
              </div>
            )}

            {experiences.map((item) => (
              <div key={item.id} className="review-row-wrapper">
                <button className="review-row" onClick={() => toggleExpand(item.id)}>
                  <span>{item.organization}</span>
                  <span>{item.role}</span>
                  <span>{item.duration || '—'}</span>
                  <span>{formatDate(item.created_at)}</span>
                  <span className="review-status-cell">
                    <StatusBadge status={item.status} />
                    <span className={'review-caret' + (expandedId === item.id ? ' review-caret-open' : '')}>⌄</span>
                  </span>
                </button>

                {expandedId === item.id && (
                  <div className="review-detail">
                    {item.description && (
                      <>
                        <label className="form-label">Description</label>
                        <p className="review-summary">{item.description}</p>
                      </>
                    )}
                    {item.outcome && (
                      <>
                        <label className="form-label">Outcome</label>
                        <p className="review-summary">{item.outcome}</p>
                      </>
                    )}
                    {item.mentor_comment && (
                      <>
                        <label className="form-label">Mentor Feedback</label>
                        <p className="review-summary">{item.mentor_comment}</p>
                      </>
                    )}
                    <div className="review-actions">
                      <button
                        className="btn-danger"
                        disabled={actioningId === item.id}
                        onClick={() => remove(item.id)}
                      >
                        🗑 Delete Entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyExperiences;
