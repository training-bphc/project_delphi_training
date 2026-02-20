import type { CSSProperties } from "react";
import Sidebar from "./Sidebar";

// Props for AppLayout: expects children (main content)
type AppLayoutProps = {
  children: React.ReactNode;
};

// AppLayout arranges the sidebar and main content side by side
function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={layoutStyle}>
      {/* Sidebar on the left */}
      <Sidebar />
      {/* Main content area */}
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

// Layout styles for flex row
const layoutStyle: CSSProperties = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  fontFamily: "inter, Helvetica, Arial",
};

// Main content area styles
const mainStyle: CSSProperties = {
  flex: 1,
  backgroundColor: "#f7f7f7",
  padding: "48px 56px",
  overflowY: "auto",
  boxSizing: "border-box" as const,
};

export default AppLayout;
