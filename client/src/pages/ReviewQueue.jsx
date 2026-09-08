import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { fetchExperiences, updateExperienceStatus, deleteExperience } from '../api/experiences';
import './ReviewQueue.css';

function initialsOf(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toRow(experience) {
  return {
    id: experience.id,
    studentName: experience.student_name,
    initials: initialsOf(experience.student_name),
    org: experience.organization,
    role: experience.role,
    dateSubmitted: formatDate(experience.created_at),
    status: experience.status,
    summary: experience.description,
    outcome: experience.outcome,
  };
}

function ReviewQueue() {
  const [queue, setQueue] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchExperiences()
      .then((data) => {
        if (cancelled) return;
        setQueue(data.map(toRow));
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
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const decide = async (id, status) => {
    setActioningId(id);
    try {
      const updated = await updateExperienceStatus(id, status, notes[id]);
      setQueue((prev) => prev.map((item) => (item.id === id ? toRow(updated) : item)));
      setExpandedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this experience entry? This cannot be undone.')) return;
    setActioningId(id);
    try {
      await deleteExperience(id);
      setQueue((prev) => prev.filter((item) => item.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const pendingCount = queue.filter((q) => q.status === 'Pending Verification').length;

  return (
    <div className="review-queue">
      <div className="review-queue-header">
        <div>
          <h1>Review Queue</h1>
          <p className="review-queue-subtitle">Manage and verify pending student achievements.</p>
        </div>
        <button className="btn-secondary">⬇ Export CSV</button>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="review-queue-subtitle">Loading experiences…</p>}

      {!loading && (
        <>
          <div className="review-queue-filters">
            <div className="filter-group">
              <label>Status</label>
              <select defaultValue="all">
                <option value="all">All Pending</option>
                <option value="revision">Needs Revision</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Skill</label>
              <select defaultValue="all">
                <option value="all">All Skills</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date Range</label>
              <select defaultValue="30">
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            <span className="review-queue-count">Showing {queue.length} of {queue.length} · {pendingCount} pending</span>
          </div>

          <div className="review-table">
            <div className="review-table-scroll">
              <div className="review-table-head">
                <span>Student Name</span>
                <span>Organization</span>
                <span>Role</span>
                <span>Date Submitted</span>
                <span>Status</span>
              </div>

              {queue.length === 0 && <p className="review-queue-subtitle">No experiences to review.</p>}

              {queue.map((item) => (
                <div key={item.id} className="review-row-wrapper">
                  <button className="review-row" onClick={() => toggleExpand(item.id)}>
                    <span className="review-student">
                      <span className="review-avatar">{item.initials}</span>
                      {item.studentName}
                    </span>
                    <span>{item.org}</span>
                    <span>{item.role}</span>
                    <span>{item.dateSubmitted}</span>
                    <span className="review-status-cell">
                      <StatusBadge status={item.status} />
                      <span className={'review-caret' + (expandedId === item.id ? ' review-caret-open' : '')}>⌄</span>
                    </span>
                  </button>

                  {expandedId === item.id && (
                    <div className="review-detail">
                      {item.summary && (
                        <>
                          <label className="form-label">Achievement Summary</label>
                          <p className="review-summary">{item.summary}</p>
                        </>
                      )}
                      {item.outcome && (
                        <>
                          <label className="form-label">Outcome</label>
                          <p className="review-summary">{item.outcome}</p>
                        </>
                      )}

                      <label className="form-label">Mentor Feedback</label>
                      <textarea
                        placeholder="Add private notes or public feedback..."
                        rows={2}
                        value={notes[item.id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />

                      <div className="review-actions">
                        <button
                          className="btn-primary"
                          disabled={actioningId === item.id}
                          onClick={() => decide(item.id, 'Approved')}
                        >
                          ✓ Approve Submission
                        </button>
                        <button
                          className="btn-secondary"
                          disabled={actioningId === item.id}
                          onClick={() => decide(item.id, 'Changes Requested')}
                        >
                          ✎ Request Changes
                        </button>
                        <button
                          className="btn-danger"
                          disabled={actioningId === item.id}
                          onClick={() => decide(item.id, 'Rejected')}
                        >
                          ✕ Reject
                        </button>
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
        </>
      )}
    </div>
  );
}

export default ReviewQueue;
