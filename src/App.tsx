// App.tsx - Updated with React Router for proper URL routing
import React, { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadSpinner';

// Define component prop types
interface BlogProps {
  onPostClick?: (slug: string) => void;
}

interface HomeProps {
  onBlogPostClick?: (slug: string) => void;
}

// Lazy imports with proper typing
const Home = lazy(() => import('./pages/home/Home')) as ComponentType<HomeProps>;
const AboutUs = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Packages = lazy(() => import('./pages/Package'));
const Blog = lazy(() => import('./pages/blog/Blog')) as ComponentType<BlogProps>;
const BlogPostDetail = lazy(() => import('./pages/blog/BlogPostDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const AuthModal = lazy(() => import('./pages/authform/AuthModal'));
const DashboardRouter = lazy(() => import('./pages/DashboardRouter'));

// Wrapper component to handle routing logic
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'home';
    return path === '' ? 'home' : path;
  };

  // Handle navigation
  const handleNavigate = (page: string) => {
    // Map page names to routes
    const routeMap: { [key: string]: string } = {
      'home': '/',
      'about us': '/about-us',
      'services': '/services',
      'packages': '/packages',
      'blog': '/blog',
      'contact': '/contact',
    };

    const route = routeMap[page.toLowerCase()] || '/';
    navigate(route);
  };


  // Protected route component
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    React.useEffect(() => {
      if (!user) {
        setShowAuthModal(true);
      }
    }, [user]);

    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <>
      <Layout
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        onLoginClick={() => setShowAuthModal(true)}
      >
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                  <Home onBlogPostClick={(slug) => navigate(`/blog/${slug}`)} />
              }
            />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/packages" element={<Packages />} />
            <Route
              path="/blog"
              element={<Blog onPostClick={(slug) => navigate(`/blog/${slug}`)} />}
            />
            <Route
              path="/blog/:slug"
              element={<BlogPostDetail />}
            />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;