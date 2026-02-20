import type { CSSProperties } from "react";
import GoogleLoginButton from "../components/GoogleLogin";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  fontFamily: "Inter, Helvetica, Arial",
  transform: "translateY(-40px)",
};

function Login() {
  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "4px" }}> Project Delphi </h1>
      <p style={{ marginTop: 0, marginBottom: "16px" }}>
        {" "}
        A Training Unit Website{" "}
      </p>
      <GoogleLoginButton />
    </div>
  );
}

export default Login;
