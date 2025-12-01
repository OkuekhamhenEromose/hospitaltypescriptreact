// App.tsx - Updated with admin blog editor route
import React, { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadSpinner';
import AuthCallback from './components/AuthCallback';

// Define component prop types
interface BlogProps {
  onPostClick?: (slug: string) => void;
}

interface BlogPostDetailProps {
  slug: string;
  onBack?: () => void;
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
const BlogPostDetail = lazy(() => import('./pages/blog/BlogPostDetail')) as ComponentType<BlogPostDetailProps>;
const Contact = lazy(() => import('./pages/Contact'));
const AuthModal = lazy(() => import('./pages/authform/AuthModal'));
const DashboardRouter = lazy(() => import('./pages/DashboardRouter'));
const BlogEditor = lazy(() => import('./pages/blog/BlogEditor')); // Add this import

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component - only accessible to admins
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user is admin
  if (user.profile?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public route component - redirects to dashboard if user is logged in
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

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

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  // Handle profile click - navigate to dashboard
  const handleProfileClick = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  // Blog post detail wrapper component
  const BlogPostDetailWrapper: React.FC = () => {
    const slug = useLocation().pathname.split('/').pop() || '';
    
    return (
      <BlogPostDetail 
        slug={slug} 
        onBack={() => navigate('/blog')} 
      />
    );
  };

  return (
    <>
      <Layout
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
      >
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* Public Routes - accessible to all */}
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
              element={<BlogPostDetailWrapper />}
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

            {/* Admin Blog Editor Route */}
            <Route
              path="/admin/blog/edit/:slug"
              element={
                <AdminRoute>
                  <BlogEditor />
                </AdminRoute>
              }
            />

            {/* Auth routes - redirect to home if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Navigate to="/" replace />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Navigate to="/" replace />
                </PublicRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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