import type { CSSProperties } from "react";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={layoutStyle}>
      <aside style={sidebarWrapperStyle}>
        <Sidebar />
      </aside>

      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const layoutStyle : CSSProperties = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  fontFamily: "inter, Helvetica, Arial",
};

const sidebarWrapperStyle : CSSProperties = {
  width: "17%",
  minWidth: "260px",
  backgroundColor: "#2b2b2b",
  height: "100vh"
};

const mainStyle : CSSProperties = {
  flex: 1,
  backgroundColor: "#f7f7f7",
  padding: "48px 56px",
  overflowY: "auto",
  boxSizing: "border-box" as const
};

export default AppLayout;

