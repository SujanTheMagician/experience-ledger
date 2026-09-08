import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/useAuth';
import './Layout.css';

function Layout({ role, user, children }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="app-layout-main">
        <Header user={user} onLogout={logout} onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-layout-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
