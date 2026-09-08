import './Header.css';

function Header({ user, searchPlaceholder = 'Search experiences...', onLogout }) {
  return (
    <header className="app-header">
      <div className="app-header-search">
        <span className="app-header-search-icon" aria-hidden="true">⌕</span>
        <input type="text" placeholder={searchPlaceholder} aria-label="Search" />
      </div>

      <div className="app-header-actions">
        <button className="app-header-icon-btn" aria-label="Notifications">🔔</button>
        <button className="app-header-icon-btn" aria-label="Help">?</button>
        <div className="app-header-user">
          <div className="app-header-user-text">
            <div className="app-header-user-name">{user.name}</div>
            {user.studentId && <div className="app-header-user-meta">Student ID: {user.studentId}</div>}
            {user.role && <div className="app-header-user-meta">{user.role}</div>}
          </div>
          <div className="app-header-avatar">{user.avatarInitials}</div>
        </div>
        {onLogout && (
          <button className="app-header-icon-btn" aria-label="Log out" title="Log out" onClick={onLogout}>
            ⎋
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
