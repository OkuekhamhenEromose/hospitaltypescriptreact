// pages/AuthCallback.tsx - CLEANED UP VERSION
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access');
      const refreshToken = urlParams.get('refresh');
      const userId = urlParams.get('user_id');
      const email = urlParams.get('email');
      const isNewUser = urlParams.get('is_new_user') === 'true';

      console.log('🔐 Google OAuth Callback:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        userId,
        email,
        isNewUser
      });

      if (accessToken && refreshToken) {
        // Save tokens to localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        console.log('✅ Tokens saved to localStorage');

        // Fetch the full user data to verify login
        try {
          const dashboardData = await apiService.getDashboard();
          console.log('✅ Google OAuth successful! Dashboard:', dashboardData);
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000); // Small delay to show loading state
        } catch (error) {
          console.error('Failed to fetch dashboard after Google auth:', error);
          
          // If dashboard fails, try to login with the tokens
          try {
            // Create a simple login with the access token
            const response = await fetch('https://dhospitalback.onrender.com/api/users/dashboard/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('✅ Direct dashboard fetch successful:', userData);
              navigate('/dashboard');
            } else {
              console.error('Direct dashboard fetch failed:', await response.text());
              navigate('/login?error=dashboard_fetch_failed');
            }
          } catch (secondError) {
            console.error('All auth methods failed:', secondError);
            navigate('/login?error=auth_failed');
          }
        }
      } else {
        console.error('❌ No tokens in Google OAuth callback');
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