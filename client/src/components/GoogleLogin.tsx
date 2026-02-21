import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';

function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      
      // Try student login first
      try {
        await login(idToken, 'student');
        navigate('/student/training');
        return;
      } catch (studentError: any) {
        // If student login fails, try admin
        console.log('Student login failed, trying admin:', studentError.message);
        try {
          await login(idToken, 'admin');
          navigate('/admin/overview');
          return;
        } catch (adminError: any) {
          console.error('Both student and admin login failed:', adminError.message);
          alert('Login failed: ' + (adminError.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      alert('Login failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleGoogleError = () => {
    console.log('Google login failed');
    alert('Google login failed. Please try again.');
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
