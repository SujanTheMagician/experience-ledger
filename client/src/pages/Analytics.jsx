import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { fetchExperiences } from '../api/experiences';
import { statusCounts, avgReviewDays, monthlyTrend, groupByStudent } from '../utils/experienceStats';
import './Analytics.css';

const COHORT_PREVIEW_LIMIT = 5;

function Analytics() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchExperiences()
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
  }, []);

  const counts = useMemo(() => statusCounts(experiences), [experiences]);
  const trend = useMemo(() => monthlyTrend(experiences), [experiences]);
  const cohort = useMemo(() => groupByStudent(experiences), [experiences]);
  const reviewDays = useMemo(() => avgReviewDays(experiences), [experiences]);

  const orgCount = new Set(experiences.map((e) => e.organization)).size;
  const readyPercent = counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0;
  const maxTrend = Math.max(1, ...trend.map((t) => t.value));

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="analytics-subtitle">Placement readiness and student achievement metrics, from live submissions.</p>
        </div>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="analytics-subtitle">Loading analytics…</p>}

      {!loading && (
        <>
          <div className="dashboard-stats">
            <StatCard label="Verified Experiences" value={counts.approved} />
            <StatCard label="Avg. Mentor Review" value={reviewDays === null ? '—' : reviewDays.toFixed(1)} unit={reviewDays === null ? '' : 'DAYS'} />
            <StatCard label="Placement-Ready" value={`${readyPercent}%`} />
            <StatCard label="Organizations" value={orgCount} />
          </div>

          <div className="analytics-grid">
            <section className="side-card">
              <div className="trend-header">
                <h3>Submissions Trend (Last 6 Months)</h3>
              </div>
              {experiences.length === 0 ? (
                <p className="analytics-subtitle">No submissions yet.</p>
              ) : (
                <>
                  <svg viewBox="0 0 300 140" className="trend-chart" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points={trend
                        .map((t, i) => `${(i / (trend.length - 1)) * 300},${140 - (t.value / maxTrend) * 120}`)
                        .join(' ')}
                    />
                  </svg>
                  <div className="trend-months">
                    {trend.map((t) => <span key={t.month}>{t.month}</span>)}
                  </div>
                </>
              )}
            </section>
          </div>

          <section className="cohort-table">
            <div className="cohort-header">
              <div>
                <h3>Active Student Cohort</h3>
                <p className="analytics-subtitle">{cohort.length} student(s) with submitted experiences.</p>
              </div>
              {cohort.length > COHORT_PREVIEW_LIMIT && (
                <Link to="/student-records" className="side-card-link">View all →</Link>
              )}
            </div>
            <div className="cohort-table-scroll">
              <div className="cohort-table-head">
                <span>Student Name</span>
                <span>Email</span>
                <span>Verified Exp.</span>
                <span>Pending / Other</span>
                <span>Readiness</span>
              </div>
              {cohort.length === 0 && <p className="analytics-subtitle">No student submissions yet.</p>}
              {cohort.slice(0, COHORT_PREVIEW_LIMIT).map((student) => (
                <div key={student.id} className="cohort-row">
                  <span className="cohort-student">
                    <span className="review-avatar">
                      {student.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                    <span>{student.name}</span>
                  </span>
                  <span>{student.email}</span>
                  <span><span className="skill-chip skill-chip-active">{student.approved}</span></span>
                  <span>{student.pending + student.other}</span>
                  <span className="readiness-bar-track">
                    <span className="readiness-bar-fill" style={{ width: `${student.readiness}%` }} />
                    <span className="readiness-bar-label">{student.readiness}%</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Analytics;
