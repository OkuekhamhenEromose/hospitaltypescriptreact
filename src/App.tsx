import React, { lazy, Suspense, useMemo } from "react";
import type { ComponentType } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadSpinner";
import ScrollToTop from "./components/ScrollToTop";
import AuthError from "./pages/AuthError";

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

const Home = lazy(
  () => import("./pages/home/Home"),
) as ComponentType<HomeProps>;
const AboutUs = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Packages = lazy(() => import("./pages/Package"));
const Blog = lazy(
  () => import("./pages/blog/Blog"),
) as ComponentType<BlogProps>;
const BlogPostDetail = lazy(
  () => import("./pages/blog/BlogPostDetail"),
) as ComponentType<BlogPostDetailProps>;
const Contact = lazy(() => import("./pages/Contact"));
const AuthModal = lazy(() => import("./pages/authform/AuthModal"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const BlogEditor = lazy(() => import("./pages/blog/BlogEditor"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.profile?.role !== "ADMIN")
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const BlogPostDetailWrapper: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  return <BlogPostDetail slug={slug} onBack={() => navigate("/blog")} />;
};

const PATH_TO_PAGE: Record<string, string> = {
  "": "home",
  home: "home",
  "about-us": "about us",
  services: "services",
  packages: "packages",
  blog: "blog",
  contact: "contact",
};

const ROUTE_MAP: Record<string, string> = {
  home: "/",
  "about us": "/about-us",
  services: "/services",
  packages: "/packages",
  blog: "/blog",
  contact: "/contact",
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = React.useState(false);

  const currentPage = useMemo(() => {
    const segment = location.pathname.split("/")[1] ?? "";
    return PATH_TO_PAGE[segment] ?? "home";
  }, [location.pathname]);

  const handleNavigate = (page: string) => {
    navigate(ROUTE_MAP[page.toLowerCase()] ?? "/");
  };

  return (
    <>
      <ScrollToTop />
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLoginClick={() => setShowAuth(true)}
        onProfileClick={() => user && navigate("/dashboard")}
      >
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
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
              element={
                <Blog onPostClick={(slug) => navigate(`/blog/${slug}`)} />
              }
            />
            <Route path="/blog/:slug" element={<BlogPostDetailWrapper />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/auth/error" element={<AuthError />} />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/new"
              element={
                <AdminRoute>
                  <BlogEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog/edit/:slug"
              element={
                <AdminRoute>
                  <BlogEditor />
                </AdminRoute>
              }
            />

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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>

      {showAuth && (
        <Suspense
          fallback={<LoadingSpinner message="Loading authentication..." />}
        >
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </Suspense>
      )}
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
