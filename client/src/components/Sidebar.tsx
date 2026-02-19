import SidebarButton from "./layout/SidebarButton";
import styles from "./layout/sidebar.module.css"

// Temporary, until routing comes
//TODO: setup routing and dynamic functionality
const sidebarTitle = "Training Points";
const activeItemId = "overview";

const SIDEBAR_ITEMS = [
  {
    id: "overview", label: "Overview"
  },
  {
    id: "addhackathon", label: "View Records for Verification"
  },
  // {
  //   id: "verify", label: "Verification Requests"
  // }
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>
          {sidebarTitle}
        </span>
      </div>

      <nav className={styles.nav}> 
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarButton key={item.id} label={item.label} active={item.id === activeItemId} onClick={() => {
            //Routing later
          }}
          />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
