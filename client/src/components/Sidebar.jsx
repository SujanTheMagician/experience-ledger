import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Each role's "Dashboard" points at that role's own landing page, not a shared "/" -
// otherwise navigating there from a Mentor/Admin view would silently drop back into
// the Student dashboard's content, since "/" only ever renders the student persona.
const NAV_ITEMS = {
  student: [
    { to: '/', label: 'Dashboard', icon: '▦' },
    { to: '/my-experiences', label: 'My Experiences', icon: '⇄' },
    { to: '/export-profile', label: 'Export Profile', icon: '▤' },
  ],
  reviewer: [
    { to: '/review-queue', label: 'Dashboard', icon: '▦' },
    { to: '/export-profile', label: 'Export Profile', icon: '▤' },
  ],
  admin: [
    { to: '/analytics', label: 'Dashboard', icon: '▦' },
    { to: '/student-records', label: 'Student Records', icon: '☰' },
    { to: '/export-profile', label: 'Export Profile', icon: '▤' },
  ],
};

const FOOTER_CONTENT = {
  student: { title: 'Status: Premium', subtitle: 'Account fully verified' },
  reviewer: { title: 'Dr. Sarah Jenkins', subtitle: 'Senior Mentor' },
  admin: { title: 'Admin Officer', subtitle: 'Placement Cell' },
};

function Sidebar({ role = 'student', open = false, onClose }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.student;
  const footer = FOOTER_CONTENT[role] || FOOTER_CONTENT.student;

  return (
    <aside className={'sidebar' + (open ? ' sidebar-open' : '')}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-name">Experience Ledger</span>
        <span className="sidebar-brand-tag">Verified Achievement</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link-active' : '')}
          >
            <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-badge" aria-hidden="true">✓</div>
        <div>
          <div className="sidebar-footer-title">{footer.title}</div>
          <div className="sidebar-footer-subtitle">{footer.subtitle}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
