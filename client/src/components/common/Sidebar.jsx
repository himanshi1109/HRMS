import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  BarChart3,
  LogOut,
  Building,
  Settings,
  Home,
  Bell,
  User,
} from 'lucide-react';
import { ROLES } from '../../utils/constants';
import Avatar from './Avatar';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  // Define navigation items
  const menuItems = [
    {
      name: 'Landing Page',
      path: '/',
      icon: Home,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.LEADERSHIP],
    },
    {
      name: 'Admin Dashboard',
      path: user?.role === ROLES.EMPLOYEE ? '/dashboard/employee' 
            : user?.role === ROLES.MANAGER ? '/dashboard/manager'
            : user?.role === ROLES.HR_ADMIN ? '/dashboard/hr'
            : '/dashboard/leadership',
      icon: LayoutDashboard,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.LEADERSHIP],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.LEADERSHIP],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
    },
    {
      name: 'Leave Management',
      path: '/leave',
      icon: CalendarDays,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
    },
    {
      name: 'Approvals',
      path: '/approvals',
      icon: FileCheck2,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.LEADERSHIP],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: [ROLES.HR_ADMIN, ROLES.LEADERSHIP],
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: [ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.LEADERSHIP],
      badge: unreadCount,
    },
  ];

  const userRole = user?.role || ROLES.EMPLOYEE;
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-deep-brown text-off-white select-none w-[280px] justify-between">
      {/* Brand Header / Logo */}
      <div className="border-b border-mid-brown p-5 flex items-center gap-3">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center bg-mid-brown border border-mid-brown hover:border-accent-brown transition-all cursor-pointer">
          <Building className="text-accent-brown w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-wider text-off-white truncate">LUCID-HR</h1>
          <span className="text-[9px] text-light-brown tracking-widest uppercase block mt-0.5 truncate">HRMS Workspace</span>
        </div>
      </div>

      {/* Nav Links - Stacked vertically */}
      <nav className="flex-1 flex flex-col gap-1.5 py-6 overflow-y-auto no-scrollbar w-full px-4">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-accent-brown text-off-white shadow-brown-glow-active'
                    : 'text-light-brown hover:text-off-white hover:bg-mid-brown/40'
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="truncate flex-1">{item.name}</span>
              
              {/* Badge for Notifications */}
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-accent-brown text-off-white text-[9px] font-bold">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t border-mid-brown p-4 flex items-center justify-between bg-deep-brown/40">
        <Link to="/profile" className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity">
          <Avatar name={user?.name || user?.email} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-off-white truncate">{user?.name || 'User'}</p>
            <p className="text-[9px] text-light-brown uppercase tracking-wider truncate mt-0.5">
              {user?.role?.replace('_', ' ') || 'EMPLOYEE'}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            to="/profile"
            className="p-1.5 rounded-lg text-light-brown hover:text-off-white hover:bg-mid-brown/40 transition-colors"
            title="Profile Settings"
          >
            <User size={15} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-light-brown hover:text-accent-brown hover:bg-mid-brown/40 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[280px] border-r border-mid-brown z-20 bg-deep-brown">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-walnut-noir/75 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Menu Drawer */}
          <aside className="relative flex flex-col w-[280px] h-full bg-deep-brown shadow-2xl z-50 transform transition-transform animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
