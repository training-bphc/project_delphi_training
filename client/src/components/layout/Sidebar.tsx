import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Button } from "@/components/ui/button";
import "./Sidebar.css";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const identityLines =
    user?.role === "admin"
      ? [user.name || "Training Unit", user.email]
      : [user?.name || "Student", user?.email || "", user?.id || ""];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path: string, sectionPath: string) => {
    // If already in this section, navigate to its default page
    if (location.pathname.startsWith(sectionPath)) {
      navigate(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    const pathname = location.pathname;
    // Exact match or starts with path/ (for nested routes)
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-title">{identityLines[0]}</p>
        <p className="sidebar-subtitle">{identityLines[1]}</p>
        {user?.role === "student" && identityLines[2] && (
          <p className="sidebar-meta">{identityLines[2]}</p>
        )}
      </div>

      <nav className="sidebar-nav">
        {user?.role === "admin" ? (
          <>
            <button
              onClick={() => handleNavigation("/admin/training-points", "/admin/training-points")}
              className={isActive("/admin/training-points") ? "nav-link active" : "nav-link"}
            >
              Training Points 
            </button>
            <button
              onClick={() => handleNavigation("/admin/pending", "/admin/pending")}
              className={isActive("/admin/pending") ? "nav-link active" : "nav-link"}
            >
              Pending Requests
            </button>
            <button
              onClick={() => handleNavigation("/admin/verified", "/admin/verified")}
              className={isActive("/admin/verified") ? "nav-link active" : "nav-link"}
            >
              Previous Verifications
            </button>
            <button
              onClick={() => handleNavigation("/admin/resources", "/admin/resources")}
              className={isActive("/admin/resources") ? "nav-link active" : "nav-link"}
            >
              Resources
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleNavigation("/student/training", "/student/training")}
              className={isActive("/student/training") ? "nav-link active" : "nav-link"}
            >
              Training Points
            </button>
            <button
              onClick={() => handleNavigation("/student/verification", "/student/verification")}
              className={isActive("/student/verification") ? "nav-link active" : "nav-link"}
            >
              Verification Requests
            </button>
            <button
              onClick={() => handleNavigation("/student/resources", "/student/resources")}
              className={isActive("/student/resources") ? "nav-link active" : "nav-link"}
            >
              Resources
            </button>
          </>
        )}
      </nav>
      <Button onClick={handleLogout} className="logout-btn">
        Logout
      </Button>
    </aside>
  );
}

export default Sidebar;
