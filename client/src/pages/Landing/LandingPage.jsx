import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import backgroundVideo from '../../assets/vidssave.com World painting 720P.m4v';
import {
  Users,
  Clock,
  CalendarDays,
  FileCheck,
  BarChart3,
  Bell,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

// Lightweight, high-performance scroll reveal animation component
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const [inView, setInView] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ companies: 0, employees: 0, uptime: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive device check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/dashboard/employee';
    switch (user.role) {
      case 'EMPLOYEE':
        return '/dashboard/employee';
      case 'MANAGER':
        return '/dashboard/manager';
      case 'HR_ADMIN':
        return '/dashboard/hr';
      case 'LEADERSHIP':
        return '/dashboard/leadership';
      default:
        return '/dashboard/employee';
    }
  };
  const dashboardPath = getDashboardPath();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Stats incremental animation
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setStats({
        companies: Math.floor((500 / steps) * step),
        employees: Math.floor((50000 / steps) * step),
        uptime: parseFloat(((99.9 / steps) * step).toFixed(1)),
      });

      if (step >= steps) {
        setStats({ companies: 500, employees: 50000, uptime: 99.9 });
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Parallax mouse tracker (desktop only)
  useEffect(() => {
    if (isMobile) {
      setMouseOffset({ x: 0, y: 0 });
      return;
    }
    const handleMouseMove = (e) => {
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      // Shift in opposite direction of mouse movement to create natural 3D depth
      setMouseOffset({ x: -dx * 20, y: -dy * 20 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'Employee Management',
      desc: 'Centralized directory tracking profiles, documents, reporting hierarchies, and role security.',
      icon: Users,
    },
    {
      title: 'Attendance Tracking',
      desc: 'Real-time punch check-in clocks with IP/device locks, geo-tagging, and muster registers.',
      icon: Clock,
    },
    {
      title: 'Leave Management',
      desc: 'Configurable entitlement policies, accrual rules, year-end calculations, and request logs.',
      icon: CalendarDays,
    },
    {
      title: 'Approval Workflows',
      desc: 'Automated multi-level SLA structures for leave requests, shifts regularizations, and profile changes.',
      icon: FileCheck,
    },
    {
      title: 'Reports & Analytics',
      desc: 'Interactive filters covering attrition rates, headcount maps, and late compliance audits.',
      icon: BarChart3,
    },
    {
      title: 'Smart Notifications',
      desc: 'Instant user alerts for approval requests status, pending tasks, and birthday notices.',
      icon: Bell,
    },
  ];

  // Combine translations for mouse parallax and scroll parallax
  const computedTranslateY = isMobile
    ? scrollY * 0.04 // Mobile: very small vertical shift
    : mouseOffset.y + scrollY * 0.15; // Desktop: mouse offset + scroll translation
  
  const computedScale = isMobile
    ? 1.12 + scrollY * 0.0001 // Mobile: starts at 1.12 for safety buffer
    : 1.01 + scrollY * 0.0002; // Desktop: starts at 1.01 to minimize upscaling zoom
  
  const computedOpacity = Math.max(0.12, 0.72 - scrollY / 600);

  return (
    <div className="min-h-screen bg-charcoal-bg text-stardust-text select-none overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden bg-gradient-to-b from-walnut-noir to-deep-brown">
        
        {/* Animated Parallax & Scroll Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-[center_48%] md:object-[center_48%]"
            style={{
              transform: `translate(${isMobile ? 0 : mouseOffset.x}px, ${computedTranslateY}px) scale(${computedScale})`,
              transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.1s linear',
              opacity: computedOpacity,
              filter: 'contrast(1.12) brightness(1.05)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          {/* Subtle gradient mapping overlays to enhance contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-walnut-noir via-walnut-noir/55 to-transparent" />
        </div>
        
        {/* Header / Navigation Bar */}
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 lg:px-16 z-20 bg-deep-brown/10 backdrop-blur-md border-b border-indigo-border/10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-wider text-stardust-text">LUCID-HR</span>
          </div>
 
          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <Link to="/" className="text-stardust-text hover:text-indigo-brand transition-colors">Home</Link>
            <a href="#features" className="text-grey-text hover:text-stardust-text transition-colors">Features</a>
          </nav>
 
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-grey-text hidden sm:inline">
                  Welcome, <span className="font-bold text-stardust-text">{user.name || user.username}</span>
                </span>
                <Link
                  to={dashboardPath}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-colors cursor-pointer shadow-lg shadow-indigo-brand/20 flex items-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold border border-indigo-border hover:bg-[#2E1F1B]/20 hover:text-warm-cream hover:border-warm-cream/30 text-stardust-text transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all cursor-pointer"
              >
                Sign In
              </Link>
            )}
 
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-grey-text hover:text-stardust-text transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
 
        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-walnut-noir/90 backdrop-blur-lg flex flex-col justify-center items-center gap-6 text-lg font-bold">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-2 text-grey-text hover:text-stardust-text cursor-pointer"
            >
              <X size={24} />
            </button>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-stardust-text">Home</Link>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-grey-text">Features</a>
          </div>
        )}
 
        {/* Hero Content */}
        <div className="text-center max-w-4xl z-10 mt-16 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-warm-cream via-off-white to-warm-cream">
            Manage Your Workforce, <br />Effortlessly
          </h1>
          <p className="mt-6 text-sm md:text-base text-grey-text max-w-xl mx-auto leading-relaxed">
            A complete next-generation operational workspace for attendance tracking, leave configurations, approvals, and unified workforce directory.
          </p>
 
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} />
              </Link>
            )}
            <a
              href="#features"
              className="px-7 py-3 rounded-lg text-sm font-semibold border border-indigo-brand/60 hover:border-indigo-brand text-stardust-text hover:bg-indigo-muted/10 transition-all cursor-pointer"
            >
              See Features
            </a>
          </div>
        </div>
 
        {/* Dashboard Mockup Preview */}
        <div className="mt-16 w-full max-w-3xl px-4 z-10 animate-float">
          <div className="bg-deep-brown/95 border border-indigo-border/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Header bar */}
            <div className="h-9 bg-deep-brown flex items-center gap-1.5 px-4 border-b border-indigo-border/40">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-brown/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-light-brown/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-brown/60" />
            </div>
            {/* Mock Dashboard view */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-walnut-noir/40 min-h-[240px] text-left">
              <div className="col-span-1 bg-deep-brown border border-indigo-border/30 rounded-lg p-3.5 space-y-3 shadow-inner">
                <div className="w-2/3 h-4 bg-indigo-brand/20 rounded" />
                <div className="w-full h-8 bg-deep-brown border border-indigo-border/30 rounded" />
                <div className="w-5/6 h-3 bg-grey-text/20 rounded" />
                <div className="w-full h-10 bg-indigo-brand/10 border border-indigo-border/20 rounded flex items-center justify-between px-3">
                  <div className="w-1/2 h-3 bg-indigo-brand/30 rounded" />
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-brand" />
                </div>
              </div>
              <div className="col-span-2 bg-deep-brown border border-indigo-border/30 rounded-lg p-3.5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-1/3 h-5 bg-grey-text/25 rounded" />
                  <div className="w-12 h-4 bg-indigo-brand/30 rounded" />
                </div>
                <div className="w-full h-24 flex items-end gap-3 px-2">
                  <div className="w-full h-10 bg-indigo-brand/40 rounded-t" />
                  <div className="w-full h-16 bg-accent-brown/40 rounded-t" />
                  <div className="w-full h-12 bg-indigo-brand/25 rounded-t" />
                  <div className="w-full h-20 bg-mid-brown/30 rounded-t" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 bg-charcoal-bg border-t border-indigo-border/20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-stardust-text">Everything You Need to Manage People</h2>
            <p className="mt-4 text-sm text-grey-text">
              Fully modular modules configured to your organizational hierarchy. Completely integrated self-service system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 80} className="h-full">
                  <div
                    className="bg-charcoal-sidebar border border-indigo-border/70 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-brand hover:shadow-lg group h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-lg bg-indigo-brand/10 text-indigo-brand flex items-center justify-center transition-colors group-hover:bg-indigo-brand group-hover:text-stardust-text">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-stardust-text mt-5">{feat.title}</h3>
                      <p className="text-sm text-grey-text mt-3 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 px-6 bg-black-metal border-t border-b border-indigo-border/25">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <ScrollReveal delay={100}>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-stardust-text">{stats.companies}+</h3>
              <p className="text-xs text-grey-text mt-2 font-semibold uppercase tracking-wider">Active Tenants</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-stardust-text">{stats.employees.toLocaleString()}+</h3>
              <p className="text-xs text-grey-text mt-2 font-semibold uppercase tracking-wider">Employees Managed</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-stardust-text">{stats.uptime}%</h3>
              <p className="text-xs text-grey-text mt-2 font-semibold uppercase tracking-wider">Uptime SLA</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Workflow Process Section */}
      <section className="py-24 px-6 bg-charcoal-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-stardust-text">Getting Started is Simple</h2>
            <p className="mt-4 text-sm text-grey-text">Configure your workspace and connect your directory in minutes.</p>
          </div>

          <div className="relative flex flex-col md:flex-row gap-8 items-start justify-between">
            {/* Connector line for large screens */}
            <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-indigo-border/30 z-0" />

            <ScrollReveal className="flex-1 flex flex-col items-center text-center relative z-10" delay={100}>
              <div className="w-16 h-16 rounded-full bg-indigo-brand text-stardust-text font-bold text-xl flex items-center justify-center border-4 border-charcoal-bg">
                1
              </div>
              <h3 className="text-lg font-bold text-stardust-text mt-6">Set Up Your Org</h3>
              <p className="text-sm text-grey-text mt-2 px-4 leading-relaxed">
                Define tenants, departments, shifts, and weekly offs.
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex-1 flex flex-col items-center text-center relative z-10" delay={200}>
              <div className="w-16 h-16 rounded-full bg-indigo-brand text-stardust-text font-bold text-xl flex items-center justify-center border-4 border-charcoal-bg">
                2
              </div>
              <h3 className="text-lg font-bold text-stardust-text mt-6">Add Your Team</h3>
              <p className="text-sm text-grey-text mt-2 px-4 leading-relaxed">
                Import team sheets or setup profiles with department tags and shifts.
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex-1 flex flex-col items-center text-center relative z-10" delay={300}>
              <div className="w-16 h-16 rounded-full bg-indigo-brand text-stardust-text font-bold text-xl flex items-center justify-center border-4 border-charcoal-bg">
                3
              </div>
              <h3 className="text-lg font-bold text-stardust-text mt-6">Start Managing</h3>
              <p className="text-sm text-grey-text mt-2 px-4 leading-relaxed">
                Approve requests, process leaves, and track muster attendances.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-charcoal-sidebar border-t border-indigo-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-stardust-text">Loved by HR Managers</h2>
            <p className="mt-4 text-sm text-grey-text">What leaders say about their shift to Lucid-HR.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal className="h-full" delay={100}>
              <div className="bg-charcoal-navbar border border-indigo-border/70 rounded-xl p-6 border-l-4 border-l-indigo-brand shadow-md h-full flex flex-col justify-between">
                <p className="text-sm text-stardust-text italic leading-relaxed">
                  "Lucid-HR changed our leave request timelines. Automated approvals on SLA escalations mean managers never block requests."
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-9 h-9 rounded-full bg-indigo-brand/20 text-indigo-brand flex items-center justify-center text-xs font-bold">
                    SJ
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stardust-text">Sarah Jenkins</h4>
                    <span className="text-[10px] text-grey-text uppercase tracking-wider block">HR Director, CloudFlow</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="h-full" delay={200}>
              <div className="bg-charcoal-navbar border border-indigo-border/70 rounded-xl p-6 shadow-md h-full flex flex-col justify-between">
                <p className="text-sm text-stardust-text italic leading-relaxed">
                  "The muster register grid represents days instantly. Color coding for half-days, leaves, and absents is extremely clear."
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-9 h-9 rounded-full bg-indigo-brand/20 text-indigo-brand flex items-center justify-center text-xs font-bold">
                    MH
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stardust-text">Michael Huff</h4>
                    <span className="text-[10px] text-grey-text uppercase tracking-wider block">Operations Lead, VeloData</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="h-full" delay={300}>
              <div className="bg-charcoal-navbar border border-indigo-border/70 rounded-xl p-6 shadow-md h-full flex flex-col justify-between">
                <p className="text-sm text-stardust-text italic leading-relaxed">
                  "Connecting clock logs with shift assignments is seamless. Regularization controls mean transparency across teams."
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-9 h-9 rounded-full bg-indigo-brand/20 text-indigo-brand flex items-center justify-center text-xs font-bold">
                    DL
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stardust-text">David Lee</h4>
                    <span className="text-[10px] text-grey-text uppercase tracking-wider block">VP of Talent, Apex Systems</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-deep py-12 px-6 border-t border-indigo-border/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h2 className="font-bold text-lg text-stardust-text tracking-wider">LUCID-HR</h2>
            <p className="text-xs text-grey-text mt-1">Next-gen people operational workspace.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#features" className="text-grey-text hover:text-stardust-text transition-colors">Features</a>
            <Link to="/login" className="text-grey-text hover:text-stardust-text transition-colors">Portal Access</Link>
          </div>
          <div>
            <p className="text-xs text-grey-text">
              &copy; {new Date().getFullYear()} Lucid-HR Systems. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
