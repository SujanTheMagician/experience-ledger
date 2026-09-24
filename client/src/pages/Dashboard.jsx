import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { fetchExperiences } from '../api/experiences';
import { statusCounts, relativeDays } from '../utils/experienceStats';
import './Dashboard.css';

const RECENT_ACTIVITY_LIMIT = 5;
const VERIFICATION_LOG_LIMIT = 4;

function Dashboard() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchExperiences({ student: user.id })
      .then((data) => {
        if (!cancelled) setExperiences(data);
      })
      .catch(() => {
        // Dashboard is a summary view - if this fails, just show the empty state
        // rather than blocking the page with an error banner.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const counts = useMemo(() => statusCounts(experiences), [experiences]);
  const recentActivity = experiences.slice(0, RECENT_ACTIVITY_LIMIT);
  const hasActivity = recentActivity.length > 0;
  const firstName = user.name.split(' ')[0];

  const ledgerPercent = counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0;
  const ledgerNote =
    counts.total === 0
      ? 'Add your first experience to start building your verified ledger.'
      : `${counts.approved} of ${counts.total} experience(s) verified so far.`;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {firstName}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your verified ledger.</p>
        </div>
        <Link to="/add-experience" className="btn-primary">+ Add New Experience</Link>
      </div>

      <div className="dashboard-stats">
        <StatCard label="Total Experiences" value={counts.total} icon="✦" />
        <StatCard label="Approved" value={counts.approved} icon="✓" />
        <StatCard label="Pending Review" value={counts.pending} icon="◔" />
        <StatCard label="Needs Attention" value={counts.needsAttention} icon="!" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-activity">
          <div className="dashboard-activity-heading">
            <h2>Recent Activity</h2>
            <span className="dashboard-live-pill">Live</span>
          </div>

          {loading && <p className="dashboard-empty-subtitle">Loading your experiences…</p>}

          {!loading && !hasActivity && (
            <div className="dashboard-empty">
              <p className="dashboard-empty-title">No experiences logged yet</p>
              <p className="dashboard-empty-subtitle">
                Start building your verified ledger by adding your first internship or project
              </p>
              <Link to="/add-experience" className="btn-primary">+ Add New Experience</Link>
            </div>
          )}

          {!loading && hasActivity && (
            <ul className="dashboard-timeline">
              {recentActivity.map((item) => (
                <li key={item.id} className="dashboard-timeline-item">
                  <div className="dashboard-timeline-dot" />
                  <div className="dashboard-timeline-card">
                    <div className="dashboard-timeline-top">
                      <h3>{item.role}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="dashboard-timeline-meta">{item.organization} • {item.duration || '—'}</p>
                    {item.description && <p className="dashboard-timeline-desc">{item.description}</p>}
                    {item.mentor_comment && (
                      <p className="dashboard-timeline-note">"{item.mentor_comment}"</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="dashboard-side">
          <div className="ledger-completion">
            <div className="ledger-completion-top">
              <h3>Ledger Completion</h3>
              <span className="ledger-completion-percent">{ledgerPercent}%</span>
            </div>
            <div className="ledger-completion-bar">
              <div className="ledger-completion-fill" style={{ width: `${ledgerPercent}%` }} />
            </div>
            <p>{ledgerNote}</p>
          </div>

          <div className="side-card">
            <h3>Verification Log</h3>
            {experiences.length === 0 ? (
              <p className="dashboard-empty-subtitle">No activity yet</p>
            ) : (
              <ul className="verification-log">
                {experiences.slice(0, VERIFICATION_LOG_LIMIT).map((exp) => (
                  <li key={exp.id}>
                    <div>
                      <div className="verification-log-org">{exp.organization}</div>
                      <div className="verification-log-meta">Submitted {relativeDays(exp.created_at)}</div>
                    </div>
                    <span className={`verification-dot verification-dot-${exp.status === 'Pending Verification' ? 'pending' : 'done'}`} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
