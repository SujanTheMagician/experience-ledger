import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddExperience from './pages/AddExperience';
import ReviewQueue from './pages/ReviewQueue';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { currentStudent, currentReviewer, currentAdmin } from './data/mockData';
import './App.css';

// Maps each route to the role/persona whose sidebar + header should render.
// Reflects that Experience Ledger has three real personas (student, mentor,
// placement/admin) sharing one app shell, per the PRD's role-based access model.
const ROUTE_CONFIG = [
  { path: '/', role: 'student', user: currentStudent, element: <Dashboard /> },
  { path: '/add-experience', role: 'student', user: currentStudent, element: <AddExperience /> },
  { path: '/review-queue', role: 'reviewer', user: currentReviewer, element: <ReviewQueue /> },
  { path: '/analytics', role: 'admin', user: currentAdmin, element: <Analytics /> },
];

function RoleSwitcher() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Student View' },
    { to: '/review-queue', label: 'Mentor View' },
    { to: '/analytics', label: 'Placement Cell View' },
  ];

  return (
    <div className="role-switcher">
      <span className="role-switcher-label">Preview as:</span>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={'role-switcher-link' + (location.pathname === link.to ? ' role-switcher-link-active' : '')}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {ROUTE_CONFIG.map(({ path, role, user, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <RequireAuth>
              <Layout role={role} user={user}>
                <RoleSwitcher />
                {element}
              </Layout>
            </RequireAuth>
          }
        />
      ))}
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
