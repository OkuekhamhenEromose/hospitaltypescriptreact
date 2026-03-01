import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access');
      const refreshToken = urlParams.get('refresh');

      if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        try {
          await apiService.getDashboard();
          setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
          try {
            const response = await fetch('https://hospitalback-clean.onrender.com/api/users/dashboard/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              navigate('/dashboard');
            } else {
              navigate('/login?error=dashboard_fetch_failed');
            }
          } catch (secondError) {
            navigate('/login?error=auth_failed');
          }
        }
      } else {
        navigate('/login?error=google_auth_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google authentication...</p>
        <p className="mt-2 text-sm text-gray-500">You will be redirected to your dashboard shortly</p>
      </div>
    </div>
  );
};

export default AuthCallback;