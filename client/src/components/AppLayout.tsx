import Sidebar from "./Sidebar";

type AppLayoutProps = {
    children: React.ReactNode;
}

function AppLayout({children} : AppLayoutProps) {
    return (
        <div style={layoutStyle}> 
            <Sidebar/>
            <main style={mainStyle}> {children} </main> 
        </div>
    )
}

const layoutStyle = {
    display: "flex",
    minHeight: "100vh",
}

const mainStyle = {
    flex: 1,
    padding: "24px",
}

export default AppLayout