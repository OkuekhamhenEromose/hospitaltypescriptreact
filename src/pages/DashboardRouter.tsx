// components/DashboardRouter.tsx
import React, { lazy, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load dashboard components for faster initial load
const PatientDashboard = lazy(() => import('./role_based_dashboards/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./role_based_dashboards/DoctorDashboard'));
const NurseDashboard = lazy(() => import('./role_based_dashboards/NurseDashboard'));
const LabScientistDashboard = lazy(() => import('./role_based_dashboards/LabscientistDashboard'));
const AdminDashboard = lazy(() => import('./role_based_dashboards/AdminDashboard'));

// Fallback component for unknown roles
const UnknownRoleDashboard: React.FC<{ role?: string }> = ({ role }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Unknown User Role</h2>
      <p className="text-gray-600">Role: {role || 'Not specified'}</p>
      <p className="text-sm text-gray-500 mt-2">Please contact support for assistance.</p>
    </div>
  </div>
);

const DashboardRouter: React.FC = React.memo(() => {
  const { user, loading } = useAuth();
  const userRole = user?.profile?.role ?? 'UNKNOWN';

  // Determine which component to render based on role
  const DashboardComponent: React.ComponentType = (() => {
    switch (userRole) {
      case 'PATIENT':
        return PatientDashboard;
      case 'DOCTOR':
        return DoctorDashboard;
      case 'NURSE':
        return NurseDashboard;
      case 'LAB':
        return LabScientistDashboard;
      case 'ADMIN':
        return AdminDashboard;
      default:
        return () => <UnknownRoleDashboard role={userRole} />;
    }
  })();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in to access the dashboard</h2>
          <p className="text-gray-600">You need to be authenticated to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardComponent />
      </Suspense>
    </ErrorBoundary>
  );
});

DashboardRouter.displayName = 'DashboardRouter';

export default DashboardRouter;