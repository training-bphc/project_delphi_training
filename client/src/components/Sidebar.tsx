import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Training Points</h2>
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
              New & Pending Records for Verification
            </NavLink>
            <NavLink
              to="/admin/verified"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Previous Verifications
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
          </>
        )}
      </nav>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </aside>
  );
}

export default Sidebar;
