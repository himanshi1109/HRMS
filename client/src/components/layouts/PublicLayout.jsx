import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-charcoal-bg page-fade-in text-stardust-text">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
