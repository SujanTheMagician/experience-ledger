import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExperience } from '../api/experiences';
import './AddExperience.css';

const initialForm = {
  organization: '',
  role: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  outcomes: '',
  projectLink: '',
};

function AddExperience() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [skills, setSkills] = useState(['React', 'Python', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const duration = form.currentlyWorking
        ? `${form.startDate} - Present`
        : `${form.startDate} - ${form.endDate}`;

      await createExperience({
        type: 'internship',
        organization: form.organization,
        role: form.role,
        duration,
        description: form.description,
        outcome: form.outcomes,
        evidenceLink: form.projectLink,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-experience">
      <div className="add-experience-breadcrumb">DASHBOARD / MY EXPERIENCES / <strong>ADD NEW</strong></div>
      <h1>Add New Experience</h1>
      <p className="add-experience-subtitle">
        Capture your professional milestones with verifiable proof. All submitted experiences undergo a
        validation process before appearing on your public ledger.
      </p>

      <form className="add-experience-grid" onSubmit={handleSubmit}>
        <div className="add-experience-main">
          <fieldset className="form-section">
            <legend>🏢 Organization Details</legend>
            <label className="form-label" htmlFor="organization">Organization Name</label>
            <input
              id="organization"
              type="text"
              placeholder="e.g. Acme Corporation or Stanford University"
              value={form.organization}
              onChange={updateField('organization')}
              required
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>💼 Role &amp; Duration</legend>
            <label className="form-label" htmlFor="role">Role / Title</label>
            <input
              id="role"
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={form.role}
              onChange={updateField('role')}
              required
            />
            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="startDate">Start Date</label>
                <input id="startDate" type="date" value={form.startDate} onChange={updateField('startDate')} />
              </div>
              <div>
                <label className="form-label" htmlFor="endDate">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={updateField('endDate')}
                  disabled={form.currentlyWorking}
                />
              </div>
            </div>
            <label className="form-checkbox">
              <input type="checkbox" checked={form.currentlyWorking} onChange={updateField('currentlyWorking')} />
              I currently work here
            </label>
          </fieldset>

          <fieldset className="form-section">
            <legend>📄 Experience Details</legend>
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="What were your primary responsibilities?"
              value={form.description}
              onChange={updateField('description')}
              rows={3}
            />
            <label className="form-label" htmlFor="outcomes">Key Outcomes</label>
            <textarea
              id="outcomes"
              placeholder="Quantifiable achievements (e.g. Improved performance by 20%)"
              value={form.outcomes}
              onChange={updateField('outcomes')}
              rows={3}
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>🛡 Verification</legend>
            <div className="upload-dropzone">
              <div className="upload-icon" aria-hidden="true">⬆</div>
              <p className="upload-title">Upload Certificate or Proof of Work</p>
              <p className="upload-subtitle">PDF, JPG, or PNG (Max 10MB)</p>
              <button type="button" className="btn-secondary">Browse Files</button>
            </div>
            <label className="form-label" htmlFor="projectLink">Project Link (optional)</label>
            <input
              id="projectLink"
              type="url"
              placeholder="github.com/username/project"
              value={form.projectLink}
              onChange={updateField('projectLink')}
            />
          </fieldset>
        </div>

        <aside className="add-experience-side">
          <div className="side-card">
            <h3>🎓 Skills &amp; Expertise</h3>
            <input
              type="text"
              placeholder="Type a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
            />
            <div className="skill-cloud" style={{ marginTop: 12 }}>
              {skills.map((skill) => (
                <span key={skill} className="skill-chip skill-chip-active">
                  {skill}
                  <button type="button" className="skill-chip-remove" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>×</button>
                </span>
              ))}
            </div>
            {error && <p className="secure-note" style={{ color: '#c0392b' }}>⚠ {error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: 8 }}>
              Save as Draft
            </button>
            <p className="secure-note">🔒 Secure submission</p>
          </div>

          <div className="pro-tip">
            <strong>💡 Pro Tip</strong>
            <p>
              Experiences with verified certificates or live project links are <strong>4x more likely</strong> to
              be validated by recruiters and academic boards within 24 hours.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default AddExperience;
