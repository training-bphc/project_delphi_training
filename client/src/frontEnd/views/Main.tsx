import AppLayout from "../components/AppLayout";

function Main() {
  return (
    <AppLayout>
      <div style={contentWrapperStyle}>
        <h1 style={headingStyle}>
          Hello, <span style={{ fontWeight: 700 }}> Username. </span>
        </h1>

        <p style={subtextStyle}>
          Here's an overview of your training progress.
        </p>

        <div style={cardsGridStyle}>
          <div style={cardLargeStyle}>
            <h2 style={cardTitleStyle}> Training Points </h2>
            <p>
              {" "}
              You currently have <strong> 0 </strong> training points.{" "}
            </p>
          </div>
          <div style={cardLargeStyle} />
        </div>

        <div style={listGridStyle}>
          <div style={pillStyle} />
          <div style={pillStyle} />
          <div style={pillStyle} />
          <div style={pillStyle} />
        </div>
      </div>
    </AppLayout>
  );
}

const contentWrapperStyle = {
  maxWidth: "900px",
};

const headingStyle = {
  marginTop: 0,
  marginBottom: "8px",
  fontSize: "32px",
  fontWeight: 400,
};

const subtextStyle = {
  marginTop: 0,
  marginBottom: "40px",
  color: "#555",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "32px",
  marginBottom: "32px",
};

const cardLargeStyle = {
  padding: "24px",
  height: "160px",
  borderRadius: "12px",
  backgroundColor: "#e0e0e0",
  boxSizing: "border-box" as const,
};

const cardTitleStyle = {
  marginTop: 0,
  marginBottom: "8px",
};

const listGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 32px",
};

const pillStyle = {
  height: "36px",
  borderRadius: "8px",
  backgroundColor: "#e0e0e0",
};

/* const cardStyle = {
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    maxWidth: "480px"
}
 */

export default Main;
