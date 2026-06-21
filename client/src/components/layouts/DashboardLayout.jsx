import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { Spinner } from '../common/Loader';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-charcoal-bg flex">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[280px]">
        {/* Top Navbar */}
        <Navbar setIsMobileOpen={setIsMobileOpen} />

        {/* Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar page-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
