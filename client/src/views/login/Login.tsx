import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GoogleLoginButton from "../../components/auth/GoogleLogin";
import { useAuth } from "../../contexts/auth";
import styles from "./Login.module.css";
import { Button } from "@/components/ui/button";

function Login() {
  const { devLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isDev = import.meta.env.DEV;
  const enableDevLogin = import.meta.env.VITE_ENABLE_DEV_LOGIN === "true";

  const handleDevLogin = async (email: string, role: "student" | "admin") => {
    try {
      await devLogin(email, role);
      navigate(role === "admin" ? "/admin/training-points" : "/student/training");
    } catch (error: any) {
      toast.error("Dev login failed: " + (error.message || "Unknown error"));
    }
  };

  if (!googleClientId && !isDev) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p>
          Google Client ID not configured. Please check your environment
          variables.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || "dev-placeholder"}>
      <div className={styles.page}>
        <div className={styles.panel}>
          <img src="/delphi.png" alt="project delphi logo" />
          {/* <h1 className={styles.heading}>Project Delphi</h1> */}
          <p className={styles.subheading}>A Training Unit Website</p>

          {googleClientId ? (
            <GoogleLoginButton />
          ) : (
            <p className={styles.devNotice}>
              Google login disabled in local dev.
            </p>
          )}

          {isDev && enableDevLogin && (
            <div className={styles.devActions}>
              <Button
              className={styles.devButton}
                disabled={isLoading}
                onClick={() =>
                  handleDevLogin(
                    "f20240546@hyderabad.bits-pilani.ac.in",
                    "student",
                  )
                }
              >
                Dev Login as Student
              </Button>

              <Button
                className={styles.devButton}
                disabled={isLoading}
                onClick={() =>
                  handleDevLogin("admin@hyderabad.bits-pilani.ac.in", "admin")
                }
              >
                Dev Login as Admin
              </Button>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
