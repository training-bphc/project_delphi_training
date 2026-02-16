function Sidebar() {
    return (
        <div style={sidebarStyle}>
            <h3 style={{marginTop: 0}}> Sidebar Text </h3>
            <nav>
                <p> Home </p>
                <p> Training Points </p>
                <p> Settings </p>
            </nav>
        </div>
    )
}

const sidebarStyle = {
    width: "220px",
    padding: "24px 10px",
    borderRight: "1px solid #eee",
    boxSizing: "border-box" as const,
}

export default Sidebar