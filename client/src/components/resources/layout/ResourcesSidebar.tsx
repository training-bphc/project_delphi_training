import styles from "../resources.module.css";

interface ResourcesSidebarProps {
  canManage: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
}

function ResourcesSidebar({ canManage, activePage, onNavigate }: ResourcesSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarTitle}>Resources</h3>
        <button
          className={`${styles.sidebarItem} ${activePage === "resources" ? styles.active : ""}`}
          onClick={() => onNavigate("resources")}
        >
          📚 Resources
        </button>
      </div>

      {canManage && (
        <>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Management</h3>
            <button
              className={`${styles.sidebarItem} ${activePage === "add" ? styles.active : ""}`}
              onClick={() => onNavigate("add")}
            >
              ➕ Add Resource
            </button>
            <button
              className={`${styles.sidebarItem} ${activePage === "view" ? styles.active : ""}`}
              onClick={() => onNavigate("view")}
            >
              👁️ View Resources
            </button>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Analytics</h3>
            <button
              className={`${styles.sidebarItem} ${activePage === "analysis" ? styles.active : ""}`}
              onClick={() => onNavigate("analysis")}
            >
              📊 Resource Analysis
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default ResourcesSidebar;