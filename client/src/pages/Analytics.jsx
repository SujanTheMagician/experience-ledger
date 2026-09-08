import StatCard from '../components/StatCard';
import { analyticsStats, skillDistribution, readinessTrend, studentCohort } from '../data/mockData';
import './Analytics.css';

function Analytics() {
  const maxTrend = Math.max(...readinessTrend.map((t) => t.value));

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="analytics-subtitle">Real-time placement readiness and student achievement metrics.</p>
        </div>
        <div className="analytics-filters">
          <select defaultValue="all"><option value="all">All Departments</option></select>
          <select defaultValue="2024"><option value="2024">Batch 2024</option></select>
          <select defaultValue="6"><option value="6">Last 6 Months</option></select>
          <button className="btn-primary">Apply Filters</button>
        </div>
      </div>

      <div className="dashboard-stats">
        {analyticsStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      <div className="analytics-grid">
        <section className="side-card">
          <h3>Skill Distribution</h3>
          <div className="skill-bars">
            {skillDistribution.map((row) => (
              <div key={row.skill} className="skill-bar-row">
                <div className="skill-bar-labels">
                  <span>{row.skill}</span>
                  <span>{row.percent}%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="side-card">
          <div className="trend-header">
            <h3>Readiness Trend</h3>
            <div className="trend-legend">
              <span><i className="dot dot-ready" /> Ready</span>
              <span><i className="dot dot-progress" /> In Progress</span>
            </div>
          </div>
          <svg viewBox="0 0 300 140" className="trend-chart" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              points={readinessTrend
                .map((t, i) => `${(i / (readinessTrend.length - 1)) * 300},${140 - (t.value / maxTrend) * 120}`)
                .join(' ')}
            />
          </svg>
          <div className="trend-months">
            {readinessTrend.map((t) => <span key={t.month}>{t.month}</span>)}
          </div>
        </section>
      </div>

      <section className="cohort-table">
        <div className="cohort-header">
          <div>
            <h3>Active Student Cohort</h3>
            <p className="analytics-subtitle">Reviewing {studentCohort.length} verified record(s) shown.</p>
          </div>
          <button className="btn-primary">Export Report</button>
        </div>
        <div className="cohort-table-scroll">
          <div className="cohort-table-head">
            <span>Student Name</span>
            <span>Department</span>
            <span>Verified Exp.</span>
            <span>Top Skills</span>
            <span>Readiness</span>
          </div>
          {studentCohort.map((student) => (
            <div key={student.id} className="cohort-row">
              <span className="cohort-student">
                <span className="review-avatar">{student.name.split(' ').map((n) => n[0]).join('')}</span>
                <span>
                  <div>{student.name}</div>
                  <div className="cohort-roll">Roll: {student.rollNo}</div>
                </span>
              </span>
              <span>{student.department}</span>
              <span><span className="skill-chip skill-chip-active">{student.verifiedExp}</span></span>
              <span className="skill-cloud">
                {student.topSkills.map((s) => <span key={s} className="skill-chip">{s}</span>)}
                {student.extraSkills > 0 && <span className="skill-chip">+{student.extraSkills}</span>}
              </span>
              <span className="readiness-bar-track">
                <span className="readiness-bar-fill" style={{ width: `${student.readiness}%` }} />
                <span className="readiness-bar-label">{student.readiness}%</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Analytics;
