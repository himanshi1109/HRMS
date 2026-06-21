import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Avatar from './Avatar';

export const Navbar = ({ setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic Date + Time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = time.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' | ' + time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/employee')) return 'Employee Dashboard';
    if (path.startsWith('/dashboard/manager')) return 'Manager Dashboard';
    if (path.startsWith('/dashboard/hr')) return 'HR Admin Dashboard';
    if (path.startsWith('/dashboard/leadership')) return 'Leadership Dashboard';
    if (path.startsWith('/employees')) return 'Employee Management';
    if (path.startsWith('/attendance')) return 'Attendance Management';
    if (path.startsWith('/leave')) return 'Leave Management';
    if (path.startsWith('/approvals')) return 'Workflow & Approvals';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/profile')) return 'My Profile';
    return 'HRMS Workspace';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-[60px] bg-deep-brown border-b border-mid-brown flex items-center justify-between px-6 sticky top-0 z-30 select-none shadow-md">
      {/* Left: Mobile hamburger & System DateTime */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="p-1.5 rounded-lg text-light-brown hover:text-off-white hover:bg-mid-brown/40 lg:hidden cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <span className="text-xs font-semibold text-light-brown tracking-wide hidden sm:inline-block font-mono">
          {formattedDateTime}
        </span>
      </div>

      {/* Center: Dynamic Page Title */}
      <h2 className="text-xs font-bold text-off-white uppercase tracking-wider">
        {getTitle()}
      </h2>

      {/* Right: Notifications, Avatar + Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Badge */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-light-brown hover:text-off-white hover:bg-mid-brown/40 transition-all cursor-pointer"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent-brown text-off-white text-[9px] font-bold flex items-center justify-center border border-deep-brown">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-mid-brown" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-mid-brown/40 transition-colors select-none cursor-pointer"
          >
            <Avatar name={user?.name || user?.email} size="sm" />
            <ChevronDown size={14} className={`text-light-brown transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay Backdrop to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-deep-brown border border-mid-brown rounded-lg shadow-xl py-1 z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-mid-brown/50">
                  <p className="text-xs font-bold text-off-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[9px] text-light-brown uppercase tracking-wider truncate mt-0.5">
                    {user?.role?.replace('_', ' ') || 'EMPLOYEE'}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-light-brown hover:text-off-white hover:bg-mid-brown/40 transition-colors"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-light-brown hover:text-accent-brown hover:bg-mid-brown/40 transition-colors cursor-pointer text-left"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
