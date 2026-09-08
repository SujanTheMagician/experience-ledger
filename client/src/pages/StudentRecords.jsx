import { useEffect, useMemo, useState } from 'react';
import { fetchExperiences } from '../api/experiences';
import './Analytics.css';

function groupByStudent(experiences) {
  const byStudent = new Map();

  for (const exp of experiences) {
    const key = exp.student_id;
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        id: key,
        name: exp.student_name,
        email: exp.student_email,
        total: 0,
        approved: 0,
        pending: 0,
        other: 0,
      });
    }
    const record = byStudent.get(key);
    record.total += 1;
    if (exp.status === 'Approved') record.approved += 1;
    else if (exp.status === 'Pending Verification') record.pending += 1;
    else record.other += 1;
  }

  return Array.from(byStudent.values()).sort((a, b) => b.total - a.total);
}

function StudentRecords() {
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

  const students = useMemo(() => groupByStudent(experiences), [experiences]);

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>Student Records</h1>
          <p className="analytics-subtitle">Every student with at least one submitted experience.</p>
        </div>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="analytics-subtitle">Loading student records…</p>}

      {!loading && (
        <section className="cohort-table">
          <div className="cohort-header">
            <div>
              <h3>All Students</h3>
              <p className="analytics-subtitle">{students.length} student(s) with submitted experiences.</p>
            </div>
          </div>
          <div className="cohort-table-scroll">
            <div className="cohort-table-head">
              <span>Student Name</span>
              <span>Email</span>
              <span>Total</span>
              <span>Approved</span>
              <span>Pending / Other</span>
            </div>
            {students.length === 0 && <p className="analytics-subtitle">No student submissions yet.</p>}
            {students.map((student) => (
              <div key={student.id} className="cohort-row">
                <span className="cohort-student">
                  <span className="review-avatar">
                    {student.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </span>
                  <span>{student.name}</span>
                </span>
                <span>{student.email}</span>
                <span><span className="skill-chip skill-chip-active">{student.total}</span></span>
                <span>{student.approved}</span>
                <span>{student.pending + student.other}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default StudentRecords;
