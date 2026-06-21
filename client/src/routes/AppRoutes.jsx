import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

// Layouts
import AuthLayout from '../components/layouts/AuthLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';
import PublicLayout from '../components/layouts/PublicLayout';

// Pages
import LandingPage from '../pages/Landing/LandingPage';
import Login from '../pages/Auth/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import EmployeeDashboard from '../pages/Dashboard/EmployeeDashboard';
import ManagerDashboard from '../pages/Dashboard/ManagerDashboard';
import HRDashboard from '../pages/Dashboard/HRDashboard';
import LeadershipDashboard from '../pages/Dashboard/LeadershipDashboard';
import EmployeeList from '../pages/Employees/EmployeeList';
import EmployeeDetail from '../pages/Employees/EmployeeDetail';
import OrgChart from '../pages/Employees/OrgChart';
import AttendanceDashboard from '../pages/Attendance/AttendanceDashboard';
import LeaveRequests from '../pages/Leave/LeaveRequests';
import PendingApprovals from '../pages/Workflow/PendingApprovals';
import Reports from '../pages/Reports/Reports';
import Notifications from '../pages/Notifications/Notifications';
import MyProfile from '../pages/Profile/MyProfile';

// Guard component for Role-based Access Control
const RoleGuard = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own dashboard if not authorized
    const defaultDash = {
      [ROLES.EMPLOYEE]: '/dashboard/employee',
      [ROLES.MANAGER]: '/dashboard/manager',
      [ROLES.HR_ADMIN]: '/dashboard/hr',
      [ROLES.LEADERSHIP]: '/dashboard/leadership',
    }[user.role] || '/dashboard/employee';

    return <Navigate to={defaultDash} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />
      </Route>

      {/* Auth Guarded Layout (Unauthenticated users only) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Dashboard Protected Layout (Authenticated users only) */}
      <Route element={<DashboardLayout />}>
        {/* Dashboards */}
        <Route
          path="/dashboard/employee"
          element={
            <RoleGuard allowedRoles={[ROLES.EMPLOYEE, ROLES.HR_ADMIN]}>
              <EmployeeDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.HR_ADMIN]}>
              <ManagerDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/hr"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN]}>
              <HRDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/leadership"
          element={
            <RoleGuard allowedRoles={[ROLES.LEADERSHIP, ROLES.HR_ADMIN]}>
              <LeadershipDashboard />
            </RoleGuard>
          }
        />

        {/* Directory & Profiles */}
        <Route
          path="/employees"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.LEADERSHIP]}>
              <EmployeeList />
            </RoleGuard>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.LEADERSHIP]}>
              <EmployeeDetail />
            </RoleGuard>
          }
        />
        <Route
          path="/org-chart"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN, ROLES.LEADERSHIP, ROLES.MANAGER]}>
              <OrgChart />
            </RoleGuard>
          }
        />

        {/* Attendance */}
        <Route
          path="/attendance"
          element={
            <RoleGuard allowedRoles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN]}>
              <AttendanceDashboard />
            </RoleGuard>
          }
        />

        {/* Leaves */}
        <Route
          path="/leave"
          element={
            <RoleGuard allowedRoles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN]}>
              <LeaveRequests />
            </RoleGuard>
          }
        />

        {/* Approvals */}
        <Route
          path="/approvals"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.LEADERSHIP]}>
              <PendingApprovals />
            </RoleGuard>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={[ROLES.HR_ADMIN, ROLES.LEADERSHIP]}>
              <Reports />
            </RoleGuard>
          }
        />

        {/* Inbox Alerts */}
        <Route
          path="/notifications"
          element={
            <RoleGuard allowedRoles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN, ROLES.LEADERSHIP]}>
              <Notifications />
            </RoleGuard>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <RoleGuard allowedRoles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN, ROLES.LEADERSHIP]}>
              <MyProfile />
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
