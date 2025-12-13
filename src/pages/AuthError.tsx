// pages/AuthError.tsx
// import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          {errorMessage}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthError;