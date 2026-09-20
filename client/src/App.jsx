import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddExperience from './pages/AddExperience';
import ReviewQueue from './pages/ReviewQueue';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import MyExperiences from './pages/MyExperiences';
import ExportProfile from './pages/ExportProfile';
import StudentRecords from './pages/StudentRecords';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { currentReviewer, currentAdmin } from './data/mockData';
import './App.css';

function initialsOf(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Maps each route to the role/persona whose sidebar + header should render.
// Reflects that Experience Ledger has three real personas (student, mentor,
// placement/admin) sharing one app shell, per the PRD's role-based access model.
// Student routes resolve `user` to the real authenticated account at render time (see
// AppRoutes) instead of a fixed mock, since this persona IS the actual logged-in user -
// unlike Mentor/Placement Cell, which are demo-only previews anyone can switch into.
const ROUTE_CONFIG = [
  { path: '/', role: 'student', element: <Dashboard /> },
  { path: '/add-experience', role: 'student', element: <AddExperience /> },
  { path: '/my-experiences', role: 'student', element: <MyExperiences /> },
  { path: '/export-profile', role: 'student', element: <ExportProfile /> },
  { path: '/review-queue', role: 'reviewer', user: currentReviewer, element: <ReviewQueue /> },
  { path: '/analytics', role: 'admin', user: currentAdmin, element: <Analytics /> },
  { path: '/student-records', role: 'admin', user: currentAdmin, element: <StudentRecords /> },
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
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Require both a token AND a parsed user object - a token with no user (e.g. corrupted
  // localStorage) would otherwise crash every page that reads user.name unconditionally.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AppRoutes() {
  const { user: authUser } = useAuth();

  // Real logged-in identity for the Student persona - Mentor/Placement Cell stay mock
  // since they're demo-only previews, not a role you can actually authenticate as here.
  const studentUser = authUser && {
    name: authUser.name,
    role: 'Student',
    avatarInitials: initialsOf(authUser.name),
  };

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
              <Layout role={role} user={role === 'student' ? studentUser : user}>
                <RoleSwitcher />
                {element}
              </Layout>
            </RequireAuth>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
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
