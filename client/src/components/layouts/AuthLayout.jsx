import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../common/Loader';
import { ROLES } from '../../utils/constants';

export const AuthLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to correct dashboard based on role
    const dashboardRoutes = {
      [ROLES.HR_ADMIN]: '/dashboard/hr',
      [ROLES.MANAGER]: '/dashboard/manager',
      [ROLES.EMPLOYEE]: '/dashboard/employee',
      [ROLES.LEADERSHIP]: '/dashboard/leadership',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/dashboard/employee'} replace />;
  }

  return (
    <div className="min-h-screen bg-charcoal-bg page-fade-in">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
