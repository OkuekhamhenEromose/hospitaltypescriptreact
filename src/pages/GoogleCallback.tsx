// In GoogleCallback.tsx - UPDATED
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('🔍 Google Callback - Code received:', code ? 'Yes' : 'No');
      console.log('🔍 Google Callback - Error:', error || 'None');

      if (error) {
        console.error('❌ Google OAuth error:', error);
        navigate('/?authError=google_auth_failed&message=' + encodeURIComponent(error));
        return;
      }

      if (!code) {
        console.error('❌ No authorization code from Google');
        navigate('/?authError=no_auth_code');
        return;
      }

      try {
        console.log('🔐 Processing Google OAuth code:', code.substring(0, 20) + '...');

        // Use the AuthContext loginWithGoogle function
        await loginWithGoogle(code);

        console.log('✅ Google OAuth successful! Redirecting to dashboard...');
        
        // Redirect to dashboard
        navigate('/dashboard');

      } catch (err: any) {
        console.error('❌ Google OAuth failed:', err);
        navigate(`/?authError=${encodeURIComponent(err.message || 'Authentication failed')}`);
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams, loginWithGoogle]);

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

export default GoogleCallback;