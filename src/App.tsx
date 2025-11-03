import React, { lazy, Suspense, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadSpinner';

const Home = lazy(() => import('./pages/home/Home'));
const AboutUs = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));

const AuthModal = lazy(() => import('./pages/authform/AuthModal'));
const DashboardRouter = lazy(() => import('./pages/DashboardRouter'));

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const renderPage = useCallback(() => {
    if (user) {
      return <DashboardRouter />;
    }

    switch (currentPage) {
      case 'about us':
        return <AboutUs />;
      case 'services':
        return <Services />;
      case 'home':
      default:
        return <Home />;
    }
  }, [user, currentPage]);

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLoginClick={() => setShowAuthModal(true)}
      >
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          {renderPage()}
        </Suspense>
      </Layout>

      {showAuthModal && (
        <Suspense fallback={<LoadingSpinner message="Loading authentication..." />}>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </Suspense>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
