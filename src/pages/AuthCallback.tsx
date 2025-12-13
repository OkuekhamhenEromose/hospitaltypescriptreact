// pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access');
      const refreshToken = urlParams.get('refresh');
    //   const userId = urlParams.get('user_id');
    //   const email = urlParams.get('email');

      if (accessToken && refreshToken) {
        // Save tokens to localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle error
        navigate('/auth/error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;