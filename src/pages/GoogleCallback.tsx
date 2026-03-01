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

      if (error) {
        navigate('/?authError=google_auth_failed&message=' + encodeURIComponent(error));
        return;
      }

      if (!code) {
        navigate('/?authError=no_auth_code');
        return;
      }

      try {
        await loginWithGoogle(code);
        navigate('/dashboard');
      } catch (err: any) {
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