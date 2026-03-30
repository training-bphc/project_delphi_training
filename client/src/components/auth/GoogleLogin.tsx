import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";

function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const shouldFallbackFromAdminToStudent = (message: string): boolean => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("not a registered admin") ||
      normalized.includes("unauthorized: not a registered admin")
    );
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;

      // Try admin first. If not an admin, fall back to student in the same attempt.
      try {
        await login(idToken, "admin");
        navigate("/admin/overview");
        return;
      } catch (adminError: any) {
        const adminMessage = adminError?.message || "Unknown error";

        if (!shouldFallbackFromAdminToStudent(adminMessage)) {
          throw adminError;
        }

        try {
          await login(idToken, "student");
          navigate("/student/training");
          return;
        } catch (studentError: any) {
          console.error(
            "Both admin and student login failed:",
            studentError.message,
          );
          alert("Login failed: " + (studentError.message || "Unknown error"));
        }
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      alert("Login failed: " + (error.message || "Unknown error"));
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    alert("Google login failed. Please try again.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      auto_select={false}
    />
  );
}

export default GoogleLoginButton;
