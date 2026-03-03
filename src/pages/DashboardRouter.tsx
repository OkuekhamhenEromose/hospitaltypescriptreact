import { useState, useEffect } from 'react';
// components/DashboardRouter.tsx
import React, { lazy, Suspense, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

// Icon verification component
const IconVerificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    // Import I from AdminDashboard or wherever it's defined
    import('./role_based_dashboards/AdminDashboard').then(module => {
      const I = (module as any).I;
      
      // Verify that all required icons exist
      const requiredIcons = ['Logo', 'Home', 'Users', 'User', 'UserPlus', 'FileText', 
        'BarChart', 'Bell', 'Search', 'ChevDown', 'ChevLeft', 'X', 'Filter', 
        'Download', 'Plus', 'Edit', 'Trash', 'Eye', 'Calendar', 'Clock', 
        'Shield', 'Stethoscope', 'Flask', 'RefreshCw', 'Activity', 'Check'];
      
      if (I) {
        const missingIcons = requiredIcons.filter(icon => !I[icon]);
        
        if (missingIcons.length > 0) {
          console.error('Missing icons:', missingIcons);
        }
      } else {
        console.warn('Icon library I not found');
      }
      
      setIconsLoaded(true);
    }).catch(error => {
      console.error('Failed to load icon library:', error);
      setIconsLoaded(true); // Still set to true to render children
    });
  }, []);

  if (!iconsLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

const DashboardRouter: React.FC = React.memo(() => {
  const { user, loading } = useAuth();

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

  const userRole = user.profile?.role || (user as any).role;

  const DashboardComponent = useMemo(() => {
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
  }, [userRole]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Wrap with IconVerificationWrapper only for admin dashboard */}
        {userRole === 'ADMIN' ? (
          <IconVerificationWrapper>
            <DashboardComponent />
          </IconVerificationWrapper>
        ) : (
          <DashboardComponent />
        )}
      </Suspense>
    </ErrorBoundary>
  );
});

DashboardRouter.displayName = 'DashboardRouter';

export default DashboardRouter;