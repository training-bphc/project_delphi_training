import { GoogleOAuthProvider } from '@react-oauth/google';
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
  // Get Google Client ID from Vite env
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div style={containerStyle}>
        <h1>Error</h1>
        <p>Google Client ID not configured. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div style={containerStyle}>
        <h1 style={{ marginBottom: "4px" }}> Project Delphi </h1>
        <p style={{ marginTop: 0, marginBottom: "16px" }}>
          {" "}
          A Training Unit Website{" "}
        </p>
        <GoogleLoginButton />
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
