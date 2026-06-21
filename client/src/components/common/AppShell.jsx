import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  FileCheck2,
  BarChart3,
  Bell,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({ children, pageTitle = 'Dashboard', activeNav = 'Dashboard' }) => {
  const navigate = useNavigate();
  
  // Safe authentication fetch
  let authUser = null;
  let handleLogout = null;
  try {
    const auth = useAuth();
    authUser = auth?.user;
    handleLogout = auth?.logout;
  } catch (e) {
    // Authentication context not available in isolated rendering
  }

  const displayName = authUser?.name || authUser?.username || 'Jane Doe';
  const displayRole = authUser?.role || 'HR Manager';

  // Live Date + Time Clock State
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = time.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' | ' + time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // State for navbar avatar dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State for nav list hovers
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Nav items configuration
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Leave', icon: CalendarDays, path: '/leave' },
    { name: 'Approvals', icon: FileCheck2, path: '/approvals' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Notifications', icon: Bell, path: '/notifications' }
  ];

  // Resolve dashboard paths based on user role dynamically if clicking dashboard
  const handleNavClick = (item) => {
    if (item.name === 'Dashboard' && authUser) {
      switch (authUser.role) {
        case 'EMPLOYEE':
          navigate('/dashboard/employee');
          break;
        case 'MANAGER':
          navigate('/dashboard/manager');
          break;
        case 'HR_ADMIN':
          navigate('/dashboard/hr');
          break;
        case 'LEADERSHIP':
          navigate('/dashboard/leadership');
          break;
        default:
          navigate('/dashboard/employee');
      }
    } else {
      navigate(item.path);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Inline styling sheets - CSS variables defined at outer scope
  const styles = {
    root: {
      '--walnut-noir': '#2E1F1B',
      '--deep-brown': '#3D2B26',
      '--mid-brown': '#5E4B43',
      '--light-brown': '#8B7B6F',
      '--taupe-light': '#B5A89E',
      '--warm-cream': '#D4C9BE',
      '--off-white': '#E8E3DD',
      '--accent-brown': '#704A3C',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      backgroundColor: 'var(--walnut-noir)',
      color: 'var(--off-white)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    },
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'var(--deep-brown)',
      borderBottom: '1px solid var(--mid-brown)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      boxSizing: 'border-box'
    },
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--taupe-light)',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.02em',
      userSelect: 'none'
    },
    navCenter: {
      color: 'var(--off-white)',
      fontSize: '16px',
      fontWeight: '600',
      letterSpacing: '0.02em',
      userSelect: 'none'
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: 'var(--off-white)',
      position: 'relative'
    },
    bellContainer: {
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
      color: 'var(--off-white)'
    },
    bellBadge: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: 'var(--accent-brown)',
      border: '1.5px solid var(--deep-brown)'
    },
    userTrigger: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '20px',
      transition: 'background-color 0.2s',
      userSelect: 'none'
    },
    navAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: 'var(--accent-brown)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--off-white)',
      fontSize: '12px',
      fontWeight: '600'
    },
    dropdownMenu: {
      position: 'absolute',
      top: '48px',
      right: 0,
      backgroundColor: 'var(--deep-brown)',
      border: '1px solid var(--mid-brown)',
      borderRadius: '8px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
      padding: '6px 0',
      width: '160px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1010
    },
    dropdownItem: {
      padding: '10px 16px',
      fontSize: '13px',
      color: 'var(--off-white)',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'background-color 0.2s'
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '280px',
      backgroundColor: 'var(--deep-brown)',
      borderRight: '1px solid var(--mid-brown)',
      paddingTop: '60px', // Align below fixed navbar
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999,
      boxSizing: 'border-box'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '24px 20px',
      borderBottom: '1px solid var(--mid-brown)',
      userSelect: 'none'
    },
    logoCircle: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: 'var(--accent-brown)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--off-white)',
      fontSize: '16px',
      fontWeight: '700'
    },
    logoTextContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    logoHRMSText: {
      color: 'var(--off-white)',
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '0.05em'
    },
    logoWorkspaceText: {
      color: 'var(--light-brown)',
      fontSize: '11px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    navList: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0',
      gap: '4px',
      flex: 1,
      overflowY: 'auto'
    },
    sidebarUserCard: {
      padding: '16px 20px',
      borderTop: '1px solid var(--mid-brown)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'var(--deep-brown)',
      marginTop: 'auto', // Pushes user card to bottom
      boxSizing: 'border-box'
    },
    userCardAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'var(--mid-brown)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--off-white)',
      fontSize: '14px',
      fontWeight: '600',
      userSelect: 'none'
    },
    userCardInfo: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    userCardName: {
      color: 'var(--light-brown)',
      fontSize: '14px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.2'
    },
    userCardRole: {
      color: 'var(--light-brown)',
      fontSize: '11px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginTop: '2px'
    },
    mainContent: {
      marginLeft: '280px',
      paddingTop: '60px', // Under navbar
      backgroundColor: 'var(--walnut-noir)',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    },
    innerContent: {
      padding: '24px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }
  };

  const handleLogoutClick = async () => {
    if (handleLogout) {
      await handleLogout();
    }
    navigate('/');
  };

  return (
    <div style={styles.root}>
      {/* Fixed Navbar */}
      <nav style={styles.navbar}>
        {/* Left: clock displaying date + time in #B5A89E */}
        <div style={styles.navLeft}>
          {formattedDateTime}
        </div>

        {/* Center: page title prop in #E8E3DD */}
        <div style={styles.navCenter}>
          {pageTitle}
        </div>

        {/* Right: bell icon + circular avatar + dropdown arrow in #E8E3DD */}
        <div style={styles.navRight}>
          <div 
            style={styles.bellContainer}
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <Bell size={20} />
            <div style={styles.bellBadge} />
          </div>

          <div 
            style={styles.userTrigger}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div style={styles.navAvatar}>
              {getInitials(displayName)}
            </div>
            <ChevronDown size={16} />
          </div>

          {/* User drop down menu */}
          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <button 
                style={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mid-brown)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={14} />
                <span>My Profile</span>
              </button>
              <button 
                style={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogoutClick();
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mid-brown)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Fixed Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo container */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            H
          </div>
          <div style={styles.logoTextContainer}>
            <span style={styles.logoHRMSText}>HRMS</span>
            <span style={styles.logoWorkspaceText}>Workspace</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={styles.navList}>
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeNav.toLowerCase() === item.name.toLowerCase();
            const isHovered = hoveredIndex === index;

            const currentItemStyle = {
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '3px solid var(--off-white)' : '3px solid transparent',
              backgroundColor: isActive 
                ? 'var(--accent-brown)' 
                : (isHovered ? 'var(--mid-brown)' : 'transparent'),
              color: isActive 
                ? 'var(--off-white)' 
                : (isHovered ? 'var(--off-white)' : 'var(--taupe-light)'),
            };

            return (
              <div
                key={item.name}
                style={currentItemStyle}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleNavClick(item)}
              >
                <IconComponent size={18} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500' }}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div style={styles.sidebarUserCard}>
          <div style={styles.userCardAvatar}>
            {getInitials(displayName)}
          </div>
          <div style={styles.userCardInfo}>
            <span style={styles.userCardName}>{displayName}</span>
            <span style={styles.userCardRole}>{displayRole}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <div style={styles.innerContent}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
