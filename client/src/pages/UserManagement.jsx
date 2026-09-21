import { useEffect, useState } from 'react';
import { fetchUsers, updateUserRole } from '../api/users';
import './Analytics.css';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'placement_officer', label: 'Placement Officer' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_LABEL = ROLES.reduce((map, r) => ({ ...map, [r.value]: r.label }), {});

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
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

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    setError(null);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>User Management</h1>
          <p className="analytics-subtitle">Every registered user, and the role that controls what they can access.</p>
        </div>
      </div>

      {error && <p className="dashboard-timeline-note">⚠ {error}</p>}
      {loading && <p className="analytics-subtitle">Loading users…</p>}

      {!loading && (
        <section className="cohort-table">
          <div className="cohort-header">
            <div>
              <h3>All Users</h3>
              <p className="analytics-subtitle">{users.length} registered user(s).</p>
            </div>
          </div>
          <div className="cohort-table-scroll">
            <div className="cohort-table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Current Role</span>
              <span>Change Role</span>
            </div>
            {users.length === 0 && <p className="analytics-subtitle">No users found.</p>}
            {users.map((u) => (
              <div key={u.id} className="cohort-row">
                <span className="cohort-student">
                  <span className="review-avatar">
                    {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </span>
                  <span>{u.name}</span>
                </span>
                <span>{u.email}</span>
                <span><span className="skill-chip skill-chip-active">{ROLE_LABEL[u.role] || u.role}</span></span>
                <span>
                  <select
                    value={u.role}
                    disabled={savingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default UserManagement;
