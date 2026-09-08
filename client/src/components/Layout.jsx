import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/useAuth';
import './Layout.css';

function Layout({ role, user, children }) {
  const { logout } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="app-layout-main">
        <Header user={user} onLogout={logout} />
        <main className="app-layout-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
