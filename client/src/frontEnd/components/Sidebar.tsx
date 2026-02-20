import SidebarButton from "./layout/SidebarButton";
import styles from "./layout/sidebar.module.css";

import { useLocation, useNavigate } from "react-router-dom";

// Sidebar title
const sidebarTitle = "Training Points";

// Sidebar navigation items with route paths
const SIDEBAR_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    path: "/overview",
  },
  {
    id: "newandpendingrecordsforverification",
    label: "New & Pending Records for Verification",
    path: "/pending-records",
  },
  {
    id: "previousverifications",
    label: "Previous Verifications",
    path: "/previous-verifications",
  },
];

// Sidebar component renders navigation on the left
function Sidebar() {
  const location = useLocation(); // Get current route
  const navigate = useNavigate(); // Navigation function

  return (
    <aside className={styles.sidebar}>
      {/* Sidebar header/title */}
      <header className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>{sidebarTitle}</span>
      </header>
      {/* Navigation buttons */}
      <nav className={styles.nav}>
        {SIDEBAR_ITEMS.map(({ id, label, path }) => (
          <SidebarButton
            key={id}
            label={label}
            active={location.pathname === path}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
