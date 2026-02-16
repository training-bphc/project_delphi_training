import type { CSSProperties } from "react";
import GoogleLoginButton from "../components/GoogleLogin.tsx";

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};

function Login() {
  return (
    <div style={containerStyle}>
      <h1> Project Delphi </h1>
      <p> A Training Unit Website </p>
      <GoogleLoginButton />
    </div>
  );
}

export default Login;
