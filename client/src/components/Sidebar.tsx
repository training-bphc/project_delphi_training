import type { CSSProperties } from "react";

function Sidebar() {
  return (
    <div style={sidebarStyle}>

      <div style={profileCardStyle}> 
        <span style={profileNameStyle}> Username </span>
      </div>

      <nav style={navStyle}>

        <div style={{...navItemStyle, ...activeNavItemStyle}}>
          Dashboard
        </div>

        <div style={navItemStyle}> Resources </div>
        <div style={navItemStyle}> Assessments </div>
        <div style={navItemStyle}> Interviews </div>
        <div style={navItemStyle}> Training Points </div>
        <div style={navItemStyle}> Analytics </div>
        <div style={navItemStyle}> Events </div>
      </nav>
    </div>
  );
}

const sidebarStyle : CSSProperties = {
  height: "100%",
  // width: "220px",
  padding: "24px 10px",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  color: "#f5f5f5",
  boxSizing: "border-box" as const,
};

const navItemStyle : CSSProperties = {
  marginBottom: "20px",
  cursor: "pointer",
  fontSize: "14px",
  opacity: 0.9,
  textAlign: "center" as const,
  padding: "8px 10px"
};

const activeNavItemStyle : CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  opacity: 1,
}

const profileCardStyle : CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center" as const
}

const profileNameStyle : CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
}

/* const headerStyle : CSSProperties = {
  marginTop: 0,
  marginBottom: "32px",
  fontSize: "16px",
  fontWeight: 600
} */

const navStyle : CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}



export default Sidebar;

