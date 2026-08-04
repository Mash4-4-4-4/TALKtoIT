import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSuccess = async (response: CredentialResponse) => {
    try {
      if (!response.credential) return;

      await axios.post('/auth/google', { credential: response.credential });

      await auth?.checkStatus(); // refresh AuthContext state from the new cookie
      navigate('/chat');
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  return (
    <div className="google-login-wrapper">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('Google login failed')}
        theme="outline"
        size="large"
        shape="pill"
        width="320"
      />
    </div>
  );
}