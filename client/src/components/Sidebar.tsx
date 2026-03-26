import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const identityLines = user?.role === 'admin'
    ? [user.name || 'Training Unit', user.email]
    : [user?.name || 'Student', user?.email || '', user?.id || ''];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-title">{identityLines[0]}</p>
        <p className="sidebar-subtitle">{identityLines[1]}</p>
        {user?.role === 'student' && identityLines[2] && (
          <p className="sidebar-meta">{identityLines[2]}</p>
        )}
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'admin' ? (
          <>
            <NavLink
              to="/admin/overview"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Overview
            </NavLink>
            <NavLink
              to="/admin/pending"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Pending Requests
            </NavLink>
            <NavLink
              to="/admin/verified"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Previous Verifications
            </NavLink>
            <NavLink
              to="/admin/resources"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Resources
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/student/training"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Training Points
            </NavLink>
            <NavLink
              to="/student/resources"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Resources
            </NavLink>
          </>
        )}
      </nav>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </aside>
  );
}

export default Sidebar;
