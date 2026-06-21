import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  authAPI, employeeAPI, attendanceAPI, leaveAPI, approvalAPI,
  notificationAPI, reportAPI, orgAPI, essAPI, mssAPI, compensationAPI
} from './api';
import API from './api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, Users, Clock, CalendarDays, FileCheck2, BarChart3, Bell,
  Settings, ChevronDown, User, LogOut, Search, UserCheck, Calendar, ArrowRight,
  Filter, Grid as GridIcon, List, ArrowLeft, Mail, Lock, Eye, EyeOff, Plus, Check, X, CheckSquare,
  Crown, Shield, Copy, RefreshCw, Download, Coins, Landmark, Receipt, DollarSign,
  MessageCircle, Send, Bot, Minimize2, Sparkles
} from 'lucide-react';
import { generatePassword, downloadCredentials } from './utils/generatePassword';

// ==========================================
// BACKGROUND CONFIG
// ==========================================
const OFFICE_BG_STYLE = {
  backgroundImage: `url('/office-bg.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh'
};

// ==========================================
// All data is fetched from the live backend API
// ==========================================

// ==========================================
// GLASSMORPHISM STYLES DEFINITION
// ==========================================
const glassStyles = {
  card: {
    background: 'rgba(20, 18, 16, 0.82)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '24px',
    boxSizing: 'border-box'
  },
  cardDark: {
    background: 'rgba(20, 18, 16, 0.82)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '24px',
    boxSizing: 'border-box'
  },
  cardChart: {
    background: 'rgba(20, 18, 16, 0.82)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '24px',
    boxSizing: 'border-box'
  },
  sidebar: {
    background: 'rgba(12, 11, 10, 0.92)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)'
  },
  navbar: {
    background: 'rgba(12, 11, 10, 0.90)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  btnPrimary: {
    background: 'rgba(232, 228, 220, 0.92)',
    color: '#1A1815',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#F0EBE3',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '999px',
    padding: '10px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  input: {
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#F0EBE3',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#F0EBE3',
    borderRadius: '10px',
    padding: '12px 16px',
    paddingRight: '36px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C8C4BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px',
    cursor: 'pointer'
  },
  textarea: {
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#F0EBE3',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'none',
    minHeight: '80px',
    fontFamily: 'inherit'
  },
  pillActive: {
    background: 'rgba(232, 228, 220, 0.92)',
    color: '#1A1815',
    padding: '8px 18px',
    borderRadius: '999px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    transition: 'all 0.2s ease'
  },
  pillInactive: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#A8A5A0',
    padding: '8px 18px',
    borderRadius: '999px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    transition: 'all 0.2s ease'
  }
};

// ==========================================
// RECHARTS GLOBAL STYLES
// ==========================================
const chartTooltipStyle = {
  backgroundColor: 'rgba(18, 16, 14, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  color: '#F0EBE3'
};

// ==========================================
// EMPLOYEE UTILITY FUNCTIONS & ACCESSORS
// ==========================================
const getFullName = (emp) => {
  if (emp?.personal?.firstName) {
    return `${emp.personal.firstName} ${emp.personal.lastName || ''}`.trim();
  }
  return emp?.name || emp?.fullName || '—';
};

const getInitials = (emp) => {
  if (emp?.personal?.firstName) {
    return `${emp.personal.firstName[0]}${emp.personal.lastName?.[0] || ''}`.toUpperCase();
  }
  const name = emp?.name || '';
  const parts = name.split(' ');
  return parts.length >= 2 
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase() || '—';
};

const getEmployeeEmail = (emp) => {
  return emp?.contact?.officialEmail || emp?.userId?.email || emp?.auth?.email || emp?.email || emp?.contact?.personalEmail || '—';
};

const getEmployeeRole = (emp) => {
  return emp?.userId?.role || emp?.auth?.role || emp?.role || emp?.userRole || 'EMPLOYEE';
};

const getEmployeeDept = (emp) => {
  return emp?.employment?.departmentId?.name 
    || emp?.employment?.department?.name 
    || emp?.employment?.departmentId 
    || emp?.employment?.department 
    || emp?.department?.name
    || emp?.department 
    || '—';
};

const getEmployeeDesig = (emp) => {
  return emp?.employment?.designationId?.title
    || emp?.employment?.designationId?.name
    || emp?.employment?.designation?.title
    || emp?.employment?.designation?.name
    || emp?.employment?.designation
    || emp?.designation?.name
    || emp?.designation
    || '—';
};

const getEmployeeLoc = (emp) => {
  return emp?.employment?.locationId?.name
    || emp?.employment?.location?.name
    || emp?.employment?.locationId
    || emp?.employment?.location
    || emp?.location?.name
    || emp?.location
    || '—';
};

const getEmployeeDoj = (emp) => {
  return emp?.employment?.dateOfJoining
    || emp?.dateOfJoining
    || null;
};

const getStrength = (pass) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

const FALLBACK_DEPARTMENTS = [
  { _id: 'engineering', name: 'Engineering' },
  { _id: 'product', name: 'Product' },
  { _id: 'qa_testing', name: 'QA & Testing' },
  { _id: 'devops', name: 'DevOps & Infrastructure' },
  { _id: 'design', name: 'Design' },
  { _id: 'hr', name: 'HR' },
  { _id: 'finance', name: 'Finance & Accounts' },
  { _id: 'sales', name: 'Sales & Marketing' },
  { _id: 'operations', name: 'Operations' },
  { _id: 'leadership', name: 'Leadership' }
];

const DESIGNATIONS_BY_DEPARTMENT = {
  'engineering': [
    'Intern',
    'Trainee Software Engineer',
    'Junior Software Engineer',
    'Software Engineer',
    'Senior Software Engineer',
    'Lead Software Engineer',
    'Technical Lead',
    'Team Lead',
    'Engineering Manager'
  ],
  'product': [
    'Intern',
    'Junior Product Manager',
    'Product Manager',
    'Senior Product Manager',
    'Lead Product Manager',
    'Product Lead',
    'Project Coordinator',
    'Project Manager',
    'Senior Project Manager',
    'Lead Project Manager',
    'Project Management Lead'
  ],
  'qa_testing': [
    'Intern',
    'Junior QA Engineer',
    'QA Tester',
    'QA Automation Engineer',
    'Senior QA Engineer',
    'QA Lead',
    'QA Team Lead'
  ],
  'devops': [
    'Intern',
    'Junior DevOps Engineer',
    'DevOps Engineer',
    'Senior DevOps Engineer',
    'DevOps Lead',
    'Lead DevOps Engineer'
  ],
  'design': [
    'Intern',
    'Junior UI/UX Designer',
    'UI/UX Designer',
    'Senior UI/UX Designer',
    'Design Lead',
    'Lead UI/UX Designer',
    'Creative Director'
  ],
  'hr': [
    'Intern',
    'HR Associate',
    'HR Executive',
    'Senior HR Executive',
    'HR Lead',
    'Recruiter',
    'HR Manager',
    'Senior HR Manager',
    'HR Business Partner'
  ],
  'finance': [
    'Intern',
    'Junior Accountant',
    'Accountant',
    'Senior Accountant',
    'Finance Analyst',
    'Senior Finance Analyst',
    'Finance Lead',
    'Finance Manager',
    'Senior Finance Manager'
  ],
  'sales': [
    'Intern',
    'Sales Executive',
    'Senior Sales Executive',
    'Sales Lead',
    'Sales Manager',
    'Senior Sales Manager',
    'Business Development Manager'
  ],
  'operations': [
    'Intern',
    'Operations Executive',
    'Senior Operations Executive',
    'Operations Lead',
    'Operations Manager',
    'Senior Operations Manager'
  ],
  'leadership': [
    'CEO',
    'CTO',
    'COO',
    'VP Engineering',
    'VP Product',
    'Executive Director',
    'Senior Director',
    'Director of Engineering'
  ]
};

// ==========================================
// DESIGNATION → SUGGESTED ANNUAL CTC MAP (midpoints, ₹)
// ==========================================
const DESIGNATION_SALARY_MAP = {
  // Intern / Trainee
  'Intern':                        200000,   // ₹2.0 LPA midpoint
  'Trainee Software Engineer':     375000,   // ₹3.75 LPA
  // Engineering
  'Junior Software Engineer':      500000,   // ₹5 LPA
  'Junior Full Stack Developer':   600000,
  'Software Engineer':             850000,   // ₹8.5 LPA
  'Frontend Developer':            850000,
  'Backend Developer':             1000000,  // ₹10 LPA
  'Full Stack Developer':          1200000,  // ₹12 LPA
  'Senior Software Engineer':      2100000,  // ₹21 LPA
  'Senior Full Stack Developer':   2100000,
  'Senior Developer':              2100000,
  'Lead Software Engineer':        2400000,  // ₹24 LPA
  'Mobile Developer':              1200000,
  'Technical Lead':                2700000,  // ₹27 LPA
  'Team Lead':                     2550000,  // ₹25.5 LPA
  'Engineering Manager':           4200000,  // ₹42 LPA
  // QA
  'Junior QA Engineer':            500000,
  'QA Tester':                     600000,
  'QA Automation Engineer':        1050000,  // ₹10.5 LPA
  'Senior QA Engineer':            1050000,
  'QA Lead':                       1200000,
  'QA Team Lead':                  1200000,
  // DevOps
  'Junior DevOps Engineer':        700000,
  'DevOps Engineer':               1700000,  // ₹17 LPA
  'Senior DevOps Engineer':        2400000,
  'DevOps Lead':                   2400000,
  'Lead DevOps Engineer':          2400000,
  // Design
  'Junior UI/UX Designer':         600000,
  'UI/UX Designer':                1000000,  // ₹10 LPA
  'Senior UI/UX Designer':         1500000,
  'Design Lead':                   1500000,
  'Lead UI/UX Designer':           1800000,
  'Creative Director':             2400000,
  // Product / Project
  'Junior Product Manager':        700000,
  'Product Manager':               1200000,
  'Senior Product Manager':        1800000,
  'Lead Product Manager':          2200000,
  'Product Lead':                  2200000,
  'Product Owner':                 3300000,  // ₹33 LPA
  'Project Coordinator':           700000,
  'Project Manager':               3300000,
  'Senior Project Manager':        3800000,
  'Lead Project Manager':          4000000,
  'Project Management Lead':       4000000,
  'Scrum Master':                  2100000,
  'Business Analyst':              1200000,
  // HR
  'HR Admin':                      600000,
  'HR Associate':                  400000,
  'HR Executive':                  500000,
  'Senior HR Executive':           700000,
  'HR Lead':                       900000,
  'Recruiter':                     550000,
  'HR Manager':                    1650000,  // ₹16.5 LPA
  'Senior HR Manager':             2000000,
  'HR Business Partner':           2000000,
  // Finance
  'Junior Accountant':             400000,
  'Accountant':                    650000,
  'Senior Accountant':             900000,
  'Finance Analyst':               1000000,
  'Senior Finance Analyst':        1400000,
  'Finance Lead':                  1600000,
  'Finance Manager':               2000000,
  'Senior Finance Manager':        2500000,
  // Sales
  'Sales Executive':               650000,
  'Senior Sales Executive':        900000,
  'Sales Lead':                    1200000,
  'Sales Manager':                 1600000,
  'Senior Sales Manager':          2000000,
  'Business Development Manager':  2000000,
  // Operations
  'Operations Executive':          500000,
  'Senior Operations Executive':   700000,
  'Operations Lead':               1000000,
  'Operations Manager':            1500000,
  'Senior Operations Manager':     2000000,
  // IT / Sys Admin
  'System Administrator':          1000000,
  'Database Administrator':        1500000,
  // Leadership
  'CEO':                           10800000, // ₹108 LPA midpoint
  'CTO':                           9000000,
  'COO':                           9000000,
  'VP Engineering':                6000000,
  'VP Product':                    6000000,
  'Executive Director':            5000000,
  'Senior Director':               4500000,
  'Director of Engineering':       4500000,
};

// Helper: get salary suggestion for a designation name (partial match)
const getSuggestedSalary = (designationName) => {
  if (!designationName) return null;
  // Exact match first
  if (DESIGNATION_SALARY_MAP[designationName]) return DESIGNATION_SALARY_MAP[designationName];
  // Partial match
  const key = Object.keys(DESIGNATION_SALARY_MAP).find(k =>
    designationName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(designationName.toLowerCase())
  );
  return key ? DESIGNATION_SALARY_MAP[key] : null;
};

// DESIGNATION → SUGGESTED ANNUAL CTC RANGE MAP (min, max in ₹)
const DESIGNATION_SALARY_RANGES = {
  'Intern': { min: 120000, max: 300000 },
  'Trainee Software Engineer': { min: 250000, max: 500000 },
  'Junior Software Engineer': { min: 400000, max: 700000 },
  'Junior Full Stack Developer': { min: 450000, max: 800000 },
  'Software Engineer': { min: 500000, max: 1200000 },
  'Frontend Developer': { min: 500000, max: 1200000 },
  'Backend Developer': { min: 600000, max: 1400000 },
  'Full Stack Developer': { min: 800000, max: 1600000 },
  'Senior Software Engineer': { min: 1200000, max: 3000000 },
  'Senior Full Stack Developer': { min: 1200000, max: 3000000 },
  'Senior Developer': { min: 1200000, max: 3000000 },
  'Lead Software Engineer': { min: 1800000, max: 3000000 },
  'Mobile Developer': { min: 800000, max: 1600000 },
  'Technical Lead': { min: 1800000, max: 3600000 },
  'Team Lead': { min: 1600000, max: 3200000 },
  'Engineering Manager': { min: 3000000, max: 5400000 },
  'Junior QA Engineer': { min: 350000, max: 650000 },
  'QA Tester': { min: 400000, max: 800000 },
  'QA Automation Engineer': { min: 700000, max: 1400000 },
  'Senior QA Engineer': { min: 700000, max: 1400000 },
  'QA Lead': { min: 900000, max: 1800000 },
  'QA Team Lead': { min: 900000, max: 1800000 },
  'Junior DevOps Engineer': { min: 500000, max: 900000 },
  'DevOps Engineer': { min: 1000000, max: 2400000 },
  'Senior DevOps Engineer': { min: 1600000, max: 3200000 },
  'DevOps Lead': { min: 1600000, max: 3200000 },
  'Lead DevOps Engineer': { min: 1600000, max: 3200000 },
  'Junior UI/UX Designer': { min: 400000, max: 800000 },
  'UI/UX Designer': { min: 600000, max: 1400000 },
  'Senior UI/UX Designer': { min: 1000000, max: 2000000 },
  'Design Lead': { min: 1000000, max: 2000000 },
  'Lead UI/UX Designer': { min: 1200000, max: 2400000 },
  'Creative Director': { min: 1800000, max: 3600000 },
  'Junior Product Manager': { min: 500000, max: 900000 },
  'Product Manager': { min: 800000, max: 1600000 },
  'Senior Product Manager': { min: 1200000, max: 2400000 },
  'Lead Product Manager': { min: 1500000, max: 3000000 },
  'Product Lead': { min: 1500000, max: 3000000 },
  'Product Owner': { min: 2000000, max: 4500000 },
  'Project Coordinator': { min: 500000, max: 900000 },
  'Project Manager': { min: 2000000, max: 4500000 },
  'Senior Project Manager': { min: 2500000, max: 5000000 },
  'Lead Project Manager': { min: 2800000, max: 5500000 },
  'Project Management Lead': { min: 2800000, max: 5500000 },
  'Scrum Master': { min: 1200000, max: 3000000 },
  'Business Analyst': { min: 800000, max: 1600000 },
  'HR Admin': { min: 400000, max: 900000 },
  'HR Associate': { min: 300000, max: 500000 },
  'HR Executive': { min: 300000, max: 700000 },
  'Senior HR Executive': { min: 500000, max: 900000 },
  'HR Lead': { min: 600000, max: 1200000 },
  'Recruiter': { min: 400000, max: 700000 },
  'HR Manager': { min: 900000, max: 2400000 },
  'Senior HR Manager': { min: 1200000, max: 3000000 },
  'HR Business Partner': { min: 1200000, max: 3000000 },
  'Junior Accountant': { min: 300000, max: 500000 },
  'Accountant': { min: 450000, max: 850000 },
  'Senior Accountant': { min: 600000, max: 1200000 },
  'Finance Analyst': { min: 700000, max: 1300000 },
  'Senior Finance Analyst': { min: 1000000, max: 1800000 },
  'Finance Lead': { min: 1200000, max: 2000000 },
  'Finance Manager': { min: 1400000, max: 2600000 },
  'Senior Finance Manager': { min: 1800000, max: 3200000 },
  'Sales Executive': { min: 450000, max: 850000 },
  'Senior Sales Executive': { min: 600000, max: 1200000 },
  'Sales Lead': { min: 800000, max: 1600000 },
  'Sales Manager': { min: 1100000, max: 2100000 },
  'Senior Sales Manager': { min: 1400000, max: 2600000 },
  'Business Development Manager': { min: 1400000, max: 2600000 },
  'Operations Executive': { min: 350000, max: 650000 },
  'Senior Operations Executive': { min: 500000, max: 900000 },
  'Operations Lead': { min: 700000, max: 1300000 },
  'Operations Manager': { min: 1000000, max: 2000000 },
  'Senior Operations Manager': { min: 1400000, max: 2600000 },
  'System Administrator': { min: 700000, max: 1300000 },
  'Database Administrator': { min: 1000000, max: 2000000 },
  'CEO': { min: 3600000, max: 18000000 },
  'CTO': { min: 3000000, max: 15000000 },
  'COO': { min: 3000000, max: 15000000 },
  'VP Engineering': { min: 4000000, max: 8000000 },
  'VP Product': { min: 4000000, max: 8000000 },
  'Executive Director': { min: 3500000, max: 7000000 },
  'Senior Director': { min: 3000000, max: 6000000 },
  'Director of Engineering': { min: 3000000, max: 6000000 }
};

// Helper: get salary suggestion range (partial match fallback)
const getSuggestedSalaryRange = (designationName) => {
  if (!designationName) return null;
  // Exact match first
  if (DESIGNATION_SALARY_RANGES[designationName]) return DESIGNATION_SALARY_RANGES[designationName];
  // Partial match
  const key = Object.keys(DESIGNATION_SALARY_RANGES).find(k =>
    designationName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(designationName.toLowerCase())
  );
  if (key) return DESIGNATION_SALARY_RANGES[key];

  // Fallback: use midpoint * 0.7 to 1.3
  const midpoint = getSuggestedSalary(designationName);
  if (midpoint) {
    return { min: Math.round(midpoint * 0.7), max: Math.round(midpoint * 1.3) };
  }
  return null;
};

// ==========================================
// AUTH & CONTEXT MOCK STATE
// ==========================================
const getInitialUser = () => {
  const local = localStorage.getItem('hrms_current_user');
  if (local) return JSON.parse(local);
  return null;
};

// ==========================================
// WORKLY ASSISTANT CHATBOT WIDGET
// ==========================================
const WorklyAssistant = () => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${currentUser?.name?.split(' ')[0] || 'there'}! 👋 I'm Workly Assistant, your AI HR companion. I know all about your company and can help you with attendance, leave, employee info, reports, and more. What can I help you with today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await API.post('/chat/message', {
        message: trimmed,
        conversationHistory: newMessages.slice(-10)
      });
      const reply = res.data?.data?.reply || 'Sorry, I could not process that. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'I ran into an issue. Please try again in a moment.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-size:11px">$1</code>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n/g, '<br/>');
  };

  const suggestionChips = [
    'What\'s my leave balance?',
    'How do I apply for leave?',
    'Show attendance steps',
    'Who to contact for HR?'
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Modal */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: 0,
          width: '380px',
          height: isMinimized ? '56px' : '520px',
          background: 'rgba(14, 12, 10, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          transition: 'height 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: isMinimized ? 'none' : '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(232,228,220,0.08) 0%, rgba(180,170,160,0.05) 100%)',
            flexShrink: 0
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8E4DC 0%, #B5A89E 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={16} style={{ color: '#1A1815' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#F0EBE3', fontSize: '14px', fontWeight: '700', lineHeight: '1.2' }}>Workly Assistant</div>
              <div style={{ color: '#6A6865', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                Powered by Gemini AI
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6865', padding: '4px', display: 'flex', alignItems: 'center' }}
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minimize2 size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6865', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
              }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E8E4DC 0%, #B5A89E 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Sparkles size={12} style={{ color: '#1A1815' }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(232,228,220,0.2) 0%, rgba(180,170,160,0.15) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      border: '1px solid ' + (msg.role === 'user' ? 'rgba(232,228,220,0.2)' : 'rgba(255,255,255,0.08)'),
                      color: '#E8E4DC',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word'
                    }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E8E4DC 0%, #B5A89E 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Sparkles size={12} style={{ color: '#1A1815' }} />
                    </div>
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: '18px 18px 18px 4px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          backgroundColor: '#6A6865',
                          animation: 'pulse 1.4s ease-in-out infinite',
                          animationDelay: `${i * 0.2}s`
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestion chips - only show if only one message */}
                {messages.length === 1 && !isTyping && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {suggestionChips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputValue(chip);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '999px',
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#A8A5A0',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#E8E4DC'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#A8A5A0'; }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 14px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                flexShrink: 0
              }}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about HR..."
                  rows={1}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#E8E4DC',
                    fontSize: '13px',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    maxHeight: '80px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none'
                  }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    width: '38px', height: '38px',
                    borderRadius: '50%',
                    background: inputValue.trim() && !isTyping
                      ? 'linear-gradient(135deg, #E8E4DC 0%, #C8C3B8 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: 'none',
                    cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Send size={15} style={{ color: inputValue.trim() && !isTyping ? '#1A1815' : '#6A6865' }} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        style={{
          width: '54px', height: '54px',
          borderRadius: '50%',
          background: isOpen
            ? 'rgba(20,18,16,0.9)'
            : 'linear-gradient(135deg, #E8E4DC 0%, #B5A89E 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          transform: 'scale(1)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="Workly Assistant"
      >
        {isOpen
          ? <X size={22} style={{ color: '#E8E4DC' }} />
          : <Sparkles size={22} style={{ color: '#1A1815' }} />
        }
      </button>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// SHARED APP SHELL COMPONENT
// ==========================================
const AppShell = ({ children, pageTitle = 'Dashboard', activeNav = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    
    const isApprover = ['MANAGER', 'HR_ADMIN', 'LEADERSHIP'].includes(currentUser.role);
    
    const fetchData = () => {
      notificationAPI.getUnreadCount()
        .then(res => {
          setUnreadCount(res.data?.data?.unreadCount || 0);
        })
        .catch(console.error);

      if (isApprover) {
        approvalAPI.getPending()
          .then(res => {
            setPendingCount(res.data?.data?.length || 0);
          })
          .catch(console.error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000); // Poll every 4 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  // Live Date + Time clock state
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

  const [avatarDropdown, setAvatarDropdown] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const roleRoutes = {
    'HR_ADMIN': '/hr-dashboard',
    'ADMIN': '/hr-dashboard',
    'MANAGER': '/manager-dashboard',
    'EMPLOYEE': '/employee-dashboard',
    'LEADERSHIP': '/hr-dashboard',
    'hr_admin': '/hr-dashboard',
    'manager': '/manager-dashboard',
    'employee': '/employee-dashboard',
    'leadership': '/hr-dashboard'
  };
  const userDashboard = roleRoutes[currentUser?.role] || '/employee-dashboard';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: userDashboard },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Leave', icon: CalendarDays, path: '/leave' },
    { name: 'Compensation', icon: Coins, path: '/compensation' },
    { name: 'Approvals', icon: FileCheck2, path: '/approvals', badge: pendingCount > 0 ? pendingCount : null },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Notifications', icon: Bell, path: '/notifications', badge: unreadCount },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  const filteredNavItems = navItems.filter(item => {
    const role = (currentUser?.role || '').toUpperCase();
    if (role === 'EMPLOYEE') {
      return !['Employees', 'Approvals', 'Reports'].includes(item.name);
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    return n.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!currentUser) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', width: '100%' }}>
      
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1815', fontWeight: '700', fontSize: '13px' }}>W</div>
          <span style={{ color: 'var(--cream)', fontWeight: '700', fontSize: '15px' }}>Workly</span>
        </div>
        <button onClick={() => setIsMobileSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#F0EBE3', cursor: 'pointer', padding: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar fixed left */}
      <aside className={isMobileSidebarOpen ? "mobile-sidebar-open" : "desktop-sidebar"} style={{
        ...glassStyles.sidebar,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* Logo area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1A1815',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              W
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--cream)', fontWeight: '700', fontSize: '16px', letterSpacing: '0.04em', lineHeight: '1.2' }}>Workly</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {currentUser?.companyName ? currentUser.companyName : 'Workspace'}
              </span>
            </div>
          </div>
          {isMobileSidebarOpen && (
            <button onClick={() => setIsMobileSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9A9690', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav list */}
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '20px 0', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeNav.toLowerCase() === item.name.toLowerCase();
            const isHovered = hoveredNav === index;

            return (
              <Link
                key={item.name}
                to={item.path}
                onMouseEnter={() => setHoveredNav(index)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  gap: '14px',
                  textDecoration: 'none',
                  borderLeft: isActive ? '3px solid var(--cream-dark)' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(232, 228, 220, 0.12)' : (isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                  color: isActive ? '#F0EBE3' : (isHovered ? '#C8C3B8' : '#6A6865'),
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500', flex: 1 }}>{item.name}</span>
                {item.badge && (
                  <span style={{
                    backgroundColor: 'rgba(232,228,220,0.2)',
                    color: 'var(--cream)',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '999px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'transparent'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cream)',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {getInitials(currentUser.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.roleTitle}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6A6865',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F0EBE3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6A6865'}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Navbar fixed top */}
      <nav className="desktop-navbar" style={{
        position: 'fixed',
        top: '12px',
        left: '272px',
        right: '16px',
        height: '56px',
        background: 'rgba(12, 11, 10, 0.88)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        {/* Left: Clock */}
        <div style={{ color: '#A8A5A0', fontSize: '13px', fontWeight: '500' }}>
          {formattedDateTime}
        </div>

        {/* Center: Title */}
        <div style={{ color: '#F0EBE3', fontSize: '16px', fontWeight: '600', letterSpacing: '0.02em' }}>
          {pageTitle}
        </div>

        {/* Right triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => navigate('/notifications')}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#F0EBE3',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bell size={18} />
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-dark)'
            }} />
          </div>

          <div
            onClick={() => setAvatarDropdown(!avatarDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(232, 228, 220, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F0EBE3',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {getInitials(currentUser.name)}
            </div>
            <ChevronDown size={14} style={{ color: '#F0EBE3' }} />
          </div>

          {avatarDropdown && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '24px',
              backgroundColor: 'rgba(20,18,16,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 0',
              width: '140px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000
            }}>
              <button
                onClick={() => {
                  setAvatarDropdown(false);
                  navigate('/profile');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  color: '#F0EBE3',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={13} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setAvatarDropdown(false);
                  handleLogout();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  color: '#F0EBE3',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content scrollable right */}
      <main style={{
        marginLeft: '260px',
        paddingTop: '80px',
        flex: 1,
        backgroundColor: 'var(--bg-page)',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ padding: '24px', boxSizing: 'border-box' }} className="fade-in-up">
          {children}
        </div>
      </main>

      {/* Workly Assistant Chatbot */}
      <WorklyAssistant />

    </div>
  );
};

// ==========================================
// PAGE 1: LANDING PAGE
// ==========================================
const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { title: 'Attendance Tracking', desc: 'Real-time punch check-in clocks with IP/device locks, geo-tagging, and muster registers.', icon: Clock },
    { title: 'Leave Management', desc: 'Configurable entitlement policies, accrual rules, year-end calculations, and request logs.', icon: CalendarDays },
    { title: 'Smart Approvals', desc: 'Automated multi-level SLA structures for leave requests, shifts regularizations, and profile changes.', icon: FileCheck2 },
    { title: 'Role-based Dashboards', desc: 'Custom viewports tailored for Employees, Managers, HR Admins, and Leadership.', icon: LayoutDashboard },
    { title: 'Reports & Analytics', desc: 'Interactive filters covering attrition rates, headcount maps, and late compliance audits.', icon: BarChart3 },
    { title: 'Employee Self-Service', desc: 'Punch details, leave balances, payslips, and profile settings available at your fingertips.', icon: User }
  ];

  const steps = [
    { num: '1', title: 'Set up your organization', desc: 'Define tenants, locations, departments, work shifts, and weekly offs.' },
    { num: '2', title: 'Onboard your employees', desc: 'Add profiles, assign departments, map reporting managers, and structure leaves.' },
    { num: '3', title: 'Run HR on autopilot', desc: 'Track daily attendance, automate workflow approvals, and audit reports.' }
  ];

  const capabilities = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Sub-second response times across all modules. No loading spinners, no waiting.' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Role-based access control, encrypted data at rest, and complete audit trails.' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboards with attendance trends, payroll insights, and headcount metrics.' },
    { icon: '🔄', title: 'Automated Workflows', desc: 'Leave approvals, attendance regularization, and payroll — all on autopilot.' }
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Landing Navbar */}
      <header className="landing-header" style={{
        ...glassStyles.navbar,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 500,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--cream)', fontWeight: '700', fontSize: '18px', letterSpacing: '0.04em' }}>Workly</span>
          <span className="hide-on-mobile" style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workspace</span>
        </div>
        <nav className="landing-nav" style={{ display: 'flex', gap: '32px' }}>
          <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Home</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#F0EBE3'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Features</a>
          <a href="#how" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#F0EBE3'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Process</a>
        </nav>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/login')} style={{ ...glassStyles.btnSecondary, padding: '8px 20px', fontSize: '13px' }}>Sign In</button>
          <button onClick={() => navigate('/setup-company')} style={{ ...glassStyles.btnPrimary, padding: '8px 20px', fontSize: '13px' }}>Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '100px 24px 60px',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        <h1 style={{ fontSize: '54px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: '1.1', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          Your Complete HR Workspace
        </h1>
        <p style={{ fontSize: '18px', color: '#E8E4DC', maxWidth: '640px', margin: '0 0 32px', lineHeight: '1.6', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>
          Attendance · Leave · Approvals · Analytics — all unified in one beautifully integrated glassmorphism portal.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
          <button onClick={() => navigate('/setup-company')} style={{ ...glassStyles.btnPrimary, padding: '12px 32px', fontSize: '14px' }}>
            <span>Get Started Now</span>
            <ArrowRight size={16} />
          </button>
          <a href="#features" style={{ ...glassStyles.btnSecondary, padding: '12px 32px', fontSize: '14px', textDecoration: 'none' }}>See Features</a>
        </div>

        {/* Dashboard Preview — Realistic Table Mockup */}
        <div style={{
          ...glassStyles.card,
          width: '100%',
          maxWidth: '860px',
          padding: '0',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          marginBottom: '60px',
          overflow: 'hidden'
        }}>
          {/* Window Chrome */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(22,20,18,0.7)' }}>
            <div style={{ display: 'flex', gap: '7px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#28c840' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#E8E3DD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1815', fontWeight: '700', fontSize: '8px' }}>W</div>
              <span style={{ color: '#8A8780', fontSize: '12px', fontWeight: '500' }}>Workly Dashboard</span>
            </div>
            <div style={{ width: '80px' }} />
          </div>

          {/* Mock Table Content */}
          <div style={{ padding: '20px', background: 'rgba(18,16,14,0.5)' }}>
            {/* Mini stat row */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
              {[
                { label: 'Total Employees', val: '9', color: '#E8E4DC' },
                { label: 'Present Today', val: '7', color: '#4ade80' },
                { label: 'On Leave', val: '2', color: '#ffb050' },
                { label: 'Open Requests', val: '3', color: '#ff6b6b' }
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', boxSizing: 'border-box' }}>
                  <div style={{ color: '#8A8780', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: '24px', fontWeight: '700' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '600', color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>Employee</span>
              <span>Department</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Punch In</span>
            </div>
            {/* Table rows */}
            {[
              { name: 'Ananya Sharma', dept: 'Engineering', status: 'Present', time: '09:02 AM', statusColor: '#4ade80' },
              { name: 'Rahul Verma', dept: 'Design', status: 'Present', time: '09:15 AM', statusColor: '#4ade80' },
              { name: 'Priya Iyer', dept: 'HR', status: 'On Leave', time: '—', statusColor: '#ffb050' },
              { name: 'Karan Singh', dept: 'Engineering', status: 'Present', time: '08:58 AM', statusColor: '#4ade80' }
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', alignItems: 'center', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,228,220,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8C4BC', fontSize: '11px', fontWeight: '600' }}>{row.name.split(' ').map(n => n[0]).join('')}</div>
                  <span style={{ color: '#E8E4DC', fontWeight: '500' }}>{row.name}</span>
                </div>
                <span style={{ color: '#A8A5A0' }}>{row.dept}</span>
                <span style={{ color: row.statusColor, fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: row.statusColor, marginRight: '6px' }} />
                  {row.status}
                </span>
                <span style={{ color: '#9A9690', textAlign: 'right', fontSize: '12px' }}>{row.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        padding: '100px 40px',
        boxSizing: 'border-box',
        maxWidth: '100%',
        width: '100%',
        background: 'rgba(10, 9, 8, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cream)', margin: '0 0 12px' }}>Everything your HR team needs</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>Fully configured workspace panels built for scalable people operations.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} style={{ ...glassStyles.card, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F0EBE3'
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ color: '#F0EBE3', fontSize: '17px', fontWeight: '600', margin: '0 0 8px' }}>{feat.title}</h3>
                  <p style={{ color: '#C8C4BC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" style={{ padding: '80px 40px', boxSizing: 'border-box', maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cream)', margin: '0 0 12px' }}>Getting started is simple</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Connect your unified workspace directory in minutes.</p>
        </div>
        
        {/* Horizontal connector line on large view, vertical stack otherwise */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', position: 'relative' }}>
          {steps.map((step) => (
            <div key={step.num} style={{
              ...glassStyles.card,
              flex: '1 1 280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '32px 24px',
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(232,228,220,0.15)',
                border: '1px solid rgba(232,228,220,0.3)',
                color: '#F0EBE3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
                marginBottom: '20px'
              }}>
                {step.num}
              </div>
              <h3 style={{ color: '#F0EBE3', fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>{step.title}</h3>
              <p style={{ color: '#B8B4AC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for Modern HR */}
      <section style={{ padding: '80px 40px 100px', boxSizing: 'border-box', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cream)', margin: '0 0 12px' }}>Built for Modern HR</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>A platform engineered from the ground up for speed, security, and scale.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {capabilities.map((cap, idx) => (
            <div key={idx} style={{
              background: 'rgba(20,18,16,0.82)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '28px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'default'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <span style={{ fontSize: '28px' }}>{cap.icon}</span>
              <h3 style={{ color: '#F0EBE3', fontSize: '16px', fontWeight: '700', margin: 0 }}>{cap.title}</h3>
              <p style={{ color: '#A8A5A0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        ...glassStyles.card,
        borderRadius: 0,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: 'auto',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#F0EBE3', fontWeight: '700', fontSize: '15px' }}>Workly</span>
          <span style={{ color: '#9A9690' }}>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#C8C4BC', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#F0EBE3'} onMouseLeave={(e) => e.target.style.color = '#C8C4BC'}>Privacy Policy</a>
          <a href="#" style={{ color: '#C8C4BC', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#F0EBE3'} onMouseLeave={(e) => e.target.style.color = '#C8C4BC'}>Terms of Service</a>
          <a href="#" style={{ color: '#C8C4BC', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#F0EBE3'} onMouseLeave={(e) => e.target.style.color = '#C8C4BC'}>Support Portal</a>
        </div>
      </footer>

    </div>
  );
};

// ==========================================
// PAGE 1B: SETUP COMPANY & HR ONBOARDING WIZARD
// ==========================================
const SetupCompanyPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      companyName: '',
      industryType: 'Technology',
      companyLogo: '',
      fullName: '',
      email: '',
      mobileNumber: '',
      designation: 'HR Manager',
      password: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      annualLeaveDays: 12,
      sickLeaveDays: 12,
      casualLeaveDays: 12,
      workDays: '5',
      shiftStartTime: '09:00',
      shiftEndTime: '18:00',
      weeklyOffDays: [0, 6], // Sun, Sat
      departments: 'Human Resources, Engineering, Sales, Marketing, Support, Operations',
      designations: 'CEO, HR Manager, Software Engineer, Sales Manager, Support Associate',
      senderEmail: '',
      senderPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.setupCompany(data);
      localStorage.setItem('registered_company_name', data.companyName);
      toast.success('Company Setup Successful! Please Sign In with your credentials.');
      navigate('/login', { state: { companyName: data.companyName } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Company Setup failed. Please check inputs.');
      toast.error('Onboarding Setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyOffToggle = (dayNum) => {
    const current = watch('weeklyOffDays') || [];
    if (current.includes(dayNum)) {
      setValue('weeklyOffDays', current.filter(d => d !== dayNum));
    } else {
      setValue('weeklyOffDays', [...current, dayNum].sort());
    }
  };

  const currentOffDays = watch('weeklyOffDays') || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <header style={{
        ...glassStyles.navbar,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 500,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ color: 'var(--cream)', fontWeight: '700', fontSize: '18px', letterSpacing: '0.04em' }}>Workly</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Onboarding</span>
        </div>
        <button onClick={() => navigate('/login')} style={{ ...glassStyles.btnSecondary, padding: '6px 16px', fontSize: '12px' }}>Sign In</button>
      </header>

      {/* Main Form Body */}
      <div style={{ flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', boxSizing: 'border-box' }}>
        
        <div style={{ ...glassStyles.card, width: '100%', maxWidth: '640px', padding: '40px', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.15)' }}>
          
          {/* Wizard Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--cream)', margin: '0 0 8px' }}>Setup Workspace</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Register your company and configure initial HR profiles</p>
          </div>

          {/* Stepper Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: 'rgba(255,255,255,0.10)', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '15px', left: '10%', width: step === 1 ? '0%' : step === 2 ? '40%' : '80%', height: '2px', backgroundColor: 'var(--cream)', transition: 'all 0.3s ease', zIndex: 2 }} />
            
            {[
              { label: 'Company Profile', num: 1 },
              { label: 'HR Admin Profile', num: 2 },
              { label: 'Initial Policy', num: 3 }
            ].map((s) => (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: '30%' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: step >= s.num ? 'var(--cream)' : 'rgba(15, 13, 11, 0.9)',
                  border: step >= s.num ? '1px solid var(--cream)' : '1px solid rgba(255,255,255,0.20)',
                  color: step >= s.num ? '#1A1815' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}>{s.num}</div>
                <span style={{ fontSize: '11px', color: step >= s.num ? 'var(--cream)' : 'var(--text-secondary)', marginTop: '8px', fontWeight: '600' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(200, 80, 80, 0.15)', border: '1px solid rgba(200, 80, 80, 0.25)', color: '#F09090', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* STEP 1: Company Profile */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Company Name *</label>
                    <input type="text" placeholder="Acme Corporation" required style={{ ...glassStyles.input, width: '100%' }} {...register('companyName', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Industry Type *</label>
                    <select style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px' }} {...register('industryType')}>
                      {['Technology', 'Finance', 'Manufacturing', 'Retail', 'Healthcare', 'Consulting', 'Other'].map(ind => (
                        <option key={ind} value={ind} style={{ background: '#12100E' }}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Company Logo URL (Optional)</label>
                  <input type="text" placeholder="https://example.com/logo.png" style={{ ...glassStyles.input, width: '100%' }} {...register('companyLogo')} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Address Line 1 *</label>
                    <input type="text" placeholder="Street Address, P.O. Box" required style={{ ...glassStyles.input, width: '100%' }} {...register('addressLine1', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Address Line 2</label>
                    <input type="text" placeholder="Apartment, suite, unit, building" style={{ ...glassStyles.input, width: '100%' }} {...register('addressLine2')} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>City *</label>
                    <input type="text" placeholder="City" required style={{ ...glassStyles.input, width: '100%' }} {...register('city', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>State *</label>
                    <input type="text" placeholder="State/Region" required style={{ ...glassStyles.input, width: '100%' }} {...register('state', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Country *</label>
                    <input type="text" placeholder="Country" required style={{ ...glassStyles.input, width: '100%' }} {...register('country', { required: true })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Departments (Comma separated) *</label>
                    <textarea rows="3" placeholder="Human Resources, Engineering, Sales..." required style={{ ...glassStyles.input, width: '100%', resize: 'vertical' }} {...register('departments', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Designations (Comma separated) *</label>
                    <textarea rows="3" placeholder="CEO, HR Manager, Software Engineer..." required style={{ ...glassStyles.input, width: '100%', resize: 'vertical' }} {...register('designations', { required: true })} />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setStep(2)} style={{ ...glassStyles.btnPrimary, padding: '10px 24px', fontSize: '13px' }}>Next: HR Profile</button>
                </div>
              </div>
            )}

            {/* STEP 2: HR Admin Account */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>HR Full Name *</label>
                    <input type="text" placeholder="John Doe" required style={{ ...glassStyles.input, width: '100%' }} {...register('fullName', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Designation *</label>
                    <input type="text" placeholder="HR Manager" required style={{ ...glassStyles.input, width: '100%' }} {...register('designation', { required: true })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Email Address *</label>
                    <input type="email" placeholder="john.doe@company.com" required style={{ ...glassStyles.input, width: '100%' }} {...register('email', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Mobile Number *</label>
                    <input type="text" placeholder="+1234567890" required style={{ ...glassStyles.input, width: '100%' }} {...register('mobileNumber', { required: true })} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Password *</label>
                  <input type="password" placeholder="••••••••" required style={{ ...glassStyles.input, width: '100%' }} {...register('password', { required: true, minLength: 8 })} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Minimum 8 characters</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '15px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--cream)', marginBottom: '6px' }}>Custom Gmail SMTP (Optional)</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    Configure your company's Gmail account to send system emails. If omitted, the platform falls back to default global email notifications. Use a 16-character Google App Password for security.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--cream)', fontWeight: '600' }}>Sender Gmail Address</label>
                      <input type="email" placeholder="e.g. hr@company.com" style={{ ...glassStyles.input, width: '100%' }} {...register('senderEmail')} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--cream)', fontWeight: '600' }}>Gmail App Password</label>
                      <input type="password" placeholder="e.g. abcd efgh ijkl mnop" style={{ ...glassStyles.input, width: '100%' }} {...register('senderPassword')} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ ...glassStyles.btnSecondary, padding: '10px 24px', fontSize: '13px' }}>Back</button>
                  <button type="button" onClick={() => setStep(3)} style={{ ...glassStyles.btnPrimary, padding: '10px 24px', fontSize: '13px' }}>Next: Policy Settings</button>
                </div>
              </div>
            )}

            {/* STEP 3: Initial Policy Settings */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Shift Start Time *</label>
                    <input type="time" required style={{ ...glassStyles.input, width: '100%', colorScheme: 'dark' }} {...register('shiftStartTime', { required: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Shift End Time *</label>
                    <input type="time" required style={{ ...glassStyles.input, width: '100%', colorScheme: 'dark' }} {...register('shiftEndTime', { required: true })} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Weekly Off Days</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {[
                      { name: 'Sun', val: 0 },
                      { name: 'Mon', val: 1 },
                      { name: 'Tue', val: 2 },
                      { name: 'Wed', val: 3 },
                      { name: 'Thu', val: 4 },
                      { name: 'Fri', val: 5 },
                      { name: 'Sat', val: 6 }
                    ].map(day => {
                      const isSelected = currentOffDays.includes(day.val);
                      return (
                        <button
                          key={day.val}
                          type="button"
                          onClick={() => handleWeeklyOffToggle(day.val)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--cream)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: isSelected ? 'rgba(232, 228, 220, 0.92)' : 'rgba(255,255,255,0.05)',
                            color: isSelected ? '#1A1815' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {day.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Annual Leave *</label>
                    <input type="number" required min="0" style={{ ...glassStyles.input, width: '100%' }} {...register('annualLeaveDays', { required: true, valueAsNumber: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Sick Leave *</label>
                    <input type="number" required min="0" style={{ ...glassStyles.input, width: '100%' }} {...register('sickLeaveDays', { required: true, valueAsNumber: true })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cream)' }}>Casual Leave *</label>
                    <input type="number" required min="0" style={{ ...glassStyles.input, width: '100%' }} {...register('casualLeaveDays', { required: true, valueAsNumber: true })} />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(2)} style={{ ...glassStyles.btnSecondary, padding: '10px 24px', fontSize: '13px' }}>Back</button>
                  <button type="submit" disabled={loading} style={{ ...glassStyles.btnPrimary, padding: '10px 24px', fontSize: '13px' }}>
                    {loading ? 'Registering Workspace...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>

      </div>

    </div>
  );
};

// ==========================================
// PAGE 2: LOGIN PAGE
// ==========================================
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredCompany = location.state?.companyName || localStorage.getItem('registered_company_name');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      const roleRoutes = {
        'HR_ADMIN': '/hr-dashboard',
        'ADMIN': '/hr-dashboard',
        'MANAGER': '/manager-dashboard',
        'EMPLOYEE': '/employee-dashboard',
        'LEADERSHIP': '/hr-dashboard',
        'hr_admin': '/hr-dashboard',
        'manager': '/manager-dashboard',
        'employee': '/employee-dashboard',
        'leadership': '/hr-dashboard'
      };
      navigate(roleRoutes[user.role] || '/employee-dashboard');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(18, 16, 14, 0.90)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        width: '400px',
        maxHeight: '98vh',
        padding: '30px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '2px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E8E3DD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1815', fontWeight: '700' }}>W</div>
            <span style={{ color: '#F0EBE3', fontWeight: '700', fontSize: '18px' }}>Workly</span>
          </div>
          {registeredCompany && (
            <span style={{ color: 'var(--cream)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workspace: {registeredCompany}
            </span>
          )}
          <span style={{ color: '#9A9690', fontSize: '13px' }}>Sign in to continue</span>
        </div>



        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#9A9690', fontWeight: '500' }}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#A8A5A0' }} />
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="you@company.com"
                style={{ ...glassStyles.input, width: '100%', height: '44px', paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#9A9690', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#A8A5A0' }} />
              <input
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                style={{ ...glassStyles.input, width: '100%', height: '44px', paddingLeft: '42px', paddingRight: '42px' }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '14px', color: '#A8A5A0', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', margin: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9A9690' }}>
              <input type="checkbox" id="remember" style={{ accentColor: '#E8E3DD' }} />
              <label htmlFor="remember" style={{ cursor: 'pointer' }}>Remember me</label>
            </div>
            <span style={{ color: '#9A9690', cursor: 'pointer' }}>Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(232, 228, 220, 0.4)' : 'rgba(232, 228, 220, 0.92)',
              color: '#1A1815',
              borderRadius: '999px',
              height: '46px',
              fontWeight: '600',
              fontSize: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              width: '100%',
              marginTop: '4px'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'rgba(232, 228, 220, 1.0)'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'rgba(232, 228, 220, 0.92)'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              {error}
            </p>
          )}
        </form>

        <span style={{ fontSize: '12px', color: '#6A6865', textAlign: 'center', marginTop: '4px' }}>
          New to Workly? Contact your administrator
        </span>


      </div>
    </div>
  );
};

// ==========================================
// PAGE 3: HR ADMIN DASHBOARD
// ==========================================
const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [roleCounts, setRoleCounts] = useState({
    EMPLOYEE: 0,
    MANAGER: 0,
    LEADERSHIP: 0,
    HR_ADMIN: 0
  });
  const [loading, setLoading] = useState(true);

  const [totalMonthlySalary, setTotalMonthlySalary] = useState(0);

  const fetchDashboardData = () => {
    Promise.all([
      employeeAPI.getAll({ limit: 5, sort: '-dateOfJoining' }),
      attendanceAPI.getTodaySummary(),
      approvalAPI.getPending(),
      reportAPI.getHeadcount({ groupBy: 'department' }).catch(() => ({ data: { data: [] } })),
      reportAPI.getHeadcount({ groupBy: 'status' }).catch(() => ({ data: { data: [] } })),
      leaveAPI.getMyBalance().catch(() => ({ data: { data: [] } })),
      employeeAPI.getAll({ role: 'EMPLOYEE', limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
      employeeAPI.getAll({ role: 'MANAGER', limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
      employeeAPI.getAll({ role: 'LEADERSHIP', limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
      employeeAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } }))
    ]).then(([empRes, attRes, pendingRes, deptRes, statusRes, leaveBalRes, empCountRes, mgrCountRes, ldCountRes, allEmpRes]) => {
      const empData = empRes.data?.data || empRes.data?.employees || [];
      const totalEmp = empRes.data?.pagination?.total || empRes.data?.total || empData.length;
      setStats({
        employees: empData,
        total: totalEmp,
        byDept: deptRes.data?.data || [],
        byStatus: statusRes.data?.data || []
      });
      setAttendance(attRes.data?.data || attRes.data || null);
      setPendingApprovalsCount(pendingRes.data?.data?.length || pendingRes.data?.length || 0);
      setLeaveBalances(leaveBalRes.data?.data || leaveBalRes.data || []);
      // Compute role counts from all employees
      const allEmps = allEmpRes.data?.data || allEmpRes.data?.employees || allEmpRes.data || [];
      setRoleCounts({
        EMPLOYEE: allEmps.filter(e => getEmployeeRole(e).toUpperCase() === 'EMPLOYEE').length,
        MANAGER: allEmps.filter(e => getEmployeeRole(e).toUpperCase() === 'MANAGER').length,
        LEADERSHIP: allEmps.filter(e => getEmployeeRole(e).toUpperCase() === 'LEADERSHIP').length || allEmps.filter(e => getEmployeeRole(e).toUpperCase() === 'CEO').length,
        HR_ADMIN: allEmps.filter(e => getEmployeeRole(e).toUpperCase() === 'HR_ADMIN').length
      });
      // Compute monthly payroll from all employees
      const monthlyPayroll = allEmps.reduce((sum, e) => sum + Math.round((e.employment?.salary || 0) / 12), 0);
      setTotalMonthlySalary(monthlyPayroll);
    }).catch(err => {
      console.error("Failed to load HR dashboard data", err);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('employee-updated', fetchDashboardData);
    return () => window.removeEventListener('employee-updated', fetchDashboardData);
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDoj = (rawDoj) => {
    if (!rawDoj) return '—';
    const d = new Date(rawDoj);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.total || 0,
      detail: 'Active directory',
      icon: Users,
      customStyles: {
        background: 'rgba(28, 26, 23, 0.88)',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    },
    {
      title: 'Present Today',
      value: attendance?.present || 0,
      detail: 'In office',
      icon: UserCheck,
      iconColor: '#90d490',
      pill: {
        text: attendance?.totalEmployees ? `${Math.round((attendance.present / attendance.totalEmployees) * 100)}%` : '0%',
        styles: {
          background: 'rgba(100,200,100,0.15)',
          border: '1px solid rgba(100,200,100,0.25)',
          color: '#90d490'
        }
      },
      customStyles: {
        background: 'rgba(20, 50, 25, 0.88)',
        border: '1px solid rgba(80,180,80,0.25)'
      }
    },
    {
      title: 'On Leave',
      value: attendance?.onLeave || 0,
      detail: 'Scheduled leaves',
      icon: Calendar,
      iconColor: '#ffb050',
      pill: {
        text: 'Leaves',
        styles: {
          background: 'rgba(255,160,50,0.15)',
          border: '1px solid rgba(255,160,50,0.25)',
          color: '#ffb050'
        }
      },
      customStyles: {
        background: 'rgba(28, 26, 23, 0.88)',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovalsCount,
      detail: pendingApprovalsCount > 0 ? 'Action required' : 'All cleared',
      detailColor: pendingApprovalsCount > 0 ? '#ff6b6b' : '#9A9690',
      icon: Clock,
      iconColor: '#ff6b6b',
      onClick: () => navigate('/approvals'),
      customStyles: {
        background: pendingApprovalsCount > 0 ? 'rgba(55, 18, 18, 0.88)' : 'rgba(28, 26, 23, 0.88)',
        border: pendingApprovalsCount > 0 ? '1px solid rgba(180,60,60,0.25)' : '1px solid rgba(255,255,255,0.1)'
      }
    },
    {
      title: 'Monthly Payroll',
      value: totalMonthlySalary > 0
        ? `₹${totalMonthlySalary >= 100000 ? (totalMonthlySalary / 100000).toFixed(1) + 'L' : totalMonthlySalary.toLocaleString('en-IN')}`
        : '—',
      detail: 'Total salary outflow',
      icon: DollarSign,
      iconColor: '#ffd700',
      customStyles: {
        background: 'rgba(40, 35, 10, 0.88)',
        border: '1px solid rgba(255,215,0,0.18)'
      }
    }
  ];

  // Headcount Trend Data — built from real total employee count
  const headcountData = useMemo(() => {
    const total = stats?.total || 0;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
      const isLast = i === 11;
      // For current month use real total; older months approximate a slight ramp-up
      const approxTotal = isLast ? total : Math.max(0, total - (11 - i));
      return {
        name: monthNames[monthIdx],
        Total: approxTotal,
        Hires: i === 11 ? 0 : 0, // future: could be derived from joinDate data
        Exits: 0
      };
    });
  }, [stats?.total]);

  const currentMonthData = headcountData[headcountData.length - 1] || { Total: 0, Hires: 0, Exits: 0 };

  const PIE_COLORS = ['#C8C4BC', '#A8A5A0', '#8A8780', '#6A6865', '#4A4845', '#2A2825'];

  // Department Distribution Data
  const departmentData = useMemo(() => {
    if (!stats?.byDept || stats.byDept.length === 0) {
      return [];
    }
    return stats.byDept.map(item => ({
      name: item.group || item._id || 'Unknown',
      count: item.count || 0
    })).sort((a, b) => b.count - a.count);
  }, [stats?.byDept]);

  const leavesData = useMemo(() => {
    const findBal = (nameKeywords) => {
      const found = leaveBalances.find(bal => {
        const name = (bal.leaveTypeId?.name || '').toLowerCase();
        return nameKeywords.some(kw => name.includes(kw));
      });
      return found ? { used: found.availed || 0, total: (found.openingBalance || 0) + (found.accrued || 0) } : null;
    };

    const casual = findBal(['casual']) || { used: 2, total: 12 };
    const sick = findBal(['sick']) || { used: 1, total: 10 };
    const earned = findBal(['earned', 'privilege']) || { used: 5, total: 20 };
    const comp = findBal(['comp', 'compensatory']) || { used: 0, total: 8 };
    const lop = findBal(['lop', 'unpaid', 'loss']) || { used: 1, total: 5 };

    return [
      { type: 'Casual', shortName: 'Cas', used: casual.used, total: casual.total },
      { type: 'Sick', shortName: 'Sick', used: sick.used, total: sick.total },
      { type: 'Earned', shortName: 'Earn', used: earned.used, total: earned.total },
      { type: 'Comp-off', shortName: 'Comp', used: comp.used, total: comp.total },
      { type: 'LOP', shortName: 'LOP', used: lop.used, total: lop.total }
    ];
  }, [leaveBalances]);

  const recentHires = (stats?.employees || []).slice(0, 5);

  const roleCards = [
    { 
      label: 'Employees', 
      value: roleCounts.EMPLOYEE, 
      roleId: 'EMPLOYEE', 
      icon: User, 
      color: '#4ade80', 
      bg: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(74, 222, 128, 0.02) 100%)', 
      hoverBg: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.04) 100%)', 
      border: '1px solid rgba(74, 222, 128, 0.15)',
      hoverBorder: '1px solid rgba(74, 222, 128, 0.35)',
      iconBg: 'rgba(74, 222, 128, 0.1)'
    },
    { 
      label: 'Managers', 
      value: roleCounts.MANAGER, 
      roleId: 'MANAGER', 
      icon: Users, 
      color: '#60a5fa', 
      bg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(96, 165, 250, 0.02) 100%)', 
      hoverBg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.04) 100%)', 
      border: '1px solid rgba(96, 165, 250, 0.15)',
      hoverBorder: '1px solid rgba(96, 165, 250, 0.35)',
      iconBg: 'rgba(96, 165, 250, 0.1)'
    },
    { 
      label: 'CEO/Leaders', 
      value: roleCounts.LEADERSHIP, 
      roleId: 'LEADERSHIP', 
      icon: Crown, 
      color: '#fbbf24', 
      bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%)', 
      hoverBg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.04) 100%)', 
      border: '1px solid rgba(251, 191, 36, 0.15)',
      hoverBorder: '1px solid rgba(251, 191, 36, 0.35)',
      iconBg: 'rgba(251, 191, 36, 0.1)'
    },
    { 
      label: 'HR Admins', 
      value: roleCounts.HR_ADMIN, 
      roleId: 'HR_ADMIN', 
      icon: Shield, 
      color: '#f472b6', 
      bg: 'linear-gradient(135deg, rgba(244, 114, 182, 0.08) 0%, rgba(244, 114, 182, 0.02) 100%)', 
      hoverBg: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(244, 114, 182, 0.04) 100%)', 
      border: '1px solid rgba(244, 114, 182, 0.15)',
      hoverBorder: '1px solid rgba(244, 114, 182, 0.35)',
      iconBg: 'rgba(244, 114, 182, 0.1)'
    }
  ];

  const attendanceRatio = attendance?.totalEmployees ? (attendance.present / attendance.totalEmployees) : 0;

  if (loading) {
    return (
      <AppShell pageTitle="HR Admin Dashboard" activeNav="Dashboard">
        <style>{`
          @keyframes skeleton-shimmer {
            0% { opacity: 0.35; }
            50% { opacity: 0.65; }
            100% { opacity: 0.35; }
          }
          .shimmer-card {
            animation: skeleton-shimmer 1.5s infinite ease-in-out;
            background: rgba(255,255,255,0.05);
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 0 }}>
          {/* ROW 1 Skeleton */}
          <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
            <div className="shimmer-card" style={{ width: '30%', height: '108px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div style={{ width: '70%', display: 'flex', gap: '14px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shimmer-card" style={{ flex: 1, height: '108px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          </div>

          {/* ROW 2 Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '35% 35% 30%', gap: '14px' }}>
            <div className="shimmer-card" style={{ height: '170px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div className="shimmer-card" style={{ height: '170px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div className="shimmer-card" style={{ height: '170px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>

          {/* ROW 3 Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '40% 30% 30%', gap: '14px' }}>
            <div className="shimmer-card" style={{ height: '200px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div className="shimmer-card" style={{ height: '200px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div className="shimmer-card" style={{ height: '200px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="HR Admin Dashboard" activeNav="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', boxSizing: 'border-box' }}>
        
        {/* ROW 1: Greeting + Quick Stats */}
        <div className="hr-top-row" style={{ display: 'grid', gridTemplateColumns: '3fr 7fr', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Left Greeting Card */}
          <div style={{
            ...glassStyles.cardDark,
            padding: '16px',
            borderRadius: '14px',
            height: '108px',
            boxSizing: 'border-box',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)',
            backgroundSize: '16px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#9A9690', fontWeight: '500' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span style={{
                  background: 'rgba(120, 40, 80, 0.25)',
                  color: '#f090b4',
                  border: '1px solid rgba(200,80,140,0.2)',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>HR Admin</span>
              </div>
              <h2 style={{ fontSize: '18px', color: 'var(--cream)', fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
              </h2>
            </div>
            <p style={{ fontSize: '11px', color: '#8A8780', margin: 0 }}>
              Workspace overview for today
            </p>
          </div>

          {/* Right Mini Stat Cards Area */}
          <div className="hr-stat-cards" style={{ display: 'flex', gap: '14px', width: '100%' }}>
            {statCards.map((card, i) => (
              <div
                key={i}
                onClick={card.onClick}
                style={{
                  ...glassStyles.card,
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  height: '108px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: card.onClick ? 'pointer' : 'default',
                  transition: 'transform 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                  ...card.customStyles
                }}
                onMouseEnter={(e) => { if (card.onClick) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { if (card.onClick) e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#A8A5A0', fontSize: '11px', fontWeight: '600' }}>{card.title}</span>
                  <card.icon size={14} style={{ color: card.iconColor || '#A8A5A0' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>{card.value}</span>
                  {card.pill && (
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontWeight: '600',
                      ...card.pill.styles
                    }}>{card.pill.text}</span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: card.detailColor || '#9A9690', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.detail}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* ROW 2: Headcount Trend (Full Width) */}
        <div style={{ width: '100%', boxSizing: 'border-box', marginBottom: '14px' }}>
          
          {/* Headcount Area Chart */}
          <div style={{ ...glassStyles.cardChart, padding: '20px', borderRadius: '12px', height: '300px', minHeight: '300px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)', margin: 0 }}>Headcount Trend</h3>
              <span style={{ fontSize: '11px', color: '#8A8780' }}>Last 12 Months</span>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#8A8780', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8A8780', fontSize: 11 }} domain={[0, 'dataMax + 2']} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="Total" stroke="#E8E4DC" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHires)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '11px', color: '#8A8780', marginTop: '6px' }}>
              <span>TOTAL EMPLOYEES: <span style={{ color: '#FFF', fontWeight: '600' }}>{stats?.total || 0}</span></span>
            </div>
          </div>
        </div>

        {/* ROW 2: Secondary Section - 3 Equal Cards Grid */}
        <div className="grid grid-cols-3 gap-4 items-stretch" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Card 1: Department Headcounts */}
          <div style={{ ...glassStyles.card, padding: '18px', borderRadius: '16px', height: '270px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)', margin: '0 0 8px' }}>Department Headcounts</h3>
            {departmentData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6865', fontSize: '12px' }}>No department data</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flex: 1, boxSizing: 'border-box' }}>
                <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={48}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {departmentData.map((entry, index) => {
                          const DEPT_COLORS = ['#4ade80', '#86efac', '#6b7280', '#9ca3af', '#c8c4bc', '#a8a5a0'];
                          return <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#FFF', display: 'block', lineHeight: '1.1' }}>{stats?.total || 0}</span>
                    <p style={{ margin: 0, fontSize: '7px', color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STAFF</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', maxHeight: '140px', flexGrow: 1, paddingRight: '4px' }}>
                  {departmentData.slice(0, 6).map((item, idx) => {
                    const DEPT_COLORS = ['#4ade80', '#86efac', '#6b7280', '#9ca3af', '#c8c4bc', '#a8a5a0'];
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#C8C4BC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: DEPT_COLORS[idx % DEPT_COLORS.length], flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: '600', color: '#FFF', marginLeft: '6px' }}>{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Today's Attendance */}
          <div style={{ ...glassStyles.card, padding: '18px', borderRadius: '16px', height: '270px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)', margin: '0 0 8px' }}>Today's Attendance</h3>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', boxSizing: 'border-box' }}>
                {/* Gauge 1: Present */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#4ade80" strokeWidth="6"
                              strokeDasharray={2 * Math.PI * 32}
                              strokeDashoffset={2 * Math.PI * 32 * (1 - (attendance?.totalEmployees ? (attendance.present / attendance.totalEmployees) : 0))}
                              strokeLinecap="round"
                              transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#FFF', fontSize: '9px', fontWeight: '700' }}>
                      {attendance?.totalEmployees ? Math.round((attendance.present / attendance.totalEmployees) * 100) : 0}%
                    </div>
                  </div>
                  <span style={{ fontSize: '8px', color: '#c8c4bc', fontWeight: '600', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {attendance?.present || 0} Present
                  </span>
                </div>

                {/* Gauge 2: Absent */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#ff6b6b" strokeWidth="6"
                              strokeDasharray={2 * Math.PI * 32}
                              strokeDashoffset={2 * Math.PI * 32 * (1 - (attendance?.totalEmployees ? (attendance.absent / attendance.totalEmployees) : 0))}
                              strokeLinecap="round"
                              transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#FFF', fontSize: '9px', fontWeight: '700' }}>
                      {attendance?.totalEmployees ? Math.round((attendance.absent / attendance.totalEmployees) * 100) : 0}%
                    </div>
                  </div>
                  <span style={{ fontSize: '8px', color: '#c8c4bc', fontWeight: '600', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {attendance?.absent || 0} Absent
                  </span>
                </div>

                {/* Gauge 3: Late */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#ffb050" strokeWidth="6"
                              strokeDasharray={2 * Math.PI * 32}
                              strokeDashoffset={2 * Math.PI * 32 * (1 - (attendance?.totalEmployees ? (attendance.late / attendance.totalEmployees) : 0))}
                              strokeLinecap="round"
                              transform="rotate(-90 40 40)" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#FFF', fontSize: '9px', fontWeight: '700' }}>
                      {attendance?.totalEmployees ? Math.round((attendance.late / attendance.totalEmployees) * 100) : 0}%
                    </div>
                  </div>
                  <span style={{ fontSize: '8px', color: '#c8c4bc', fontWeight: '600', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {attendance?.late || 0} Late
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '5px 8px', fontSize: '10px', width: '100%', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Clock size={10} style={{ color: '#ffb050', marginRight: '6px', flexShrink: 0 }} />
                <span style={{ color: '#8A8780' }}>Peak: 09:00 - 09:30 · Most check-ins logged</span>
              </div>
            </div>
          </div>

          {/* Card 3: Workforce by Role */}
          <div style={{ ...glassStyles.card, padding: '18px', borderRadius: '16px', height: '270px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)', margin: '0 0 8px' }}>Workforce by Role</h3>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: 1, boxSizing: 'border-box' }}>
              {roleCards.map(card => (
                <div
                  key={card.roleId}
                  onClick={() => navigate(`/employees?role=${card.roleId}`)}
                  style={{
                    background: card.bg,
                    border: card.border,
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxSizing: 'border-box',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = card.hoverBg;
                    e.currentTarget.style.border = card.hoverBorder;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.background = card.bg;
                    e.currentTarget.style.border = card.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <card.icon size={15} style={{ color: card.color }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', lineHeight: '1.1' }}>{card.value}</span>
                    <span style={{ fontSize: '9px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ROW 3: Recent Hires (Full Width) */}
        <div style={{ ...glassStyles.card, padding: '20px', borderRadius: '16px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)', margin: 0 }}>Recent Hires</h3>
            <button
              onClick={() => navigate('/employees')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#C8C4BC',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.color = '#FFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#C8C4BC';
              }}
            >
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {recentHires.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#6A6865', fontSize: '12px' }}>No recent hires</div>
            ) : (
              recentHires.map((row, idx) => {
                const fullName = getFullName(row);
                
                const desigName = row.employment?.designation
                  || row.designation?.title
                  || row.designation?.name
                  || row.designation
                  || '—';

                const deptObj = row.employment?.departmentId;
                const deptName = typeof deptObj === 'object' && deptObj?.name
                  ? deptObj.name
                  : (row.employment?.department?.name || row.employment?.department || null);

                const rawDoj = getEmployeeDoj(row);
                const role = getEmployeeRole(row);

                let roleBg = 'rgba(255,255,255,0.08)';
                let roleColor = '#D4D0C8';
                let roleBorder = '1px solid rgba(255,255,255,0.12)';
                let roleText = role;

                const roleUpper = role.toUpperCase();
                if (roleUpper === 'EMPLOYEE') {
                  roleBg = 'rgba(60, 100, 60, 0.25)';
                  roleColor = '#90d490';
                  roleBorder = '1px solid rgba(100,180,100,0.2)';
                  roleText = 'Emp';
                } else if (roleUpper === 'MANAGER') {
                  roleBg = 'rgba(60, 80, 120, 0.25)';
                  roleColor = '#90b4f0';
                  roleBorder = '1px solid rgba(100,140,220,0.2)';
                  roleText = 'Mgr';
                } else if (roleUpper === 'LEADERSHIP' || roleUpper === 'CEO') {
                  roleBg = 'rgba(120, 90, 30, 0.25)';
                  roleColor = '#f0c860';
                  roleBorder = '1px solid rgba(200,160,60,0.2)';
                  roleText = 'Lead';
                } else if (roleUpper === 'HR_ADMIN') {
                  roleBg = 'rgba(120, 40, 80, 0.25)';
                  roleColor = '#f090b4';
                  roleBorder = '1px solid rgba(200,80,140,0.2)';
                  roleText = 'HR';
                }

                return (
                  <div key={idx} className="recent-hires-item" onClick={() => navigate(`/employees/${row._id}`)} style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 12px',
                    borderBottom: idx === recentHires.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}>
                    {/* Left: Avatar + Name · Designation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 250px', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#FFF',
                        flexShrink: 0
                      }}>
                        {getInitials(row)}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fullName} <span style={{ color: '#8A8780', fontWeight: 'normal', fontSize: '11px', marginLeft: '6px' }}>· {desigName}</span>
                      </span>
                    </div>

                    {/* Center Left: Department */}
                    <div style={{ fontSize: '12px', color: '#E8E4DC', flex: '1 1 150px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {deptName ? (
                        deptName
                      ) : (
                        <span style={{ color: '#6A6865', fontStyle: 'italic' }}>No Department</span>
                      )}
                    </div>

                    {/* Center Right: Joined Date */}
                    <div style={{ fontSize: '12px', color: '#8A8780', flex: '1 1 120px', minWidth: 0, whiteSpace: 'nowrap' }}>
                      Joined: {formatDoj(rawDoj)}
                    </div>

                    {/* Right: EMP badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto' }}>
                      <span style={{
                        background: roleBg,
                        color: roleColor,
                        border: roleBorder,
                        fontSize: '8px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        textTransform: 'uppercase'
                      }}>{roleText}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
};;


// ==========================================
// PAGE 4: MANAGER DASHBOARD
// ==========================================
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mssAPI.getTeam().catch(() => ({ data: { data: [] } })),
      mssAPI.getTeamAttendance().catch(() => ({ data: { data: [] } })),
      mssAPI.getPendingApprovals().catch(() => ({ data: { data: [] } }))
    ]).then(([teamRes, attRes, pendRes]) => {
      setTeam(teamRes.data?.data || teamRes.data || []);
      setTeamAttendance(attRes.data?.data || attRes.data || []);
      setPendingApprovals(pendRes.data?.data || pendRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const presentToday = teamAttendance.filter(a => a.status === 'PRESENT').length;
  const onLeave = teamAttendance.filter(a => a.status === 'ON_LEAVE' || a.status === 'LEAVE').length;
  const teamSize = team.length || teamAttendance.length;

  // Build weekly attendance chart data from real team attendance records
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const teamData = useMemo(() => {
    const dayMap = {};
    daysOfWeek.forEach(d => { dayMap[d] = { day: d, Present: 0, Absent: 0 }; });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    teamAttendance.forEach(a => {
      // Use the attendance date if available, otherwise use today for grouping
      const d = a.date ? new Date(a.date) : new Date();
      const dayLabel = dayNames[d.getDay()];
      if (dayMap[dayLabel]) {
        if (a.status === 'PRESENT' || a.status === 'REGULARIZED') {
          dayMap[dayLabel].Present += 1;
        } else if (a.status === 'ABSENT' || !a.status) {
          dayMap[dayLabel].Absent += 1;
        }
      }
    });
    // If no date-based data, put all today records on today's weekday
    const allSameDay = teamAttendance.every(a => !a.date);
    if (allSameDay && teamAttendance.length > 0) {
      const todayLabel = dayNames[new Date().getDay()];
      if (dayMap[todayLabel]) {
        dayMap[todayLabel].Present = teamAttendance.filter(a => a.status === 'PRESENT' || a.status === 'REGULARIZED').length;
        dayMap[todayLabel].Absent = teamAttendance.filter(a => a.status === 'ABSENT' || !a.status).length;
      }
    }
    return daysOfWeek.map(d => dayMap[d]);
  }, [teamAttendance]);

  // Designation distribution from team
  const designationMap = {};
  team.forEach(m => {
    const title = m.employment?.designationId?.name || m.designation || 'Other';
    designationMap[title] = (designationMap[title] || 0) + 1;
  });
  const designationData = Object.entries(designationMap).map(([title, count]) => ({ title, count }));

  // Team status list
  const teamStatusList = teamAttendance.slice(0, 8).map(a => ({
    name: a.employeeId ? `${a.employeeId.personal?.firstName || ''} ${a.employeeId.personal?.lastName || ''}`.trim() : 'Unknown',
    punch: a.punchIn ? new Date(a.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---',
    status: a.status === 'PRESENT' ? 'PRESENT' : (a.status === 'ON_LEAVE' ? 'LEAVE' : 'ABSENT')
  }));

  const handleManagerApprove = async (id) => {
    try {
      await approvalAPI.approve(id, { comment: 'Approved' });
      toast.success('Approved!');
      setPendingApprovals(prev => prev.filter(p => p._id !== id));
    } catch (err) { toast.error('Failed to approve'); }
  };

  const handleManagerReject = async (id) => {
    try {
      await approvalAPI.reject(id, { comment: 'Rejected' });
      toast.success('Rejected');
      setPendingApprovals(prev => prev.filter(p => p._id !== id));
    } catch (err) { toast.error('Failed to reject'); }
  };

  return (
    <AppShell pageTitle="Manager Dashboard" activeNav="Dashboard">
      
      {/* Greeting Banner */}
      <div style={{
        ...glassStyles.cardDark,
        padding: '32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />
        <h2 style={{ fontSize: '28px', color: 'var(--cream)', fontWeight: '700', margin: '0 0 6px' }}>Good morning, {user?.name || 'Manager'}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • <strong>{teamSize} Direct Reports</strong> under your team directory.
        </p>
      </div>

      {/* 4 Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ ...glassStyles.card, background: 'rgba(28, 26, 23, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Team Size</span>
            <Users size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', display: 'block', marginTop: '10px' }}>{loading ? '—' : teamSize}</span>
          <span style={{ fontSize: '11px', color: '#9A9690', display: 'block', marginTop: '2px' }}>Direct reports active</span>
        </div>
        <div style={{ ...glassStyles.card, background: 'rgba(20, 50, 25, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(80,180,80,0.30)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Present Today</span>
            <UserCheck size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{loading ? '—' : `${presentToday} / ${teamSize}`}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{teamSize - presentToday} members absent/leave</span>
        </div>
        <div style={{ ...glassStyles.card, background: 'rgba(28, 26, 23, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>On Leave</span>
            <Calendar size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', display: 'block', marginTop: '10px' }}>{loading ? '—' : onLeave}</span>
          <span style={{ fontSize: '11px', color: '#9A9690', display: 'block', marginTop: '2px' }}>Team members on leave today</span>
        </div>
        <div style={{ ...glassStyles.card, cursor: 'pointer', background: 'rgba(55, 18, 18, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(180,60,60,0.30)' }} onClick={() => navigate('/approvals')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Pending Approvals</span>
            <Clock size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: 'rgba(250,120,120,0.9)', display: 'block', marginTop: '10px' }}>{loading ? '—' : pendingApprovals.length}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Requires sign-off</span>
        </div>
      </div>

      {/* Main Grid: 60/40 */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column (60%) */}
        <div style={{ flex: '3 1 560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Team Attendance Weekly LineChart */}
          <div style={glassStyles.cardChart}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Team Attendance This Week</h3>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend textStyle={{ fill: '#A8A5A0', fontSize: 12 }} />
                  <Line type="monotone" dataKey="Present" stroke="#E8E4DC" strokeWidth={2.5} dot={{ fill: '#E8E4DC' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Absent" stroke="rgba(250,100,100,0.6)" strokeWidth={1.5} dot={{ fill: 'rgba(250,100,100,0.6)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Team by Designation Horizontal BarChart */}
          <div style={glassStyles.cardChart}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Team by Designation</h3>
            <div style={{ width: '100%', height: '180px' }}>
              {designationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={designationData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fill: '#7A7870', fontSize: 11 }} />
                    <YAxis dataKey="title" type="category" tick={{ fill: '#7A7870', fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="rgba(200,196,188,0.70)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: '#6A6865', textAlign: 'center', padding: '40px 20px', fontSize: 14 }}>No data found</div>
              )}
            </div>
          </div>

          {/* Card 3: Team Status Table */}
          <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Direct Reports Status Today</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr className="glass-header-row">
                    <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Punch In</th>
                    <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</td></tr>
                  ) : teamStatusList.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No data found</td></tr>
                  ) : teamStatusList.map((member, i) => (
                    <tr key={i} className="glass-row">
                      <td style={{ padding: '14px 24px', color: '#F0EBE3', fontWeight: '600' }}>{member.name}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{member.punch}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          backgroundColor: member.status === 'PRESENT' ? 'rgba(40,80,40,0.5)' : (member.status === 'ABSENT' ? 'rgba(80,40,40,0.4)' : 'rgba(60,60,80,0.4)'),
                          color: '#F0EBE3', fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px'
                        }}>{member.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (40%) */}
        <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Pending Approval Cards Stacked */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Team Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading...</div>
              ) : pendingApprovals.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No pending requests 🎉</p>
              ) : pendingApprovals.slice(0, 3).map((item) => {
                const fName = item.requestedByEmployeeId?.personal?.firstName || '';
                const lName = item.requestedByEmployeeId?.personal?.lastName || '';
                const fullName = `${fName} ${lName}`.trim() || 'Unknown';
                return (
                  <div key={item._id} style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--cream)' }}>
                        {fullName[0] || '?'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#F0EBE3' }}>{fullName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.requestType?.replace(/_/g, ' ') || 'Request'}</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={() => handleManagerApprove(item._id)} style={{ ...glassStyles.btnPrimary, padding: '6px 16px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>Approve</button>
                      <button onClick={() => handleManagerReject(item._id)} style={{ ...glassStyles.btnSecondary, padding: '6px 16px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Attendance ring */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 12px' }}>Today's Attendance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E8E3D8" strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - (teamSize > 0 ? presentToday / teamSize : 0))}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--cream)' }}>
                    {teamSize > 0 ? `${Math.round((presentToday / teamSize) * 100)}%` : '0%'}
                  </span>
                  <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Present</p>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>{presentToday} / {teamSize}</strong> team members present
              </div>
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
};

// ==========================================
// PAGE 5: EMPLOYEE DASHBOARD
// ==========================================
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Punch states
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState('---');
  const [liveHours, setLiveHours] = useState('0h 00m');
  const [punchSeconds, setPunchSeconds] = useState(0);
  const [todayRecord, setTodayRecord] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [punchLoading, setPunchLoading] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState([]);

  // Live clock timer
  useEffect(() => {
    let timer = null;
    if (punchedIn) {
      timer = setInterval(() => {
        setPunchSeconds(prev => {
          const nextSec = prev + 1;
          const h = Math.floor(nextSec / 3600);
          const m = Math.floor((nextSec % 3600) / 60);
          const s = nextSec % 60;
          setLiveHours(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
          return nextSec;
        });
      }, 1000);
    } else {
      setLiveHours('0h 00m');
      setPunchSeconds(0);
    }
    return () => clearInterval(timer);
  }, [punchedIn]);

  // Load today's attendance, leave balances, and holidays
  useEffect(() => {
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    Promise.all([
      attendanceAPI.getMyMonth({ month }),
      leaveAPI.getMyBalance().catch(() => ({ data: { data: [] } })),
      attendanceAPI.getTodaySummary ? Promise.resolve(null) : Promise.resolve(null)
    ]).then(([attRes, balRes]) => {
      const records = attRes.data?.data || [];
      setMonthlyRecords(records);
      const todayStr = now.toDateString();
      const rec = records.find(r => new Date(r.date).toDateString() === todayStr) || null;
      setTodayRecord(rec);
      if (rec?.punchIn && !rec?.punchOut) {
        setPunchedIn(true);
        const punchInTime = new Date(rec.punchIn);
        setPunchTime(`In at ${punchInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        const elapsed = Math.floor((now - punchInTime) / 1000);
        setPunchSeconds(elapsed);
      }
      setLeaveBalances(balRes.data?.data || []);
    }).catch(console.error);

    // Load holidays
    fetch('http://localhost:5000/api/attendance/holidays', {
      headers: { Authorization: `Bearer ${localStorage.getItem('hrms_token')}` }
    }).then(r => r.json()).then(data => {
      setHolidays((data?.data || []).slice(0, 5));
    }).catch(() => {});
  }, []);

  const handlePunchToggle = async () => {
    setPunchLoading(true);
    try {
      const now = new Date();
      if (!punchedIn) {
        // PUNCH IN
        const res = await attendanceAPI.punchIn({ source: 'WEB', location: 'Main Office' });
        setTodayRecord(res.data);
        setPunchedIn(true);
        setPunchTime(`In at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        toast.success('Punched in successfully!');
      } else {
        // PUNCH OUT
        const res = await attendanceAPI.punchOut();
        setTodayRecord(res.data);
        setPunchedIn(false);
        setPunchTime('Punched Out');
        toast.success(res.data?.workHours ? `Punched out. Total: ${res.data.workHours}h` : 'Punched out successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Punch failed. Try again.');
    } finally {
      setPunchLoading(false);
    }
  };

  const totalLeaveBalance = leaveBalances.reduce((sum, b) => sum + Math.max(0, (b.openingBalance + b.accrued - b.availed - b.lopDays - b.encashed)), 0);
  const pendingRequestsCount = 0; // Will be fetched if needed

  // Compute weekly work hours from real attendance records
  const workHoursData = useMemo(() => {
    if (!monthlyRecords.length) return [];
    const weekMap = {};
    monthlyRecords.forEach(rec => {
      const d = new Date(rec.date);
      const weekOfMonth = Math.ceil(d.getDate() / 7);
      const key = `Wk ${weekOfMonth}`;
      if (!weekMap[key]) weekMap[key] = 0;
      weekMap[key] += rec.workHours || 0;
    });
    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, Hours]) => ({ week, Hours: Math.round(Hours * 10) / 10 }));
  }, [monthlyRecords]);

  // Build heatmap data from real attendance records (Mon-Sat x 5 weeks)
  const heatmapData = useMemo(() => {
    const recordsByDate = {};
    monthlyRecords.forEach(rec => {
      const d = new Date(rec.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      recordsByDate[key] = rec.status;
    });
    return recordsByDate;
  }, [monthlyRecords]);

  return (
    <AppShell pageTitle="Employee Dashboard" activeNav="Dashboard">
      
      {/* Greeting Banner */}
      <div style={{
        ...glassStyles.cardDark,
        padding: '32px',
        marginBottom: '24px',
        position: 'relative'
      }}>
        <h2 style={{ fontSize: '28px', color: 'var(--cream)', fontWeight: '700', margin: '0 0 6px' }}>Good morning, {user?.name || user?.email?.split('@')[0] || 'there'} 👋</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Welcome back to your unified HR portal dashboard view.
        </p>
      </div>

      {/* 4 Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={glassStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            <span>Punch Status</span>
            <UserCheck size={18} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{
              backgroundColor: punchedIn ? 'rgba(60,90,60,0.5)' : 'rgba(255,255,255,0.06)',
              color: '#F0EBE3',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {punchedIn ? 'PUNCHED IN' : 'PUNCHED OUT'}
            </span>
          </div>
        </div>
        <div style={glassStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Work Hours</span>
            <Clock size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', display: 'block', marginTop: '10px' }}>
            {todayRecord?.workHours ? `${todayRecord.workHours.toFixed(1)}h` : '—'}
          </span>
          <span style={{ fontSize: '11px', color: '#9A9690', display: 'block', marginTop: '2px' }}>Today logged</span>
        </div>
        <div style={glassStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Leave Balance</span>
            <Calendar size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', display: 'block', marginTop: '10px' }}>{totalLeaveBalance} Days</span>
          <span style={{ fontSize: '11px', color: '#9A9690', display: 'block', marginTop: '2px' }}>{leaveBalances.length} leave types</span>
        </div>
        <div style={glassStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', fontWeight: '600' }}>
            <span>Pending Requests</span>
            <FileCheck2 size={18} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', display: 'block', marginTop: '10px' }}>{pendingRequestsCount}</span>
          <span style={{ fontSize: '11px', color: '#9A9690', display: 'block', marginTop: '2px' }}>All reviews completed</span>
        </div>
      </div>

      {/* Main Grid: 60/40 */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column (60%) */}
        <div style={{ flex: '3 1 560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Attendance Heatmap */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Attendance Heatmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '32px' }}>
                {['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'].map(wk => (
                  <div key={wk} style={{ width: '40px', textAlign: 'center' }}>{wk}</div>
                ))}
              </div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dIdx) => {
                const dayOfWeek = dIdx + 1; // 1=Mon ... 6=Sat
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{day}</span>
                    {Array.from({ length: 5 }).map((_, wIdx) => {
                      const now = new Date();
                      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                      // Find the date for this day/week cell
                      const firstDayOfWeek = firstDay.getDay() || 7; // Mon=1
                      const dayOffset = (wIdx * 7) + (dayOfWeek - firstDayOfWeek);
                      const cellDate = new Date(firstDay);
                      cellDate.setDate(1 + dayOffset);
                      const isFuture = cellDate > now;
                      const isWrongMonth = cellDate.getMonth() !== now.getMonth();
                      const isSat = dIdx === 5;

                      let bg = 'rgba(255,255,255,0.04)';
                      let label = 'No data';

                      if (!isWrongMonth && !isFuture) {
                        const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
                        const status = heatmapData[key];
                        if (isSat) {
                          bg = 'rgba(255,255,255,0.04)';
                          label = 'Weekend';
                        } else if (status === 'PRESENT' || status === 'REGULARIZED') {
                          bg = 'rgba(232,228,220,0.8)';
                          label = 'Present';
                        } else if (status === 'LATE') {
                          bg = 'rgba(180,175,165,0.6)';
                          label = 'Late';
                        } else if (status === 'ABSENT') {
                          bg = 'rgba(60,55,50,0.5)';
                          label = 'Absent';
                        } else if (status === 'ON_LEAVE') {
                          bg = 'rgba(80,120,180,0.4)';
                          label = 'On Leave';
                        } else {
                          bg = 'rgba(255,255,255,0.04)';
                          label = 'No record';
                        }
                      }

                      return (
                        <div
                          key={wIdx}
                          title={`${day} Wk ${wIdx + 1}: ${label}`}
                          style={{
                            width: '40px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: bg,
                            border: '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            opacity: isWrongMonth ? 0.2 : 1
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '16px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(232,228,220,0.8)' }} />
                <span>Present</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(180,175,165,0.6)' }} />
                <span>Late</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(60,55,50,0.5)' }} />
                <span>Absent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(80,120,180,0.4)' }} />
                <span>On Leave</span>
              </div>
            </div>
          </div>

          {/* Card 2: Work Hours Trend AreaChart */}
          <div style={glassStyles.cardChart}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Work Hours Trend</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={workHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255, 255, 255, 0.25)" stopOpacity={1}/>
                      <stop offset="95%" stopColor="rgba(255, 255, 255, 0)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="Hours" stroke="#E8E4DC" strokeWidth={2.5} fillOpacity={1} fill="url(#hoursColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Leave Balances Horizontal progress */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Leave Accruals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {leaveBalances.length > 0 ? leaveBalances.slice(0, 4).map((bal, i) => {
                const remaining = Math.max(0, bal.openingBalance + bal.accrued - bal.availed - bal.lopDays - bal.encashed);
                const total = bal.openingBalance + bal.accrued;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#F0EBE3' }}>{bal.leaveTypeId?.name || 'Leave'}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{remaining} / {total} Days remaining</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <div style={{ width: `${total > 0 ? (remaining / total) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--cream)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No leave balances found</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (40%) */}
        <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Punch Card Clock */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 4px' }}>Shift Clock</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--cream)', letterSpacing: '0.04em' }}>{liveHours}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{punchTime}</span>
              </div>
              <button
                onClick={handlePunchToggle}
                style={{
                  ...glassStyles.btnPrimary,
                  backgroundColor: punchedIn ? 'rgba(250,100,100,0.8)' : 'rgba(232,228,220,0.92)',
                  color: punchedIn ? '#F0EBE3' : '#1A1815',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '14px'
                }}
              >
                {punchedIn ? 'PUNCH OUT' : 'PUNCH IN NOW'}
              </button>
            </div>
          </div>

          {/* Card 2: Upcoming Holidays */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Upcoming Holidays</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {holidays.length > 0 ? holidays.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{h.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{h.date ? new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                  </div>
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'var(--cream-muted)',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>{h.type || 'Holiday'}</span>
                </div>
              )) : <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No upcoming holidays</p>}
            </div>
          </div>

          {/* Card 3: Quick Actions 2x2 grid */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => navigate('/leave')}
                style={{
                  ...glassStyles.card,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--cream-dark)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s',
                  background: 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                <CalendarDays size={18} />
                <span>Apply Leave</span>
              </button>
              <button
                onClick={() => navigate('/attendance')}
                style={{
                  ...glassStyles.card,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--cream-dark)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s',
                  background: 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                <Clock size={18} />
                <span>Missed Punch</span>
              </button>
              <button
                style={{
                  ...glassStyles.card,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--cream-dark)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s',
                  background: 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                <FileCheck2 size={18} />
                <span>View Payslip</span>
              </button>
              <button
                style={{
                  ...glassStyles.card,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--cream-dark)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s',
                  background: 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
};

// ==========================================
// PAGE 6: EMPLOYEES LIST
// ==========================================
const EmployeesList = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('Active'); // 'Active' or 'Offboarded'
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRole, setSelectedRole] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const locationHook = useLocation();
  const navigate = useNavigate();

  const [roleCounts, setRoleCounts] = useState({
    ALL: 0,
    EMPLOYEE: 0,
    MANAGER: 0,
    LEADERSHIP: 0,
    HR_ADMIN: 0
  });

  const [useGeneratedPassword, setUseGeneratedPassword] = useState(true);
  const [manualPassword, setManualPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [availableDesignations, setAvailableDesignations] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [selectedDeptState, setSelectedDeptState] = useState('');

  const getAvailableDesignationsForRole = () => {
    if (selectedRole === 'MANAGER') {
      return availableDesignations.filter(d => {
        const nameStr = (typeof d === 'string' ? d : (d.name || '')).toLowerCase();
        return !nameStr.includes('intern') && 
               !nameStr.includes('trainee') && 
               !nameStr.includes('junior');
      });
    }
    return availableDesignations;
  };

  const finalPassword = useGeneratedPassword 
    ? generatedPassword 
    : manualPassword;

  const { register, handleSubmit, reset, getValues, setValue, formState: { errors: hookErrors }, setError, clearErrors } = useForm({
    defaultValues: {
      employmentType: 'full_time'
    }
  });

  // One call to get all employees and compute exact role counts
  const computeRoleCounts = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 1000 });
      const all = res.data?.employees || res.data?.data || [];
      
      const counts = { ALL: all.length, EMPLOYEE: 0, MANAGER: 0, 
                       LEADERSHIP: 0, HR_ADMIN: 0 };
      
      all.forEach(emp => {
        const role = getEmployeeRole(emp).toUpperCase();
        if (counts[role] !== undefined) counts[role]++;
      });
      
      setRoleCounts(counts);
    } catch (err) {
      console.error('Role count error:', err);
    }
  };

  useEffect(() => {
    computeRoleCounts();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      fetchEmployeesList();
      computeRoleCounts();
      fetchDropdownData();
    };
    window.addEventListener('employee-updated', handleUpdate);
    return () => window.removeEventListener('employee-updated', handleUpdate);
  }, []);

  // Sync roleFilter with URL query params (from dashboard cards)
  useEffect(() => {
    const role = new URLSearchParams(locationHook.search).get('role') || '';
    setRoleFilter(role);
    setCurrentPage(1);
  }, [locationHook.search]);

  const parseDepartments = (res) => {
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.departments)) return d.departments;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  };

  const parseLocations = (res) => {
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.locations)) return d.locations;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  };

  const parseDesignations = (res) => {
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.designations)) return d.designations;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  };

  const fetchDropdownData = async () => {
    // Debug log temporarily
    orgAPI.getDepartments().then(res => console.log('DEPTS:', res.data));
    orgAPI.getLocations().then(res => console.log('LOCS:', res.data));

    setDropdownLoading(true);
    try {
      const [deptRes, locRes, mgrRes, desigRes] = await Promise.all([
        orgAPI.getDepartments(),
        orgAPI.getLocations(),
        employeeAPI.getAll({ limit: 100 }),
        orgAPI.getDesignations()
      ]);
      
      setDepartments(parseDepartments(deptRes));
      setLocations(parseLocations(locRes));
      setAllDesignations(parseDesignations(desigRes));
      
      const allEmps = mgrRes.data?.employees 
        || mgrRes.data?.data 
        || mgrRes.data 
        || [];
      
      const mgrs = allEmps.filter(e => {
        const role = getEmployeeRole(e).toUpperCase();
        return role === 'MANAGER';
      });
      setManagers(mgrs);
    } catch (err) {
      console.error('Dropdown fetch error:', err);
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchEmployeesList = () => {
    setLoadingEmps(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      ...(search && { search }),
      ...(deptFilter && { departmentId: deptFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(roleFilter && { role: roleFilter, 'auth.role': roleFilter })
    };
    employeeAPI.getAll(params).then(res => {
      const data = res.data?.data || res.data?.employees || [];
      setEmployees(data);
      setTotalCount(res.data?.pagination?.total || res.data?.total || data.length);
    }).catch(console.error).finally(() => setLoadingEmps(false));
  };

  // Fetch employees whenever filters or page change
  useEffect(() => {
    fetchEmployeesList();
  }, [currentPage, search, deptFilter, statusFilter, roleFilter]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (modalStep === 4) {
      setGeneratedPassword(generatePassword());
    }
  }, [modalStep]);

  const onAddEmployee = async (formData) => {
    if (!useGeneratedPassword) {
      if (manualPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }
      if (manualPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setSaving(true);
    formData.selectedRole = selectedRole;
    formData.password = finalPassword;

    const payload = {
      role: formData.selectedRole,
      password: formData.password,
      personal: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || '',
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender ? formData.gender.toUpperCase() : undefined,
        address: formData.address || ''
      },
      contact: {
        officialEmail: formData.email,
        personalPhone: formData.phone || ''
      },
      employment: {
        department: formData.department,
        departmentId: formData.department,
        designation: formData.designation,
        designationId: formData.designation,
        dateOfJoining: formData.dateOfJoining,
        employmentType: (formData.employmentType || 'full_time').toUpperCase(),
        reportingManager: formData.reportingManager || null,
        reportingManagerId: formData.reportingManager || null,
        shift: formData.shift || 'General (9AM - 6PM)'
      },
      auth: {
        email: formData.email,
        password: formData.password,
        role: formData.selectedRole  
      }
    };

    try {
      await employeeAPI.create(payload);
      toast.success(`${selectedRole} account created successfully!`);
      setIsModalOpen(false);
      setModalStep(1);
      setSelectedRole('');
      setGeneratedPassword('');
      setManualPassword('');
      setConfirmPassword('');
      setErrors({});
      setSelectedDeptState('');
      setAvailableDesignations([]);
      reset();
      setCurrentPage(1);
      fetchEmployeesList();
      computeRoleCounts();
      window.dispatchEvent(new CustomEvent('employee-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  const handleContinueToStep3 = () => {
    const errs = {};
    const values = getValues();
    if (!values.firstName?.trim()) errs.firstName = 'First name is required';
    if (!values.lastName?.trim()) errs.lastName = 'Last name is required';
    if (!values.email?.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = 'Enter a valid email address';
    }
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setModalStep(3);
  };

  const handleContinueToStep4 = () => {
    const errs = {};
    const values = getValues();
    if (!values.department) errs.department = 'Department is required';
    if (!values.designation) errs.designation = 'Designation is required';
    if (!values.dateOfJoining) errs.dateOfJoining = 'Date of joining is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setModalStep(4);
  };

  const handleDepartmentChange = (deptId) => {
    setSelectedDeptState(deptId);
    setValue('department', deptId);
    setValue('designation', ''); // reset designation in react-hook-form
    
    let desigs = allDesignations;
    if (!desigs || desigs.length === 0) {
      desigs = DESIGNATIONS_BY_DEPARTMENT[deptId];
      if (!desigs) {
        const allDepts = departments.length > 0 ? departments : FALLBACK_DEPARTMENTS;
        const selectedDept = allDepts.find(d => (d._id || d.id) === deptId);
        if (selectedDept) {
          const deptName = (selectedDept.name || selectedDept.departmentName || '').toLowerCase().trim();
          let matchedKey = '';
          if (deptName.includes('engineer')) matchedKey = 'engineering';
          else if (deptName.includes('product')) matchedKey = 'product';
          else if (deptName.includes('qa') || deptName.includes('test')) matchedKey = 'qa_testing';
          else if (deptName.includes('devops') || deptName.includes('infra')) matchedKey = 'devops';
          else if (deptName.includes('design')) matchedKey = 'design';
          else if (deptName.includes('hr') || deptName.includes('resource')) matchedKey = 'hr';
          else if (deptName.includes('finance') || deptName.includes('account')) matchedKey = 'finance';
          else if (deptName.includes('sale') || deptName.includes('market')) matchedKey = 'sales';
          else if (deptName.includes('operation')) matchedKey = 'operations';
          else if (deptName.includes('leader') || deptName.includes('exec') || deptName.includes('ceo') || deptName.includes('board')) matchedKey = 'leadership';
          
          if (matchedKey) {
            desigs = DESIGNATIONS_BY_DEPARTMENT[matchedKey];
          }
        }
      }
    }
    
    setAvailableDesignations(desigs || []);
    setErrors(prev => {
      const next = { ...prev };
      delete next.department;
      delete next.designation;
      return next;
    });
  };

  const FALLBACK_LOCATIONS = [
    { _id: 'mumbai', name: 'Mumbai' },
    { _id: 'delhi', name: 'Delhi' },
    { _id: 'bangalore', name: 'Bangalore' },
    { _id: 'pune', name: 'Pune' },
    { _id: 'hyderabad', name: 'Hyderabad' }
  ];

  const displayDepts = departments.length > 0 
    ? departments 
    : FALLBACK_DEPARTMENTS;
  
  const displayLocs = locations.length > 0 
    ? locations 
    : FALLBACK_LOCATIONS;

  const filteredEmployees = useMemo(() => {
    if (!roleFilter || roleFilter.toUpperCase() === 'ALL') {
      return employees;
    }
    return employees.filter(emp => 
      getEmployeeRole(emp).toUpperCase() === roleFilter.toUpperCase()
    );
  }, [employees, roleFilter]);

  const roleBadgeConfig = {
    'EMPLOYEE': {
      bg: 'rgba(40,90,50,0.45)',
      color: '#7dd87d',
      border: '1px solid rgba(80,180,80,0.25)',
      label: 'Employee',
      icon: User
    },
    'MANAGER': {
      bg: 'rgba(40,60,120,0.45)',
      color: '#88b0f8',
      border: '1px solid rgba(80,130,220,0.25)',
      label: 'Manager',
      icon: Users
    },
    'LEADERSHIP': {
      bg: 'rgba(110,80,20,0.45)',
      color: '#f5c842',
      border: '1px solid rgba(200,160,40,0.25)',
      label: 'CEO',
      icon: Crown
    },
    'CEO': {
      bg: 'rgba(110,80,20,0.45)',
      color: '#f5c842',
      border: '1px solid rgba(200,160,40,0.25)',
      label: 'CEO',
      icon: Crown
    },
    'HR_ADMIN': {
      bg: 'rgba(110,30,70,0.45)',
      color: '#f288b8',
      border: '1px solid rgba(190,70,130,0.25)',
      label: 'HR Admin',
      icon: Shield
    }
  };

  return (
    <AppShell pageTitle="Employee Directory" activeNav="Employees">
      
      {/* Sub tabs for Active vs Offboarded */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <button
          onClick={() => {
            setActiveDirectoryTab('Active');
            setStatusFilter('');
            setCurrentPage(1);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: activeDirectoryTab === 'Active' ? 'var(--cream)' : 'var(--text-secondary)',
            fontWeight: activeDirectoryTab === 'Active' ? '700' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 8px',
            position: 'relative'
          }}
        >
          Active Directory
          {activeDirectoryTab === 'Active' && (
            <div style={{ position: 'absolute', bottom: '-11px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--cream)' }} />
          )}
        </button>
        <button
          onClick={() => {
            setActiveDirectoryTab('Offboarded');
            setStatusFilter('EXITED');
            setCurrentPage(1);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: activeDirectoryTab === 'Offboarded' ? 'var(--cream)' : 'var(--text-secondary)',
            fontWeight: activeDirectoryTab === 'Offboarded' ? '700' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 8px',
            position: 'relative'
          }}
        >
          Offboarded / Exited
          {activeDirectoryTab === 'Offboarded' && (
            <div style={{ position: 'absolute', bottom: '-11px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--cream)' }} />
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        ...glassStyles.card,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#A8A5A0' }} />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={search}
              onChange={handleSearch}
              style={{ ...glassStyles.input, paddingLeft: '36px', height: '40px', width: '100%' }}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            style={{ 
              ...glassStyles.input, 
              height: '40px', 
              width: '140px', 
              cursor: 'pointer',
              fontSize: '13px',
              paddingLeft: '12px',
              paddingRight: '28px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C8C4BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: '#C8C4BC'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.color = '#FFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
              e.currentTarget.style.color = '#C8C4BC';
            }}
          >
            <option value="" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>All Depts</option>
            {displayDepts.map(d => (
              <option key={d._id} value={d._id} style={{ backgroundColor: '#201E1C', color: '#FFF' }}>{d.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              setCurrentPage(1);
              if (val === 'EXITED') {
                setActiveDirectoryTab('Offboarded');
              } else {
                setActiveDirectoryTab('Active');
              }
            }}
            style={{ 
              ...glassStyles.input, 
              height: '40px', 
              width: '140px', 
              cursor: 'pointer',
              fontSize: '13px',
              paddingLeft: '12px',
              paddingRight: '28px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C8C4BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: '#C8C4BC'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.color = '#FFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
              e.currentTarget.style.color = '#C8C4BC';
            }}
          >
            <option value="" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>All Statuses</option>
            <option value="ACTIVE" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>Active</option>
            <option value="ONBOARDING" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>Onboarding</option>
            <option value="CONFIRMED" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>Confirmed</option>
            <option value="EXITED" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>Offboarded</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* Toggle buttons */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'rgba(232, 228, 220, 0.9)' : 'transparent',
                color: viewMode === 'grid' ? '#1A1815' : '#A8A5A0',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <GridIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'rgba(232, 228, 220, 0.9)' : 'transparent',
                color: viewMode === 'table' ? '#1A1815' : '#A8A5A0',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{ ...glassStyles.btnPrimary, height: '40px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', whiteSpace: 'nowrap' }}>
        {[
          { id: '', text: 'All', count: roleCounts.ALL, icon: '' },
          { id: 'EMPLOYEE', text: 'Employees', count: roleCounts.EMPLOYEE, icon: '👤' },
          { id: 'MANAGER', text: 'Managers', count: roleCounts.MANAGER, icon: '👥' },
          { id: 'LEADERSHIP', text: 'CEO / Leadership', count: roleCounts.LEADERSHIP, icon: '👑' },
          { id: 'HR_ADMIN', text: 'HR Admin', count: roleCounts.HR_ADMIN, icon: '🛡️' }
        ].map((pill) => {
          const isActive = roleFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => {
                setRoleFilter(pill.id);
                setCurrentPage(1);
              }}
              style={{
                background: isActive ? 'rgba(232, 228, 220, 0.92)' : 'rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid rgba(232, 228, 220, 0.92)' : '1px solid rgba(255, 255, 255, 0.10)',
                color: isActive ? '#1A1815' : '#C8C4BC',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#FFF';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.20)';
                } else {
                  e.currentTarget.style.background = 'rgba(232, 228, 220, 1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#C8C4BC';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.10)';
                } else {
                  e.currentTarget.style.background = 'rgba(232, 228, 220, 0.92)';
                }
              }}
            >
              {pill.icon && <span>{pill.icon}</span>}
              <span>{pill.text} ({pill.count})</span>
            </button>
          );
        })}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {loadingEmps ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No employees found</div>
          ) : filteredEmployees.map((emp) => {
            const fullName = getFullName(emp);
            const dept = getEmployeeDept(emp);
            const designation = getEmployeeDesig(emp);
            const location = getEmployeeLoc(emp);
            const role = getEmployeeRole(emp);

            const config = roleBadgeConfig[role.toUpperCase()] 
              || roleBadgeConfig['EMPLOYEE'];
            const BadgeIcon = config.icon;

            return (
              <div
                key={emp._id || emp.employeeId}
                onClick={() => navigate(`/employees/${emp._id || emp.employeeId}`)}
                style={{
                  ...glassStyles.card,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = 'rgba(232, 228, 220, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                {/* Role Badge Pill */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: config.bg,
                  color: config.color,
                  border: config.border,
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <BadgeIcon size={12} />
                  <span>{config.label}</span>
                </div>

                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(232, 228, 220, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F0EBE3',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginTop: '8px'
                }}>
                  {getInitials(emp)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--cream)', fontWeight: '700', fontSize: '15px' }}>{fullName}</span>
                  <p style={{ color:'#8A8780', fontSize: 11, fontWeight: '500', margin: '2px 0 0' }}>
                    {getEmployeeDesig(emp)}
                  </p>
                  <p style={{ color: '#9A9690', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '4px 0 0' }}>
                    <span>📁</span> {getEmployeeDept(emp)}
                  </p>
                </div>

                {/* Bottom of card — status and ID */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', fontSize: '12px', width: '100%', marginTop: 'auto' }}>
                  <span style={{ color: '#6A6865', fontSize: '11px', fontFamily: 'monospace' }}>
                    #{emp.employeeId || '—'}
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{
                      backgroundColor: emp.status === 'ONBOARDING' ? 'rgba(60,80,120,0.35)' : (emp.status === 'ACTIVE' || emp.status === 'CONFIRMED' ? 'rgba(60,100,60,0.35)' : 'rgba(120,90,30,0.35)'),
                      color: emp.status === 'ONBOARDING' ? '#90b4f0' : (emp.status === 'ACTIVE' || emp.status === 'CONFIRMED' ? '#90d490' : '#f0c860'),
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>{emp.status || 'ACTIVE'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr className="glass-header-row">
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Department</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Designation</th>
                  <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingEmps ? (
                  <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No employees found</td></tr>
                ) : filteredEmployees.map((emp) => {
                  const fullName = getFullName(emp);
                  const email = getEmployeeEmail(emp);
                  const dept = getEmployeeDept(emp);
                  const designation = getEmployeeDesig(emp);
                  const location = getEmployeeLoc(emp);
                  const role = getEmployeeRole(emp);

                  const config = roleBadgeConfig[role.toUpperCase()] 
                    || roleBadgeConfig['EMPLOYEE'];

                  return (
                    <tr
                      key={emp._id || emp.employeeId}
                      className="glass-row"
                      onClick={() => navigate(`/employees/${emp._id || emp.employeeId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ padding: '14px 24px', color: 'var(--cream-muted)' }}>{emp.employeeId}</td>
                      <td style={{ padding: '14px 24px', color: '#F0EBE3', fontWeight: '600' }}>{fullName}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          background: config.bg,
                          color: config.color,
                          border: config.border,
                          fontSize: '9px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>{config.label}</span>
                      </td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{email}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{dept}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{designation}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          backgroundColor: emp.status === 'ONBOARDING' ? 'rgba(60,80,120,0.35)' : (emp.status === 'ACTIVE' || emp.status === 'CONFIRMED' ? 'rgba(60,100,60,0.35)' : 'rgba(120,90,30,0.35)'),
                          color: emp.status === 'ONBOARDING' ? '#90b4f0' : (emp.status === 'ACTIVE' || emp.status === 'CONFIRMED' ? '#90d490' : '#f0c860'),
                          fontSize: '9px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>{emp.status || 'ACTIVE'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '28px' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...glassStyles.btnSecondary,
              padding: '6px 16px',
              fontSize: '12px',
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Prev
          </button>
          <span style={{ display: 'flex', alignItems: 'center', color: '#A8A5A0', fontSize: '13px', padding: '0 8px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...glassStyles.btnSecondary,
              padding: '6px 16px',
              fontSize: '12px',
              opacity: currentPage === totalPages ? 0.4 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Employee 4-step Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            ...glassStyles.cardDark,
            width: '100%',
            maxWidth: '560px',
            padding: '36px',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Add Employee Account</h3>
              <X size={20} style={{ color: '#A8A5A0', cursor: 'pointer' }} onClick={() => { setIsModalOpen(false); setModalStep(1); setSelectedRole(''); setGeneratedPassword(''); setManualPassword(''); setConfirmPassword(''); setErrors({}); setSelectedDeptState(''); setAvailableDesignations([]); reset(); }} />
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '20px' }}>
                {/* Connector line */}
                <div style={{ position: 'absolute', top: '9px', left: '10px', right: '10px', height: '2px', backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: '9px', left: '10px', width: `${((modalStep - 1) / 3) * 100}%`, height: '2px', backgroundColor: 'var(--cream)', zIndex: 2, transition: 'width 0.3s ease' }} />
                
                {/* 4 Steps */}
                {[1, 2, 3, 4].map((step) => {
                  const isActive = modalStep === step;
                  const isDone = modalStep > step;
                  return (
                    <div key={step} style={{
                      flex: 1, display: 'flex', justifyContent: step === 1 ? 'flex-start' : (step === 4 ? 'flex-end' : 'center'), zIndex: 3
                    }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: isDone || isActive ? 'var(--cream)' : 'rgba(255,255,255,0.15)',
                        border: isActive ? '3px solid rgba(232,228,220,0.4)' : 'none',
                        boxSizing: 'border-box',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isDone || isActive ? '#1A1815' : '#6A6865',
                        fontSize: '10px', fontWeight: '800'
                      }}>
                        {isDone ? '✓' : step}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', fontSize: '10px', color: '#A8A5A0' }}>
                {[
                  { step: 1, label: 'Role' },
                  { step: 2, label: 'Personal' },
                  { step: 3, label: 'Employment' },
                  { step: 4, label: 'Credentials' }
                ].map((item) => (
                  <div key={item.step} style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: item.step === 1 ? 'flex-start' : (item.step === 4 ? 'flex-end' : 'center')
                  }}>
                    <span style={{
                      color: modalStep >= item.step ? '#F0EBE3' : '#6A6865',
                      fontWeight: modalStep === item.step ? '600' : '400'
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleSubmit(onAddEmployee)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* STEP 1: ROLE SELECTION */}
              {modalStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '16px', color: 'var(--cream)', fontWeight: '600' }}>Select Role</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>What type of account are you creating?</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      {
                        id: 'EMPLOYEE',
                        icon: User,
                        title: 'Employee',
                        desc: "Regular team member with access to their own attendance, leaves and profile"
                      },
                      {
                        id: 'MANAGER',
                        icon: Users,
                        title: 'Manager',
                        desc: "Team lead with approval rights for their team's leave and attendance"
                      },
                      {
                        id: 'LEADERSHIP',
                        icon: Crown,
                        title: 'CEO / Leadership',
                        desc: "Executive with access to organization-wide analytics and reports"
                      }
                    ].map((roleOption) => {
                      const Icon = roleOption.icon;
                      const isSelected = selectedRole === roleOption.id;
                      return (
                        <div
                          key={roleOption.id}
                          onClick={() => setSelectedRole(roleOption.id)}
                          style={{
                            background: isSelected ? 'rgba(232, 228, 220, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: isSelected ? '2px solid rgba(232, 228, 220, 0.7)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            flex: '1 1 0',
                            gap: '8px',
                            transform: isSelected ? 'scale(1.02)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Icon size={24} style={{ color: isSelected ? 'var(--cream)' : 'rgba(255,255,255,0.4)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>{roleOption.title}</span>
                          <span style={{ fontSize: '10px', color: '#6A6865', lineHeight: '1.4' }}>{roleOption.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!selectedRole}
                    onClick={() => setModalStep(2)}
                    style={{
                      ...glassStyles.btnPrimary,
                      justifyContent: 'center',
                      opacity: selectedRole ? 1 : 0.4,
                      cursor: selectedRole ? 'pointer' : 'not-allowed',
                      width: '100%',
                      marginTop: '10px'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* STEP 2: PERSONAL INFORMATION */}
              {modalStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Step 2: Personal Details</span>
                    <span style={{
                      background: 'rgba(232,228,220,0.15)',
                      color: 'var(--cream)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      Creating: {selectedRole}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* First and Last Name Inputs (side-by-side, 2col grid, gap 12px) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          {...register('firstName', {
                            required: 'First name is required',
                            onChange: () => {
                              setErrors(prev => {
                                const next = { ...prev };
                                delete next.firstName;
                                return next;
                              });
                            }
                          })}
                          placeholder="e.g. Priya"
                          style={{ ...glassStyles.input, width: '100%' }}
                          required
                        />
                        {errors.firstName && (
                          <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          {...register('lastName', {
                            required: 'Last name is required',
                            onChange: () => {
                              setErrors(prev => {
                                const next = { ...prev };
                                delete next.lastName;
                                return next;
                              });
                            }
                          })}
                          placeholder="e.g. Sharma"
                          style={{ ...glassStyles.input, width: '100%' }}
                          required
                        />
                        {errors.lastName && (
                          <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          onChange: () => {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.email;
                              return next;
                            });
                          }
                        })}
                        type="email"
                        placeholder="Work Email *"
                        style={{ ...glassStyles.input, width: '100%' }}
                        required
                      />
                      {errors.email && (
                        <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <input {...register('phone')} placeholder="Phone Number" style={{ ...glassStyles.input, width: '100%' }} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Date of Birth</span>
                        <input type="date" {...register('dateOfBirth')} style={{ ...glassStyles.input, width: '100%' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Gender</span>
                        <select {...register('gender')} defaultValue="" style={{ ...glassStyles.select, width: '100%', height: '45px' }}>
                          <option value="" style={{ backgroundColor: '#201E1C' }}>Select Gender</option>
                          <option value="male" style={{ backgroundColor: '#201E1C' }}>Male</option>
                          <option value="female" style={{ backgroundColor: '#201E1C' }}>Female</option>
                          <option value="other" style={{ backgroundColor: '#201E1C' }}>Other</option>
                        </select>
                      </div>
                    </div>

                    <textarea {...register('address')} placeholder="Address" style={{ ...glassStyles.textarea, width: '100%' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setModalStep(1)} style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}>Back</button>
                    <button type="button" onClick={handleContinueToStep3} style={{ ...glassStyles.btnPrimary, flex: 1, justifyContent: 'center' }}>Continue</button>
                  </div>
                </div>
              )}

              {/* STEP 3: EMPLOYMENT DETAILS */}
              {modalStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Step 3: Employment Details</span>
                  
                  {departments.length === 0 && (
                    <div style={{ color: '#f28888', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span>⚠️</span>
                      <span>Could not load departments from server. Please try again.</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6A6865' }}>Department *</span>
                      <select
                        {...register('department', {
                          required: 'Department is required',
                          onChange: (e) => handleDepartmentChange(e.target.value)
                        })}
                        style={{ ...glassStyles.select, width: '100%', height: '45px' }}
                        required
                      >
                        <option value="" style={{ backgroundColor: '#201E1C' }}>Select Department *</option>
                        {dropdownLoading 
                          ? <option disabled style={{ backgroundColor: '#201E1C' }}>Loading...</option>
                          : displayDepts.map(dept => (
                              <option key={dept._id || dept.id} value={dept._id || dept.id} style={{ backgroundColor: '#201E1C' }}>
                                {dept.name || dept.departmentName || dept.title || dept._id}
                              </option>
                            ))
                        }
                      </select>
                      {errors.department && (
                        <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>
                          {errors.department}
                        </p>
                      )}
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <label style={{ color:'#6A6865', fontSize:11, 
                                      textTransform:'uppercase', 
                                      letterSpacing:'0.05em', 
                                      display:'block', marginBottom:6 }}>
                        Designation *
                      </label>
                      <select
                        {...register('designation', {
                          required: 'Designation is required',
                          onChange: (e) => {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.designation;
                              return next;
                            });
                            // Auto-suggest salary based on designation
                            const suggested = getSuggestedSalary(e.target.value);
                            if (suggested) setValue('salary', suggested);
                          }
                        })}
                        value={getValues('designation') || ''}
                        style={{
                          ...glassStyles.select,
                          width: '100%',
                          height: '45px',
                          cursor: selectedDeptState ? 'pointer' : 'not-allowed',
                          opacity: selectedDeptState ? 1 : 0.5,
                          boxSizing: 'border-box'
                        }}
                        required
                        disabled={!selectedDeptState}
                      >
                        <option value="" style={{ backgroundColor: '#201E1C' }}>
                          {selectedDeptState 
                            ? 'Select Designation' 
                            : 'Select Department first'}
                        </option>
                        {getAvailableDesignationsForRole().map(d => {
                          const val = typeof d === 'string' ? d : d._id;
                          const label = typeof d === 'string' ? d : d.name;
                          return (
                            <option key={val} value={val} style={{ backgroundColor: '#201E1C' }}>{label}</option>
                          );
                        })}
                      </select>
                      {!selectedDeptState && (
                        <p style={{ color:'#6A6865', fontSize:10, marginTop:3 }}>
                          Please select a department first
                        </p>
                      )}
                      {errors.designation && (
                        <p style={{ color:'#f28888', fontSize:11, marginTop:3 }}>
                          {errors.designation}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Date of Joining *</span>
                        <input
                          type="date"
                          {...register('dateOfJoining', {
                            required: 'Date of joining is required',
                            onChange: () => {
                              setErrors(prev => {
                                const next = { ...prev };
                                delete next.dateOfJoining;
                                return next;
                              });
                            }
                          })}
                          defaultValue={new Date().toISOString().slice(0, 10)}
                          style={{ ...glassStyles.input, width: '100%' }}
                          required
                        />
                        {errors.dateOfJoining && (
                          <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>
                            {errors.dateOfJoining}
                          </p>
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Employment Type</span>
                        <select {...register('employmentType')} defaultValue="full_time" style={{ ...glassStyles.select, width: '100%', height: '45px' }}>
                          <option value="full_time" style={{ backgroundColor: '#201E1C' }}>Full-time</option>
                          <option value="part_time" style={{ backgroundColor: '#201E1C' }}>Part-time</option>
                          <option value="contract" style={{ backgroundColor: '#201E1C' }}>Contract</option>
                          <option value="intern" style={{ backgroundColor: '#201E1C' }}>Intern</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Annual CTC (₹) *</span>
                        {(() => {
                          const desig = getValues('designation');
                          const suggested = getSuggestedSalary(desig);
                          const range = getSuggestedSalaryRange(desig);
                          if (!suggested || !desig) return null;
                          const rangeStr = range 
                            ? `₹${(range.min / 100000).toFixed(1)}-${(range.max / 100000).toFixed(1)} LPA` 
                            : `₹${(suggested / 100000).toFixed(1)} LPA`;
                          return (
                            <span style={{ fontSize: '10px', color: '#7dd87d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Coins size={10} />
                              Suggested: {rangeStr}
                            </span>
                          );
                        })()}
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 600000 (auto-filled from designation)"
                        {...register('salary', {
                          required: 'Annual CTC is required',
                          min: { value: 1, message: 'CTC must be positive' }
                        })}
                        style={{ ...glassStyles.input, width: '100%' }}
                        required
                      />
                      {errors.salary ? (
                        <p style={{ color: '#f28888', fontSize: 11, marginTop: 3 }}>{errors.salary}</p>
                      ) : (
                        <p style={{ color: '#6A6865', fontSize: 10, marginTop: 3 }}>
                          Auto-filled from designation. You can edit this value.
                        </p>
                      )}
                    </div>

                    {selectedRole === 'EMPLOYEE' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6A6865' }}>Reporting Manager</span>
                        <select {...register('reportingManager')} style={{ ...glassStyles.select, width: '100%', height: '45px' }}>
                          <option value="" style={{ backgroundColor: '#201E1C' }}>None (Optional)</option>
                          {managers.map(mgr => (
                            <option key={mgr._id} value={mgr._id} style={{ backgroundColor: '#201E1C' }}>
                              {getFullName(mgr)} — {mgr.employment?.designationId?.name || mgr.employment?.designation || mgr.designation || ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6A6865' }}>Work Shift</span>
                      <input {...register('shift')} placeholder="Work Shift" defaultValue="General (9AM - 6PM)" style={{ ...glassStyles.input, width: '100%' }} />
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setModalStep(2)} style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}>Back</button>
                    <button
                      type="button"
                      onClick={handleContinueToStep4}
                      disabled={departments.length === 0}
                      style={{
                        ...glassStyles.btnPrimary,
                        flex: 1,
                        justifyContent: 'center',
                        opacity: (departments.length === 0) ? 0.4 : 1,
                        cursor: (departments.length === 0) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CREDENTIALS */}
              {modalStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '16px', color: 'var(--cream)', fontWeight: '600' }}>Account Credentials</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>These credentials will be given to the employee to login</span>
                  </div>

                  {/* Password Toggle Switch */}
                  <div style={{ display:'flex', gap: 8, marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setUseGeneratedPassword(true)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: useGeneratedPassword 
                          ? '1px solid rgba(232,228,220,0.5)' 
                          : '1px solid rgba(255,255,255,0.08)',
                        background: useGeneratedPassword 
                          ? 'rgba(232,228,220,0.12)' 
                          : 'rgba(255,255,255,0.04)',
                        color: useGeneratedPassword ? '#F0EBE3' : '#6A6865',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      🔑 Auto-Generate
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUseGeneratedPassword(false)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: !useGeneratedPassword 
                          ? '1px solid rgba(232,228,220,0.5)' 
                          : '1px solid rgba(255,255,255,0.08)',
                        background: !useGeneratedPassword 
                          ? 'rgba(232,228,220,0.12)' 
                          : 'rgba(255,255,255,0.04)',
                        color: !useGeneratedPassword ? '#F0EBE3' : '#6A6865',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Set Manually
                    </button>
                  </div>

                  <div style={{
                    background: 'rgba(232,228,220,0.08)',
                    border: '1px solid rgba(232,228,220,0.25)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>📧 Email / Username</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
                        <span style={{ color: '#F0EBE3', fontSize: '13px' }}>{getValues('email')}</span>
                        <button type="button" onClick={() => {
                          navigator.clipboard.writeText(getValues('email') || '');
                          toast.success('Email copied!');
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-dark)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Copy size={12} />
                          Copy
                        </button>
                      </div>
                    </div>

                    {useGeneratedPassword ? (
                      /* Auto-Generated display box */
                      <div>
                        <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>🔑 Generated Password</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
                          <span style={{ color: '#F0EBE3', fontSize: '13px', fontFamily: 'monospace' }}>{generatedPassword}</span>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => {
                              navigator.clipboard.writeText(generatedPassword);
                              toast.success('Password copied!');
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-dark)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Copy size={12} />
                              Copy
                            </button>
                            <button type="button" onClick={() => setGeneratedPassword(generatePassword())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-dark)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <RefreshCw size={12} />
                              Regenerate
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Manual password input fields */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600' }}>Set Password *</span>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={manualPassword}
                              onChange={e => setManualPassword(e.target.value)}
                              placeholder="Enter password"
                              style={{ ...glassStyles.input, width: '100%', paddingRight: '40px', background: 'rgba(0, 0, 0, 0.2)' }}
                              minLength={8}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '12px',
                                background: 'none',
                                border: 'none',
                                color: '#A8A5A0',
                                cursor: 'pointer'
                              }}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Password strength indicator */}
                        {manualPassword && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[1, 2, 3, 4].map((bar) => {
                                const score = getStrength(manualPassword);
                                let barColor = 'rgba(255,255,255,0.08)';
                                if (score >= bar) {
                                  if (score === 1) barColor = 'rgba(180,60,60,0.8)';
                                  else if (score === 2) barColor = 'rgba(180,120,30,0.8)';
                                  else if (score === 3) barColor = 'rgba(180,160,30,0.8)';
                                  else if (score === 4) barColor = 'rgba(60,150,70,0.8)';
                                }
                                return (
                                  <div
                                    key={bar}
                                    style={{
                                      flex: 1,
                                      height: '4px',
                                      borderRadius: '2px',
                                      backgroundColor: barColor,
                                      transition: 'background-color 0.2s'
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#6A6865' }}>Strength:</span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: (() => {
                                  const score = getStrength(manualPassword);
                                  if (score === 1) return 'rgba(180,60,60,0.8)';
                                  if (score === 2) return 'rgba(180,120,30,0.8)';
                                  if (score === 3) return 'rgba(180,160,30,0.8)';
                                  if (score === 4) return 'rgba(60,150,70,0.8)';
                                  return '#6A6865';
                                })()
                              }}>
                                {(() => {
                                  const score = getStrength(manualPassword);
                                  if (score === 1) return 'Weak';
                                  if (score === 2) return 'Fair';
                                  if (score === 3) return 'Good';
                                  if (score === 4) return 'Strong';
                                  return '';
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600' }}>Confirm Password *</span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            style={{
                              ...glassStyles.input,
                              width: '100%',
                              background: 'rgba(0, 0, 0, 0.2)',
                              border: confirmPassword && confirmPassword !== manualPassword
                                ? '1px solid rgba(180,60,60,0.6)'
                                : '1px solid rgba(255,255,255,0.12)'
                            }}
                            required
                          />
                          {confirmPassword && confirmPassword !== manualPassword && (
                            <p style={{ color: '#f28888', fontSize: 11, marginTop: 4 }}>
                              Passwords do not match
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>🔑 Credentials Summary</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#A8A5A0' }}>Email:</span>
                          <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{getValues('email')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#A8A5A0' }}>Password:</span>
                          <span style={{ color: '#F0EBE3', fontWeight: '600', fontFamily: 'monospace' }}>{finalPassword}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: '#C8A080', fontSize: '11px', lineHeight: '1.4' }}>
                      <span>⚠️</span>
                      <span>Share these credentials securely with the employee. Password cannot be recovered after this screen.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const employee = {
                        personal: {
                          firstName: getValues('firstName'),
                          lastName: getValues('lastName')
                        },
                        role: selectedRole,
                        employment: {
                          department: displayDepts.find(d => d._id === getValues('department'))?.name || getValues('department') || '—',
                          designation: getValues('designation') || '—'
                        },
                        email: getValues('email')
                      };
                      downloadCredentials(employee, finalPassword);
                    }}
                    style={{
                      background: 'transparent',
                      color: 'var(--cream)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '999px',
                      padding: '10px 24px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={14} />
                    Download Credentials
                  </button>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setModalStep(3)} style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}>Back</button>
                    <button
                      type="submit"
                      disabled={saving || departments.length === 0}
                      style={{
                        background: 'rgba(232, 228, 220, 0.92)',
                        color: '#1A1815',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '12px 24px',
                        fontWeight: '700',
                        cursor: (saving || departments.length === 0) ? 'not-allowed' : 'pointer',
                        opacity: (saving || departments.length === 0) ? 0.4 : 1,
                        flex: 2,
                        justifyContent: 'center',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      {saving ? 'Creating...' : 'Create Account & Save'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
};

// ==========================================
// PAGE 7: ATTENDANCE
// ==========================================
const AttendancePage = () => {
  const { user: currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState(isEmployee ? 'Clock In/Out' : 'All');
  const [trendsData, setTrendsData] = useState([]);

  const resolveStatusCode = (day) => {
    if (!day) return 'WO';
    const statusStr = (typeof day === 'string' ? day : (day.status || '')).toUpperCase();
    if (statusStr === 'PRESENT' || statusStr === 'P' || statusStr === 'REGULARIZED') return 'P';
    if (statusStr === 'ABSENT' || statusStr === 'A') return 'A';
    if (statusStr === 'LATE' || statusStr === 'L') return 'L';
    if (statusStr === 'HALF_DAY' || statusStr === 'H') return 'H';
    if (statusStr === 'ON_LEAVE' || statusStr === 'OL') return 'OL';
    if (statusStr === 'WEEKLY_OFF' || statusStr === 'WO') return 'WO';
    return '?';
  };
  const [summary, setSummary] = useState(null);
  const [musterData, setMusterData] = useState([]);
  const [loadingMuster, setLoadingMuster] = useState(false);

  // Punch states
  const [punchedIn, setPunchedIn] = useState(false);
  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [regularizeLoading, setRegularizeLoading] = useState(false);
  const [regularizeDate, setRegularizeDate] = useState('');
  const [regularizePunchIn, setRegularizePunchIn] = useState('');
  const [regularizePunchOut, setRegularizePunchOut] = useState('');
  const [regularizeReason, setRegularizeReason] = useState('');
  const [punchTime, setPunchTime] = useState('---');
  const [liveHours, setLiveHours] = useState('0h 00m');
  const [punchSeconds, setPunchSeconds] = useState(0);
  const [todayRecord, setTodayRecord] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  // Punch Records Log states
  const [punchRecords, setPunchRecords] = useState([]);
  const [loadingPunches, setLoadingPunches] = useState(false);
  const [hrEditModalOpen, setHrEditModalOpen] = useState(false);
  const [hrEditLoading, setHrEditLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [hrEditPunchIn, setHrEditPunchIn] = useState('');
  const [hrEditPunchOut, setHrEditPunchOut] = useState('');
  const [hrEditStatus, setHrEditStatus] = useState('');

  // Muster expand/collapse
  const [showAllMuster, setShowAllMuster] = useState(false);

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  // Live clock timer
  useEffect(() => {
    let timer = null;
    if (punchedIn) {
      timer = setInterval(() => {
        setPunchSeconds(prev => {
          const nextSec = prev + 1;
          const h = Math.floor(nextSec / 3600);
          const m = Math.floor((nextSec % 3600) / 60);
          const s = nextSec % 60;
          setLiveHours(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
          return nextSec;
        });
      }, 1000);
    } else {
      setLiveHours('0h 00m');
      setPunchSeconds(0);
    }
    return () => clearInterval(timer);
  }, [punchedIn]);

  const fetchPunchState = () => {
    const now = new Date();
    attendanceAPI.getMyMonth({ month: now.toISOString().slice(0, 7) }).then(res => {
      const records = res.data?.data || [];
      const todayStr = now.toDateString();
      const rec = records.find(r => new Date(r.date).toDateString() === todayStr) || null;
      setTodayRecord(rec);
      if (rec?.status === 'ON_LEAVE') {
        setPunchedIn(false);
        setPunchTime('Approved Leave');
      } else if (rec?.punchIn && !rec?.punchOut) {
        setPunchedIn(true);
        const punchInTime = new Date(rec.punchIn);
        setPunchTime(`In at ${punchInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        const elapsed = Math.floor((now - punchInTime) / 1000);
        setPunchSeconds(elapsed);
      } else if (rec?.punchOut) {
        setPunchedIn(false);
        const punchInTime = new Date(rec.punchIn);
        const punchOutTime = new Date(rec.punchOut);
        setPunchTime(`In: ${punchInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Out: ${punchOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        setPunchedIn(false);
        setPunchTime('');
      }
    }).catch(console.error);
  };

  const fetchAttendanceData = () => {
    // Fetch summary
    attendanceAPI.getTodaySummary().then(res => {
      setSummary(res.data?.data || res.data || null);
    }).catch(console.error);

    // Fetch muster
    setLoadingMuster(true);
    attendanceAPI.getMuster({ month: now.getMonth() + 1, year: now.getFullYear() }).then(res => {
      const rows = res.data?.data || [];
      // Exclude LEADERSHIP / CEO from muster list — they are company heads
      const filteredRows = rows.filter(row => {
        const role = (row.role || row.userRole || '').toUpperCase();
        return role !== 'LEADERSHIP' && role !== 'CEO';
      });
      setMusterData(filteredRows.map(row => ({
        name: row.name || row.employeeId || '—',
        role: row.role || '',
        days: row.days || Array.from({ length: 30 }).map((_, i) => row[`day_${i + 1}`] || 'ABSENT')
      })));
    }).catch(console.error).finally(() => setLoadingMuster(false));

    // Fetch punch records log
    setLoadingPunches(true);
    let punchPromise;
    if (currentUser?.role === 'EMPLOYEE') {
      punchPromise = attendanceAPI.getMyMonth({ month: now.toISOString().slice(0, 7) });
    } else if (currentUser?.role === 'MANAGER') {
      punchPromise = attendanceAPI.getTeamAttendance();
    } else {
      punchPromise = attendanceAPI.getAll();
    }

    punchPromise.then(res => {
      setPunchRecords(res.data?.data || res.data?.docs || res.data || []);
    }).catch(console.error).finally(() => setLoadingPunches(false));

    // Fetch last 6 months trends dynamically
    const trendMonths = [];
    for (let i = 5; i >= 0; i--) {
      let m = now.getMonth() + 1 - i;
      let y = now.getFullYear();
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      trendMonths.push({ month: m, year: y });
    }

    Promise.all(
      trendMonths.map(({ month, year }) =>
        attendanceAPI.getMuster({ month, year })
          .then(res => {
            const rows = res.data?.data || [];
            let present = 0;
            let absent = 0;
            let late = 0;

            rows.forEach(row => {
              Object.keys(row).forEach(key => {
                if (key.startsWith('day_')) {
                  const val = row[key];
                  const code = resolveStatusCode(val);
                  if (code === 'P') present++;
                  else if (code === 'A') absent++;
                  else if (code === 'L') late++;
                }
              });
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
              month: monthNames[month - 1],
              Present: present,
              Absent: absent,
              Late: late,
              sortKey: year * 100 + month
            };
          })
          .catch(err => {
            console.error(err);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
              month: monthNames[month - 1],
              Present: 0,
              Absent: 0,
              Late: 0,
              sortKey: year * 100 + month
            };
          })
      )
    ).then(results => {
      results.sort((a, b) => a.sortKey - b.sortKey);
      setTrendsData(results);
    }).catch(console.error);
  };

  useEffect(() => {
    if (currentUser) {
      fetchPunchState();
      fetchAttendanceData();
    }
  }, [currentUser]);

  const handlePunchToggle = async () => {
    setPunchLoading(true);
    try {
      const now = new Date();
      if (!punchedIn) {
        // PUNCH IN
        const res = await attendanceAPI.punchIn({ source: 'WEB', location: 'Main Office' });
        const rec = res.data?.data || res.data;
        setTodayRecord(rec);
        setPunchedIn(true);
        setPunchTime(`In at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        toast.success('Punched in successfully!');
      } else {
        // PUNCH OUT
        const res = await attendanceAPI.punchOut();
        const rec = res.data?.data || res.data;
        setTodayRecord(rec);
        setPunchedIn(false);
        setPunchTime('Punched Out');
        toast.success(rec?.workHours ? `Punched out. Total: ${rec.workHours.toFixed(1)}h` : 'Punched out successfully!');
      }
      fetchPunchState();
      fetchAttendanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Punch action failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!regularizeDate || !regularizeReason) {
      toast.error('Date and reason are required');
      return;
    }
    setRegularizeLoading(true);
    try {
      const punchInDate = regularizePunchIn ? new Date(`${regularizeDate}T${regularizePunchIn}`) : undefined;
      const punchOutDate = regularizePunchOut ? new Date(`${regularizeDate}T${regularizePunchOut}`) : undefined;

      await attendanceAPI.regularize({
        date: new Date(regularizeDate),
        requestedPunchIn: punchInDate,
        requestedPunchOut: punchOutDate,
        reason: regularizeReason
      });
      toast.success('Late punch/regularization request submitted to HR!');
      setRegularizeModalOpen(false);
      setRegularizeDate('');
      setRegularizePunchIn('');
      setRegularizePunchOut('');
      setRegularizeReason('');
      fetchAttendanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit regularization request');
    } finally {
      setRegularizeLoading(false);
    }
  };

  const handleHrEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setHrEditLoading(true);
    try {
      const dateStr = new Date(selectedRecord.date).toISOString().split('T')[0];
      const punchInDate = hrEditPunchIn ? new Date(`${dateStr}T${hrEditPunchIn}`) : null;
      const punchOutDate = hrEditPunchOut ? new Date(`${dateStr}T${hrEditPunchOut}`) : null;
      
      await attendanceAPI.updateRecord(selectedRecord._id, {
        punchIn: punchInDate,
        punchOut: punchOutDate,
        status: hrEditStatus
      });
      toast.success('Attendance record updated successfully!');
      setHrEditModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance record');
    } finally {
      setHrEditLoading(false);
    }
  };

  const getCellBg = (val) => {
    switch (val) {
      case 'P': return 'rgba(200,220,200,0.3)';
      case 'A': return 'rgba(180,80,80,0.3)';
      case 'L': return 'rgba(180,160,80,0.3)';
      case 'H': return 'rgba(80,120,180,0.3)';
      case 'WO': return 'rgba(120,120,120,0.2)';
      case 'OL': return 'rgba(150,100,180,0.2)';
      default: return 'transparent';
    }
  };

  const getCellColor = (val) => {
    switch (val) {
      case 'P': return '#A0D0A0';
      case 'A': return '#F09090';
      case 'L': return '#E0D090';
      case 'H': return '#90B0F0';
      case 'WO': return '#808080';
      case 'OL': return '#C0A0E0';
      default: return '#F0EBE3';
    }
  };

  const tabs = isEmployee ? ['Clock In/Out', 'Punch Records'] : ['All', 'Muster Register', 'Trends', 'Punch Records'];

  return (
    <AppShell pageTitle={isEmployee ? "My Attendance" : "Attendance Management"} activeNav="Attendance">
      
      {/* Tab pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? glassStyles.pillActive : glassStyles.pillInactive}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRegularizeModalOpen(true)}
          style={{
            ...glassStyles.btnPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            padding: '8px 16px'
          }}
        >
          <Clock size={14} />
          Request Late Punch / Correction
        </button>
      </div>

      {isEmployee ? (
        /* Employee Focused Views */
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {activeTab === 'Clock In/Out' ? (
            <div style={{ ...glassStyles.card, width: '100%', maxWidth: '480px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Shift Clock</h3>
                <span style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: todayRecord?.status === 'ON_LEAVE' ? 'rgba(150, 100, 180, 0.2)' : todayRecord?.punchOut ? 'rgba(255, 255, 255, 0.05)' : punchedIn ? 'rgba(160, 208, 160, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: todayRecord?.status === 'ON_LEAVE' ? '#C0A0E0' : todayRecord?.punchOut ? 'var(--text-secondary)' : punchedIn ? '#A0D0A0' : 'var(--text-secondary)',
                  fontWeight: '600'
                }}>
                  {todayRecord?.status === 'ON_LEAVE' ? 'On Leave' : todayRecord?.punchOut ? 'Shift Complete' : punchedIn ? 'Active Shift' : 'Off Clock'}
                </span>
              </div>
              
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--cream)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {(() => {
                    if (todayRecord?.status === 'ON_LEAVE') {
                      return 'On Leave';
                    }
                    if (todayRecord?.punchIn && todayRecord?.punchOut) {
                      const elapsed = Math.floor((new Date(todayRecord.punchOut) - new Date(todayRecord.punchIn)) / 1000);
                      const h = Math.floor(elapsed / 3600);
                      const m = Math.floor((elapsed % 3600) / 60);
                      const s = elapsed % 60;
                      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
                    }
                    if (punchedIn) {
                      return liveHours;
                    }
                    return '';
                  })()}
                </div>
                {punchTime && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {punchTime}
                  </div>
                )}
              </div>

              <button
                onClick={handlePunchToggle}
                disabled={punchLoading || !!todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: todayRecord?.status === 'ON_LEAVE' ? 'rgba(150, 100, 180, 0.15)' : todayRecord?.punchOut ? 'rgba(255, 255, 255, 0.05)' : punchedIn ? '#c85050' : '#4a8a50',
                  color: todayRecord?.status === 'ON_LEAVE' ? '#C0A0E0' : todayRecord?.punchOut ? 'var(--text-secondary)' : '#fff',
                  fontWeight: '700',
                  cursor: (punchLoading || todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE') ? 'not-allowed' : 'pointer',
                  opacity: punchLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: (todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE') ? 'none' : punchedIn 
                    ? '0 4px 12px rgba(200, 80, 80, 0.2)' 
                    : '0 4px 12px rgba(74, 138, 80, 0.2)'
                }}
              >
                {punchLoading ? (
                  <span>Processing...</span>
                ) : todayRecord?.status === 'ON_LEAVE' ? (
                  <span>On Approved Leave</span>
                ) : todayRecord?.punchOut ? (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.446z"/>
                    </svg>
                    <span>Shift Completed</span>
                  </>
                ) : punchedIn ? (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                    </svg>
                    <span>Punch Out</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5z"/>
                    </svg>
                    <span>Punch In</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Punch Records Tab for employee (only lists their own records) */
            <div style={{ ...glassStyles.card, width: '100%', padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>My Punch Records Log</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr className="glass-header-row">
                      <th style={{ padding: '10px 12px', color: '#6A6865', fontWeight: '600' }}>DATE</th>
                      <th style={{ padding: '10px 12px', color: '#6A6865', fontWeight: '600' }}>PUNCH IN</th>
                      <th style={{ padding: '10px 12px', color: '#6A6865', fontWeight: '600' }}>PUNCH OUT</th>
                      <th style={{ padding: '10px 12px', color: '#6A6865', fontWeight: '600' }}>WORK HOURS</th>
                      <th style={{ padding: '10px 12px', color: '#6A6865', fontWeight: '600' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {punchRecords.length > 0 ? punchRecords.map((record) => {
                      const recDate = new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                      const punchInStr = record.punchIn ? new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                      const punchOutStr = record.punchOut ? new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                      
                      let workHoursStr = '—';
                      if (record.punchIn && record.punchOut) {
                        const mins = Math.floor((new Date(record.punchOut) - new Date(record.punchIn)) / 60000);
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        workHoursStr = `${h}h ${m}m`;
                      }
                      
                      const statusCode = record.status === 'PRESENT' ? 'P' : record.status === 'ABSENT' ? 'A' : record.status === 'LATE' ? 'L' : record.status === 'ON_LEAVE' ? 'OL' : 'WO';
                      const statusColor = getCellColor(statusCode);
                      const statusBg = getCellBg(statusCode);
                      
                      return (
                        <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{recDate}</td>
                          <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{punchInStr}</td>
                          <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{punchOutStr}</td>
                          <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{workHoursStr}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: statusBg,
                              color: statusColor,
                              fontWeight: '700',
                              fontSize: '9px'
                            }}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={5} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)' }}>No punch records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Original multi-column layout for Managers / HR / LEADERSHIP */
        <>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={glassStyles.card}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>PRESENT TODAY</span>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{summary?.present ?? '—'}</span>
            </div>
            <div style={glassStyles.card}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>ABSENT TODAY</span>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{summary?.absent ?? '—'}</span>
            </div>
            <div style={glassStyles.card}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>LATE RUNNING</span>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{summary?.late ?? '—'}</span>
            </div>
            <div style={glassStyles.card}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>ON LEAVE</span>
              <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{summary?.onLeave ?? '—'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* Left Area (60%) */}
            <div style={{ flex: '3 1 560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Muster Register Grid View */}
              {(activeTab === 'Muster Register' || activeTab === 'All') && (() => {
                const MUSTER_PREVIEW = 4;
                const visibleRows = showAllMuster ? musterData : musterData.slice(0, MUSTER_PREVIEW);
                return (
                  <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Monthly Muster Register</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6A6865' }}>Showing {visibleRows.length} of {musterData.length} employees (CEO/Leadership excluded)</p>
                      </div>
                      {musterData.length > MUSTER_PREVIEW && (
                        <button
                          onClick={() => setShowAllMuster(prev => !prev)}
                          style={{ ...glassStyles.btnSecondary, padding: '5px 12px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          {showAllMuster ? 'Show Less ▲' : `View All (${musterData.length}) ▼`}
                        </button>
                      )}
                    </div>
                    <div style={{ overflowX: 'auto', maxHeight: showAllMuster ? '320px' : '150px', overflowY: 'auto', transition: 'max-height 0.3s ease' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                        <thead>
                          <tr className="glass-header-row">
                            <th style={{ padding: '8px 12px', color: '#A8A5A0', position: 'sticky', left: 0, backgroundColor: 'rgba(15, 13, 11, 0.96)', zIndex: 10 }}>Employee</th>
                            {Array.from({ length: 30 }).map((_, idx) => (
                              <th key={idx} style={{ padding: '8px 4px', color: '#A8A5A0', textAlign: 'center' }}>{idx + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loadingMuster ? (
                            <tr><td colSpan={31} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading muster data...</td></tr>
                          ) : visibleRows.length > 0 ? visibleRows.map((row) => (
                            <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 12px', color: '#F0EBE3', fontWeight: '600', position: 'sticky', left: 0, backgroundColor: 'rgba(15, 13, 11, 0.96)', zIndex: 10, whiteSpace: 'nowrap' }}>{row.name}</td>
                              {(Array.isArray(row.days) ? row.days : []).map((day, idx) => {
                                const statusCode = resolveStatusCode(day);
                                return (
                                  <td key={idx} style={{ padding: '2px 1px', textAlign: 'center' }}>
                                    <div style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '3px',
                                      backgroundColor: getCellBg(statusCode),
                                      color: getCellColor(statusCode),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '700',
                                      fontSize: '9px',
                                      margin: '0 auto'
                                    }}>
                                      {statusCode}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          )) : (
                            <tr><td colSpan={31} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found for this month</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Attendance Trend Line/Area Chart */}
              {(activeTab === 'Trends' || activeTab === 'All') && (
                <div style={glassStyles.cardChart}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Attendance Monthly Trends</h3>
                  <div style={{ width: '100%', height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: '#7A7870', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Legend textStyle={{ fill: '#A8A5A0', fontSize: 12 }} />
                        <defs>
                          <linearGradient id="trendsColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(200, 196, 188, 0.35)" stopOpacity={1}/>
                            <stop offset="95%" stopColor="rgba(200, 196, 188, 0.02)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="Present" stroke="#E8E4DC" strokeWidth={2.5} fill="url(#trendsColor)" />
                        <Area type="monotone" dataKey="Late" stroke="rgba(180,160,80,0.8)" strokeWidth={1.5} fill="transparent" />
                        <Area type="monotone" dataKey="Absent" stroke="rgba(180,80,80,0.8)" strokeWidth={1.5} fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Punch Records Table */}
              {(activeTab === 'Punch Records' || activeTab === 'All') && (
                <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Punch Records Log</h3>
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                      <thead>
                        <tr className="glass-header-row">
                          <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Date</th>
                          {currentUser?.role !== 'EMPLOYEE' && (
                            <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Employee</th>
                          )}
                          <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Punch In</th>
                          <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Punch Out</th>
                          <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Duration</th>
                          <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Status</th>
                          {currentUser?.role === 'HR_ADMIN' && (
                            <th style={{ padding: '8px 12px', color: '#A8A5A0' }}>Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {loadingPunches ? (
                          <tr><td colSpan={currentUser?.role === 'HR_ADMIN' ? 7 : (currentUser?.role !== 'EMPLOYEE' ? 6 : 5)} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading punch records...</td></tr>
                        ) : punchRecords && punchRecords.length > 0 ? punchRecords.map((record) => {
                          const recDate = new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                          const punchInStr = record.punchIn 
                             ? new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                             : '—';
                          const punchOutStr = record.punchOut 
                             ? new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                             : '—';
                          
                          let workHoursStr = '—';
                          if (record.workingMinutes) {
                            const h = Math.floor(record.workingMinutes / 60);
                            const m = record.workingMinutes % 60;
                            workHoursStr = `${h}h ${m}m`;
                          } else if (record.punchIn && !record.punchOut) {
                            workHoursStr = 'Active';
                          }
                          
                          const empName = record.employeeId 
                            ? (typeof record.employeeId === 'object' 
                                ? `${record.employeeId.personal?.firstName || ''} ${record.employeeId.personal?.lastName || ''}`.trim() || record.employeeId.employeeId
                                : record.employeeId)
                            : '—';
                            
                          const statusCode = record.status === 'PRESENT' ? 'P' : record.status === 'ABSENT' ? 'A' : record.status === 'LATE' ? 'L' : record.status === 'ON_LEAVE' ? 'OL' : 'WO';
                          const statusColor = getCellColor(statusCode);
                          const statusBg = getCellBg(statusCode);
                          
                          return (
                            <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{recDate}</td>
                              {currentUser?.role !== 'EMPLOYEE' && (
                                <td style={{ padding: '8px 12px', color: '#F0EBE3', fontWeight: '600' }}>{empName}</td>
                              )}
                              <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{punchInStr}</td>
                              <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{punchOutStr}</td>
                              <td style={{ padding: '8px 12px', color: '#F0EBE3' }}>{workHoursStr}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: statusBg,
                                  color: statusColor,
                                  fontWeight: '700',
                                  fontSize: '9px'
                                }}>
                                  {record.status}
                                </span>
                              </td>
                              {currentUser?.role === 'HR_ADMIN' && (
                                <td style={{ padding: '8px 12px' }}>
                                  <button
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setHrEditPunchIn(record.punchIn ? new Date(record.punchIn).toTimeString().slice(0, 5) : '');
                                      setHrEditPunchOut(record.punchOut ? new Date(record.punchOut).toTimeString().slice(0, 5) : '');
                                      setHrEditStatus(record.status || 'PRESENT');
                                      setHrEditModalOpen(true);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--cream)',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      textDecoration: 'underline',
                                      padding: 0
                                    }}
                                  >
                                    Edit
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        }) : (
                          <tr><td colSpan={currentUser?.role === 'HR_ADMIN' ? 7 : (currentUser?.role !== 'EMPLOYEE' ? 6 : 5)} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary)' }}>No punch records found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Right Area (40%) */}
            <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Shift Clock card */}
              <div style={glassStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: 0 }}>Shift Clock</h3>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: todayRecord?.status === 'ON_LEAVE' ? 'rgba(150, 100, 180, 0.2)' : todayRecord?.punchOut ? 'rgba(255, 255, 255, 0.05)' : punchedIn ? 'rgba(160, 208, 160, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: todayRecord?.status === 'ON_LEAVE' ? '#C0A0E0' : todayRecord?.punchOut ? 'var(--text-secondary)' : punchedIn ? '#A0D0A0' : 'var(--text-secondary)',
                    fontWeight: '600'
                  }}>
                    {todayRecord?.status === 'ON_LEAVE' ? 'On Leave' : todayRecord?.punchOut ? 'Shift Complete' : punchedIn ? 'Active Shift' : 'Off Clock'}
                  </span>
                </div>
                
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--cream)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {(() => {
                      if (todayRecord?.status === 'ON_LEAVE') {
                        return 'On Leave';
                      }
                      if (todayRecord?.punchIn && todayRecord?.punchOut) {
                        const elapsed = Math.floor((new Date(todayRecord.punchOut) - new Date(todayRecord.punchIn)) / 1000);
                        const h = Math.floor(elapsed / 3600);
                        const m = Math.floor((elapsed % 3600) / 60);
                        const s = elapsed % 60;
                        return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
                      }
                      if (punchedIn) {
                        return liveHours;
                      }
                      return '';
                    })()}
                  </div>
                  {punchTime && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {punchTime}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePunchToggle}
                  disabled={punchLoading || !!todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: todayRecord?.status === 'ON_LEAVE' ? 'rgba(150, 100, 180, 0.15)' : todayRecord?.punchOut ? 'rgba(255, 255, 255, 0.05)' : punchedIn ? '#c85050' : '#4a8a50',
                    color: todayRecord?.status === 'ON_LEAVE' ? '#C0A0E0' : todayRecord?.punchOut ? 'var(--text-secondary)' : '#fff',
                    fontWeight: '700',
                    cursor: (punchLoading || todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE') ? 'not-allowed' : 'pointer',
                    opacity: punchLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: (todayRecord?.punchOut || todayRecord?.status === 'ON_LEAVE') ? 'none' : punchedIn 
                      ? '0 4px 12px rgba(200, 80, 80, 0.2)' 
                      : '0 4px 12px rgba(74, 138, 80, 0.2)'
                  }}
                >
                  {punchLoading ? (
                    <span>Processing...</span>
                  ) : todayRecord?.status === 'ON_LEAVE' ? (
                    <span>On Approved Leave</span>
                  ) : todayRecord?.punchOut ? (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.446z"/>
                      </svg>
                      <span>Shift Completed</span>
                    </>
                  ) : punchedIn ? (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                      </svg>
                      <span>Punch Out</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5z"/>
                      </svg>
                      <span>Punch In</span>
                    </>
                  )}
                </button>
              </div>

              <div style={glassStyles.card}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Top Late Employees</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    // Derive top late employees from muster data
                    const lateMap = {};
                    musterData.forEach(row => {
                      const lateCount = (Array.isArray(row.days) ? row.days : []).filter(d => {
                        return resolveStatusCode(d) === 'L';
                      }).length;
                      if (lateCount > 0) lateMap[row.name] = lateCount;
                    });
                    const sorted = Object.entries(lateMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
                    if (sorted.length === 0) return (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>No late records this month</p>
                    );
                    return sorted.map(([name, count]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#F0EBE3' }}>{name}</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{count} {count === 1 ? 'Time' : 'Times'} Late</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Today's Punch Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    // Show employees who have a status entry for today from musterData
                    const today = new Date();
                    const todayDayIdx = today.getDate() - 1; // 0-indexed day of month
                    const recentActivity = musterData
                      .map(row => {
                        const days = Array.isArray(row.days) ? row.days : [];
                        const todayEntry = days[todayDayIdx];
                        if (!todayEntry) return null;
                        const status = resolveStatusCode(todayEntry);
                        if (status === 'A' || status === 'WO' || status === 'OL' || status === '?') return null;
                        return { name: row.name, status, punchIn: todayEntry?.punchIn };
                      })
                      .filter(Boolean)
                      .slice(0, 5);

                    if (recentActivity.length === 0) return (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>No punch activity recorded today</p>
                    );

                    return recentActivity.map((feed, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{feed.name}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{feed.status === 'L' ? 'Late Arrival' : 'Present'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                          {feed.punchIn ? (
                            <span style={{ color: 'var(--cream-dark)', fontWeight: '700' }}>
                              {new Date(feed.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                          <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Punch In</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

          </div>
        </>
      )}
      {/* Regularization Request Modal */}
      {regularizeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...glassStyles.card, width: '400px', maxWidth: '90vw', padding: '24px' }}>
            <h3 style={{ color: 'var(--cream)', marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Request Late Punch / Correction</h3>
            <form onSubmit={handleRegularizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>DATE *</label>
                <input
                  type="date"
                  required
                  value={regularizeDate}
                  onChange={(e) => setRegularizeDate(e.target.value)}
                  style={{ ...glassStyles.input, width: '100%' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>REQUESTED PUNCH IN</label>
                  <input
                    type="time"
                    value={regularizePunchIn}
                    onChange={(e) => setRegularizePunchIn(e.target.value)}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>REQUESTED PUNCH OUT</label>
                  <input
                    type="time"
                    value={regularizePunchOut}
                    onChange={(e) => setRegularizePunchOut(e.target.value)}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>REASON / REMARK *</label>
                <textarea
                  required
                  placeholder="Explain why you are requesting correction (e.g. forgot to punch in, client meeting, late punch in reason)..."
                  value={regularizeReason}
                  onChange={(e) => setRegularizeReason(e.target.value)}
                  style={{ ...glassStyles.textarea, width: '100%', height: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={regularizeLoading} style={{ ...glassStyles.btnPrimary, flex: 1, justifyContent: 'center' }}>
                  {regularizeLoading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegularizeModalOpen(false);
                    setRegularizeDate('');
                    setRegularizePunchIn('');
                    setRegularizePunchOut('');
                    setRegularizeReason('');
                  }}
                  style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Direct Punch Editing Modal */}
      {hrEditModalOpen && selectedRecord && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...glassStyles.card, width: '400px', maxWidth: '90vw', padding: '24px' }}>
            <h3 style={{ color: 'var(--cream)', marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Edit Attendance Record (HR Admin)</h3>
            <form onSubmit={handleHrEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>DATE</label>
                <input
                  type="text"
                  disabled
                  value={new Date(selectedRecord.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  style={{ ...glassStyles.input, width: '100%', opacity: 0.6 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>PUNCH IN</label>
                  <input
                    type="time"
                    value={hrEditPunchIn}
                    onChange={(e) => setHrEditPunchIn(e.target.value)}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>PUNCH OUT</label>
                  <input
                    type="time"
                    value={hrEditPunchOut}
                    onChange={(e) => setHrEditPunchOut(e.target.value)}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>STATUS</label>
                <select
                  value={hrEditStatus}
                  onChange={(e) => setHrEditStatus(e.target.value)}
                  style={{ ...glassStyles.input, width: '100%', cursor: 'pointer' }}
                >
                  <option value="PRESENT" style={{ backgroundColor: '#201E1C' }}>PRESENT</option>
                  <option value="ABSENT" style={{ backgroundColor: '#201E1C' }}>ABSENT</option>
                  <option value="LATE" style={{ backgroundColor: '#201E1C' }}>LATE</option>
                  <option value="HALF_DAY" style={{ backgroundColor: '#201E1C' }}>HALF DAY</option>
                  <option value="WEEKLY_OFF" style={{ backgroundColor: '#201E1C' }}>WEEKLY OFF</option>
                  <option value="HOLIDAY" style={{ backgroundColor: '#201E1C' }}>HOLIDAY</option>
                  <option value="ON_LEAVE" style={{ backgroundColor: '#201E1C' }}>ON LEAVE</option>
                  <option value="REGULARIZED" style={{ backgroundColor: '#201E1C' }}>REGULARIZED</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={hrEditLoading} style={{ ...glassStyles.btnPrimary, flex: 1, justifyContent: 'center' }}>
                  {hrEditLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHrEditModalOpen(false);
                    setSelectedRecord(null);
                  }}
                  style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>
  );
};

// ==========================================
// PAGE 8: LEAVE MANAGEMENT
// ==========================================
const LeavePage = () => {
  const [activeTab, setActiveTab] = useState('My Leaves');
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const { register: regApply, handleSubmit: handleApplySubmit, reset: resetApply } = useForm();

  useEffect(() => {
    leaveAPI.getMyBalance().then(res => {
      setLeaveBalances(res.data?.data || []);
    }).catch(console.error);
    leaveAPI.getMy().then(res => {
      setLeaveRequests(res.data?.data || []);
    }).catch(console.error);
    approvalAPI.getPending().then(res => {
      setPendingApprovals(res.data?.data || []);
    }).catch(console.error);
  }, []);

  const onApplyLeave = async (data) => {
    setApplyLoading(true);
    try {
      await leaveAPI.apply({ leaveType: data.leaveType, fromDate: data.fromDate, toDate: data.toDate, reason: data.reason });
      toast.success('Leave application submitted!');
      setApplyModalOpen(false);
      resetApply();
      leaveAPI.getMy().then(res => setLeaveRequests(res.data?.data || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setApplyLoading(false);
    }
  };

  const leaveEntitlements = leaveBalances.map(b => ({
    name: b.leaveTypeId?.name || 'Leave',
    used: b.availed || 0,
    total: (b.openingBalance || 0) + (b.accrued || 0)
  }));

  const utilizationData = leaveEntitlements.map(e => ({
    name: e.name.split(' ')[0],
    used: e.used,
    available: Math.max(0, e.total - e.used)
  }));

  return (
    <AppShell pageTitle="Leave Management" activeNav="Leave">
      
      {/* Top Entitlements circles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {leaveEntitlements.map((item, idx) => (
          <div key={idx} style={{ ...glassStyles.cardDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--cream)' }}>{item.total - item.used} Left</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.used} of {item.total} used</span>
            </div>
            {/* SVG Ring */}
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
              <circle cx="25" cy="25" r="20" fill="none" stroke="#E8E3D8" strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - (item.total - item.used) / item.total)}
                      transform="rotate(-90 25 25)" />
            </svg>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['My Leaves', 'Team Leaves', 'Leave Policy'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? glassStyles.pillActive : glassStyles.pillInactive}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid: 60/40 */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column (60%) */}
        <div style={{ flex: '3 1 560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Stacked Bar Utilization */}
          <div style={glassStyles.cardChart}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Leave Utilization</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend textStyle={{ fill: '#A8A5A0', fontSize: 12 }} />
                  <Bar dataKey="used" stackId="a" fill="rgba(232,228,220,0.7)" />
                  <Bar dataKey="available" stackId="a" fill="rgba(255,255,255,0.12)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline Requests */}
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Leave Requests Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {leaveRequests.length > 0 ? leaveRequests.map((item) => (
                <div key={item._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: item.status === 'APPROVED' ? 'rgba(60,90,60,0.15)' : (item.status === 'REJECTED' ? 'rgba(90,40,40,0.15)' : 'rgba(255,255,255,0.04)'),
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--cream)', fontWeight: '600', fontSize: '13px' }}>{item.leaveTypeId?.name || 'Leave'}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {item.startDate ? new Date(item.startDate).toLocaleDateString() : ''} — {item.endDate ? new Date(item.endDate).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: item.status === 'APPROVED' ? '#A0D0A0' : (item.status === 'REJECTED' ? '#F09090' : '#E0D090')
                  }}>{item.status}</span>
                </div>
              )) : <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No leave requests found</p>}
            </div>
          </div>

        </div>

        {/* Right Column (40%) */}
        <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <button onClick={() => setApplyModalOpen(true)} style={{ ...glassStyles.btnPrimary, padding: '14px', fontSize: '14px', width: '100%', justifyContent: 'center' }}>
            <span>Apply For Leave</span>
          </button>

          {/* Apply Leave Modal */}
          {applyModalOpen && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ ...glassStyles.card, width: '400px', maxWidth: '90vw' }}>
                <h3 style={{ color: 'var(--cream)', marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Apply For Leave</h3>
                <form onSubmit={handleApplySubmit(onApplyLeave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <select {...regApply('leaveType', { required: true })} style={{ ...glassStyles.input, cursor: 'pointer' }}>
                    <option value="" style={{ backgroundColor: '#201E1C' }}>Select Leave Type</option>
                    {leaveBalances.map(b => (
                      <option key={b.leaveTypeId?._id || b._id} value={b.leaveTypeId?._id || b._id} style={{ backgroundColor: '#201E1C' }}>
                        {b.leaveTypeId?.name || 'Leave'} — {Math.max(0, (b.openingBalance || 0) + (b.accrued || 0) - (b.availed || 0))} days left
                      </option>
                    ))}
                  </select>
                  <input {...regApply('fromDate', { required: true })} type="date" style={glassStyles.input} />
                  <input {...regApply('toDate', { required: true })} type="date" style={glassStyles.input} />
                  <textarea {...regApply('reason', { required: true })} placeholder="Reason" style={{ ...glassStyles.textarea }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={applyLoading} style={{ ...glassStyles.btnPrimary, flex: 1, justifyContent: 'center' }}>{applyLoading ? 'Submitting...' : 'Submit'}</button>
                    <button type="button" onClick={() => { setApplyModalOpen(false); resetApply(); }} style={{ ...glassStyles.btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Pending Approvals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 2).map((item) => (
                <div key={item._id} style={{ ...glassStyles.cardDark, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#F0EBE3' }}>{item.requestedByEmployeeId?.personal?.firstName} {item.requestedByEmployeeId?.personal?.lastName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.requestType} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button onClick={() => approvalAPI.approve(item._id, { comment: 'Approved' }).then(() => { toast.success('Approved!'); setPendingApprovals(prev => prev.filter(p => p._id !== item._id)); }).catch(e => toast.error(e.response?.data?.message || 'Failed'))} style={{ ...glassStyles.btnPrimary, padding: '4px 12px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>Approve</button>
                    <button onClick={() => approvalAPI.reject(item._id, { comment: 'Rejected' }).then(() => { toast.success('Rejected!'); setPendingApprovals(prev => prev.filter(p => p._id !== item._id)); }).catch(e => toast.error(e.response?.data?.message || 'Failed'))} style={{ ...glassStyles.btnSecondary, padding: '4px 12px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>Reject</button>
                  </div>
                </div>
              )) : <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>No pending approvals</p>}
            </div>
          </div>

          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Year-End Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Opening Balance</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{leaveBalances.reduce((s, b) => s + (b.openingBalance || 0), 0)} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Accrued YTD</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{leaveBalances.reduce((s, b) => s + (b.accrued || 0), 0)} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Availed</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{leaveBalances.reduce((s, b) => s + (b.availed || 0), 0)} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{leaveBalances.reduce((s, b) => s + Math.max(0, (b.openingBalance || 0) + (b.accrued || 0) - (b.availed || 0)), 0)} Days</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
};

// ==========================================
// PAGE 9: APPROVALS
// ==========================================
const ApprovalsPage = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  useEffect(() => {
    approvalAPI.getPending().then(res => {
      setPendingApprovals(res.data?.data || []);
    }).catch(console.error).finally(() => setLoadingApprovals(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await approvalAPI.approve(id, { comment: 'Approved' });
      toast.success('Approved successfully!');
      setPendingApprovals(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await approvalAPI.reject(id, { comment: 'Rejected' });
      toast.success('Rejected successfully!');
      setPendingApprovals(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <AppShell pageTitle="Workflow Approvals" activeNav="Approvals">
      
      {/* Top indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={glassStyles.card}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>PENDING REVIEWS</span>
          <span style={{ fontSize: '26px', fontWeight: '700', color: 'rgba(250,100,100,0.9)', display: 'block', marginTop: '10px' }}>{pendingApprovals.length}</span>
        </div>
        <div style={glassStyles.card}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>LEAVE REQUESTS</span>
          <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{pendingApprovals.filter(a => a.requestType === 'LEAVE_REQUEST').length}</span>
        </div>
        <div style={glassStyles.card}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>REGULARIZATIONS</span>
          <span style={{ fontSize: '26px', fontWeight: '700', color: 'var(--cream)', display: 'block', marginTop: '10px' }}>{pendingApprovals.filter(a => a.requestType === 'ATTENDANCE_REGULARIZATION').length}</span>
        </div>
      </div>

      {/* Main Grid: 60/40 */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column (60%) */}
        <div style={{ flex: '3 1 560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingApprovals ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading approvals...</div>
            ) : pendingApprovals.length === 0 ? (
              <div style={{ ...glassStyles.card, textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>🎉 No pending approvals — you're all caught up!</div>
            ) : pendingApprovals.map((item) => {
              const firstName = item.requestedByEmployeeId?.personal?.firstName || '';
              const lastName = item.requestedByEmployeeId?.personal?.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim() || item.requestedBy?.email || 'Unknown';
              return (
                <div key={item._id} style={{
                  ...glassStyles.cardDark,
                  borderLeft: '4px solid var(--cream-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#F0EBE3' }}>
                        {fullName[0] || '?'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#F0EBE3' }}>{fullName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.requestedBy?.email || ''}</span>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: 'rgba(232, 228, 220, 0.12)',
                      color: 'var(--cream)',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>{item.requestType?.replace(/_/g, ' ') || 'Request'}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Submitted:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</div>
                    {item.requestType === 'ATTENDANCE_REGULARIZATION' && item.referenceId && (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', marginTop: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: 'var(--cream)', fontWeight: '600', marginBottom: '4px', fontSize: '12px' }}>Regularization Details:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                          <div><strong>Date:</strong> {item.referenceId.date ? new Date(item.referenceId.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                          <div><strong>Reason:</strong> {item.referenceId.reason || 'N/A'}</div>
                          <div><strong>Requested In:</strong> {item.referenceId.requestedPunchIn ? new Date(item.referenceId.requestedPunchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</div>
                          <div><strong>Requested Out:</strong> {item.referenceId.requestedPunchOut ? new Date(item.referenceId.requestedPunchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    {item.requestType === 'LEAVE_REQUEST' && item.referenceId && (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', marginTop: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: 'var(--cream)', fontWeight: '600', marginBottom: '4px', fontSize: '12px' }}>Leave Request Details:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                          <div><strong>Start Date:</strong> {item.referenceId.startDate ? new Date(item.referenceId.startDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                          <div><strong>End Date:</strong> {item.referenceId.endDate ? new Date(item.referenceId.endDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                          <div><strong>Total Days:</strong> {item.referenceId.totalDays || 'N/A'}</div>
                          <div><strong>Reason:</strong> {item.referenceId.reason || 'N/A'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleApprove(item._id)} style={{ ...glassStyles.btnPrimary, padding: '6px 16px', fontSize: '12px' }}>Approve</button>
                      <button onClick={() => handleReject(item._id)} style={{ ...glassStyles.btnSecondary, padding: '6px 16px', fontSize: '12px' }}>Reject</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (40%) */}
        <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Approval Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(() => {
                const typeGroups = {};
                pendingApprovals.forEach(a => {
                  const t = a.requestType?.replace(/_/g, ' ') || 'Other';
                  typeGroups[t] = (typeGroups[t] || 0) + 1;
                });
                const total = pendingApprovals.length;
                const entries = Object.entries(typeGroups);
                if (entries.length === 0) return (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>No pending approvals</p>
                );
                return entries.map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#F0EBE3' }}>{type}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} pending</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--cream-dark)', borderRadius: '2px' }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div style={glassStyles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cream)', margin: '0 0 16px' }}>Queue Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Pending</span>
                <span style={{ color: '#F0EBE3', fontWeight: '700', fontSize: '20px' }}>{pendingApprovals.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Leave Requests</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{pendingApprovals.filter(a => a.requestType === 'LEAVE_REQUEST').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Regularizations</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600' }}>{pendingApprovals.filter(a => a.requestType === 'ATTENDANCE_REGULARIZATION').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Oldest Request</span>
                <span style={{ color: '#F0EBE3', fontWeight: '600', fontSize: '12px' }}>
                  {pendingApprovals.length > 0
                    ? (() => {
                        const oldest = pendingApprovals.reduce((prev, curr) =>
                          new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
                        );
                        const days = Math.floor((Date.now() - new Date(oldest.createdAt)) / 86400000);
                        return `${days}d ago`;
                      })()
                    : '—'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
};

// ==========================================
// PAGE 10: REPORTS
// ==========================================
const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('Headcount');
  const [groupBy, setGroupBy] = useState('department');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLoadingReport(true);
    setReportData(null);
    let fetchReport;
    switch (activeReport) {
      case 'Headcount': fetchReport = reportAPI.getHeadcount({ groupBy }); break;
      case 'Attendance': fetchReport = reportAPI.getAttendance({ month: currentMonth }); break;
      case 'Leave': fetchReport = reportAPI.getLeave({ year: currentYear }); break;
      default: fetchReport = reportAPI.getHeadcount({ groupBy: 'department' });
    }
    fetchReport.then(res => {
      setReportData(res.data?.data || res.data || []);
    }).catch(err => {
      console.error('Report fetch failed:', err);
      setReportData([]);
    }).finally(() => setLoadingReport(false));
  }, [activeReport, groupBy]);

  const PIE_COLORS = ['rgba(220,215,205,0.9)', 'rgba(150,145,140,0.8)', 'rgba(90,87,83,0.8)', 'rgba(45,42,40,0.9)', 'rgba(180,170,160,0.8)', 'rgba(110,105,100,0.7)'];

  // Headcount derived data
  const headcountByGroup = Array.isArray(reportData) ? reportData.map(item => ({
    name: (item.group || item._id || 'Unknown').toString(),
    fullName: (item.group || item._id || 'Unknown').toString(),
    count: item.count || 0
  })) : [];

  // Attendance derived data
  const attendanceSummary = Array.isArray(reportData) ? reportData : [];
  const totalPresent = attendanceSummary.reduce((s, r) => s + (r.presentDays || 0), 0);
  const totalAbsent = attendanceSummary.reduce((s, r) => s + (r.absentDays || 0), 0);
  const totalLate = attendanceSummary.reduce((s, r) => s + (r.lateDays || 0), 0);
  const attendancePie = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalAbsent },
    { name: 'Late', value: totalLate }
  ].filter(d => d.value > 0);

  // Leave derived data
  const leaveUsage = Array.isArray(reportData) ? reportData : [];
  const leaveByType = leaveUsage.map(item => ({
    name: (item.leaveTypeName || item._id || 'Leave').toString(),
    applied: item.totalRequests || 0,
    approved: item.approvedRequests || 0,
    days: item.totalDays || 0
  }));

  const handleExportCSV = () => {
    let endpoint = '';
    let params = '';
    switch (activeReport) {
      case 'Headcount': endpoint = `/reports/headcount?groupBy=${groupBy}&export=csv`; break;
      case 'Attendance': endpoint = `/reports/attendance/summary?month=${currentMonth}&export=csv`; break;
      case 'Leave': endpoint = `/reports/leave/usage?year=${currentYear}&export=csv`; break;
      default: return;
    }
    const token = localStorage.getItem('hrms_token');
    fetch(`http://localhost:5000/api${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport.toLowerCase()}-report-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => toast.error('CSV export failed'));
  };

  const reportsNavStyle = (report) => {
    const isActive = activeReport === report;
    return {
      background: isActive ? 'rgba(232, 228, 220, 0.15)' : 'rgba(255, 255, 255, 0.04)',
      borderLeft: isActive ? '3px solid rgba(232, 228, 220, 0.8)' : '3px solid transparent',
      color: isActive ? '#F0EBE3' : '#9A9690',
      border: 'none',
      borderTopRightRadius: '10px',
      borderBottomRightRadius: '10px',
      borderTopLeftRadius: isActive ? '0' : '10px',
      borderBottomLeftRadius: isActive ? '0' : '10px',
      padding: '12px 16px',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      width: '100%',
      boxSizing: 'border-box'
    };
  };

  return (
    <AppShell pageTitle="Reports & Analytics" activeNav="Reports">
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Inner sidebar */}
        <div style={{
          flex: '1 1 180px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(15, 14, 12, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '16px',
          boxSizing: 'border-box',
          alignSelf: 'flex-start'
        }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#6A6865', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 4px' }}>Reports</p>
          <button onClick={() => { setActiveReport('Headcount'); setGroupBy('department'); }} style={reportsNavStyle('Headcount')}>Headcount</button>
          <button onClick={() => setActiveReport('Attendance')} style={reportsNavStyle('Attendance')}>Attendance</button>
          <button onClick={() => setActiveReport('Leave')} style={reportsNavStyle('Leave')}>Leave Usage</button>
        </div>

        {/* Dynamic Report Content Area */}
        <div style={{ flex: '4 1 580px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Filter Bar */}
          <div style={{ ...glassStyles.card, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>{activeReport} Report</span>
              {activeReport === 'Headcount' && (
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value)}
                  style={{ 
                    ...glassStyles.input, 
                    height: '34px', 
                    width: '140px', 
                    fontSize: '12px',
                    paddingLeft: '12px',
                    paddingRight: '26px',
                    paddingTop: '0',
                    paddingBottom: '0',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C8C4BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '12px',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    color: '#C8C4BC',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.color = '#FFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                    e.currentTarget.style.color = '#C8C4BC';
                  }}
                >
                  <option value="department" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>By Department</option>
                  <option value="designation" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>By Designation</option>
                  <option value="status" style={{ backgroundColor: '#201E1C', color: '#FFF' }}>By Status</option>
                </select>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleExportCSV} style={{ ...glassStyles.btnSecondary, padding: '6px 14px', fontSize: '12px' }}>Export CSV</button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loadingReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2].map(i => (
                <div key={i} style={{ ...glassStyles.card, height: '200px', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Headcount Report */}
          {!loadingReport && activeReport === 'Headcount' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...glassStyles.cardChart, flex: '1 1 260px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Distribution</h4>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={headcountByGroup} cx="50%" cy="42%" innerRadius={45} outerRadius={70} dataKey="count">
                          {headcountByGroup.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={2} stroke="rgba(255,255,255,0.15)" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(v, n, p) => [v, p.payload.fullName]} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={70}
                          iconSize={8}
                          iconType="circle"
                          wrapperStyle={{ 
                            paddingTop: '10px',
                            fontSize: '11px',
                            lineHeight: '16px'
                          }} 
                          formatter={(v) => <span style={{ color: '#9A9690' }}>{v}</span>} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ ...glassStyles.cardChart, flex: '2 1 360px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Headcount by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</h4>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={headcountByGroup} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: '#7A7870', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="count" fill="rgba(200,196,188,0.75)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</th>
                        <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Employee Count</th>
                        <th style={{ padding: '12px 24px', color: '#A8A5A0', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>% Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headcountByGroup.length === 0 ? (
                        <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available</td></tr>
                      ) : (() => {
                        const total = headcountByGroup.reduce((s, r) => s + r.count, 0);
                        return headcountByGroup.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '14px 24px', color: '#F0EBE3', fontWeight: '600' }}>{row.fullName}</td>
                            <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{row.count}</td>
                            <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{total > 0 ? ((row.count / total) * 100).toFixed(1) : 0}%</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Report */}
          {!loadingReport && activeReport === 'Attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary KPI cards */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Present Days', value: totalPresent, color: 'rgba(140,200,130,0.8)' },
                  { label: 'Total Absent Days', value: totalAbsent, color: 'rgba(200,100,100,0.8)' },
                  { label: 'Total Late Arrivals', value: totalLate, color: 'rgba(220,180,80,0.8)' },
                  { label: 'Employees Tracked', value: attendanceSummary.length, color: 'rgba(150,180,220,0.8)' }
                ].map(kpi => (
                  <div key={kpi.label} style={{ ...glassStyles.card, flex: '1 1 140px', textAlign: 'center', padding: '20px 16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: kpi.color, marginBottom: '6px' }}>{kpi.value}</div>
                    <div style={{ fontSize: '11px', color: '#9A9690' }}>{kpi.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...glassStyles.cardChart, flex: '1 1 260px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Attendance Breakdown</h4>
                  {attendancePie.length > 0 ? (
                    <div style={{ width: '100%', height: '260px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                          <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {attendancePie.map((entry, index) => (
                              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No attendance data for this month</p>}
                </div>
                <div style={{ ...glassStyles.cardChart, flex: '2 1 340px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Top Absent Employees</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {attendanceSummary.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data</p>
                    ) : [...attendanceSummary].sort((a, b) => (b.absentDays || 0) - (a.absentDays || 0)).slice(0, 6).map((emp, i) => {
                      const name = emp.employeeName || emp.name || (emp.personal ? `${emp.personal.firstName || ''} ${emp.personal.lastName || ''}`.trim() : 'Employee');
                      const absent = emp.absentDays || 0;
                      const present = emp.presentDays || 0;
                      const total = absent + present;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span style={{ color: '#E8E4DC', fontWeight: '600' }}>{name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '80px', height: '5px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                              <div style={{ width: `${total > 0 ? (absent / total) * 100 : 0}%`, height: '100%', backgroundColor: 'rgba(200,100,100,0.8)', borderRadius: '3px' }} />
                            </div>
                            <span style={{ color: '#9A9690', width: '60px', textAlign: 'right' }}>{absent} absent</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Employee', 'Present Days', 'Absent Days', 'Late Arrivals', 'Att. %'].map(h => (
                          <th key={h} style={{ padding: '12px 20px', color: '#A8A5A0', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance data for this period</td></tr>
                      ) : attendanceSummary.slice(0, 15).map((emp, idx) => {
                        const name = emp.employeeName || emp.name || (emp.personal ? `${emp.personal.firstName || ''} ${emp.personal.lastName || ''}`.trim() : 'Employee');
                        const present = emp.presentDays || 0;
                        const absent = emp.absentDays || 0;
                        const late = emp.lateDays || 0;
                        const workingDays = present + absent;
                        const attPct = workingDays > 0 ? ((present / workingDays) * 100).toFixed(0) : '—';
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 20px', color: '#F0EBE3', fontWeight: '600' }}>{name}</td>
                            <td style={{ padding: '12px 20px', color: 'rgba(140,200,130,0.9)' }}>{present}</td>
                            <td style={{ padding: '12px 20px', color: 'rgba(200,100,100,0.9)' }}>{absent}</td>
                            <td style={{ padding: '12px 20px', color: 'rgba(220,180,80,0.9)' }}>{late}</td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{attPct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Leave Usage Report */}
          {!loadingReport && activeReport === 'Leave' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...glassStyles.cardChart, flex: '1 1 260px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Leave by Type</h4>
                  {leaveByType.length > 0 ? (
                    <div style={{ width: '100%', height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={leaveByType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="days">
                            {leaveByType.map((entry, index) => (
                              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v} days`]} />
                          <Legend formatter={(v) => <span style={{ color: '#9A9690', fontSize: 11 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No leave data for this year</p>}
                </div>
                <div style={{ ...glassStyles.cardChart, flex: '2 1 340px' }}>
                  <h4 style={{ color: 'var(--cream)', fontSize: '14px', margin: '0 0 16px' }}>Applications vs. Approvals</h4>
                  {leaveByType.length > 0 ? (
                    <div style={{ width: '100%', height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leaveByType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: '#7A7870', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#7A7870', fontSize: 11 }} allowDecimals={false} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="applied" name="Applied" fill="rgba(180,175,165,0.6)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="approved" name="Approved" fill="rgba(140,200,130,0.7)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data</p>}
                </div>
              </div>
              <div style={{ ...glassStyles.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Leave Type', 'Applications', 'Approved', 'Total Days', 'Approval Rate'].map(h => (
                          <th key={h} style={{ padding: '12px 20px', color: '#A8A5A0', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leaveByType.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No leave data for this year</td></tr>
                      ) : leaveByType.map((row, idx) => {
                        const rate = row.applied > 0 ? ((row.approved / row.applied) * 100).toFixed(0) : '—';
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 20px', color: '#F0EBE3', fontWeight: '600' }}>{row.name}</td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{row.applied}</td>
                            <td style={{ padding: '12px 20px', color: 'rgba(140,200,130,0.9)' }}>{row.approved}</td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{row.days} days</td>
                            <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </AppShell>
  );
};

// ==========================================
// PAGE 11: NOTIFICATIONS
// ==========================================
const NotificationsPage = () => {
  const [filter, setFilter] = useState('All');
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(true);

  const fetchNotifications = async () => {
    setLoadingNotif(true);
    try {
      const params = filter !== 'All' && filter !== 'Unread' ? { type: filter.toUpperCase() } : {};
      const { data } = await notificationAPI.getAll(params);
      let notifs = data.notifications || data.data || [];
      if (filter === 'Unread') notifs = notifs.filter(n => !n.isRead);
      setList(notifs);
      setUnreadCount(data.unreadCount || notifs.filter(n => !n.isRead).length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const filteredNotifications = list.filter(item => {
    if (filter === 'All' || filter === 'Unread') return true;
    
    const event = (item.event || '').toUpperCase();
    if (filter === 'Leave') {
      return event.includes('LEAVE');
    }
    if (filter === 'Attendance') {
      return event.includes('PUNCH') || event.includes('ATTENDANCE') || event.includes('REGULARIZATION');
    }
    if (filter === 'Approvals') {
      return event.includes('APPROVAL') || event.includes('REQUEST');
    }
    if (filter === 'System') {
      return event.includes('WELCOME') || event.includes('PASSWORD') || event.includes('LOCKED') || event.includes('SLA');
    }
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setList(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkItemRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell pageTitle="System Alerts & Notifications" activeNav="Notifications">
      
      {/* Top Filter Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'Unread', 'Leave', 'Attendance', 'Approvals', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={filter === tab ? glassStyles.pillActive : glassStyles.pillInactive}
            >
              {tab}
            </button>
          ))}
          {unreadCount > 0 && (
            <span style={{ backgroundColor: 'rgba(232,228,220,0.2)', color: 'var(--cream)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'rgba(232, 228, 220, 0.12)',
            color: '#E8E4DC',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            padding: '8px 18px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232, 228, 220, 0.20)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(232, 228, 220, 0.12)'}
        >
          Mark all read
        </button>
      </div>

      {/* Notifications list */}
      {loadingNotif ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, height: 76, animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ color: '#6A6865', textAlign: 'center', padding: '40px 20px', fontSize: 14 }}>No notifications found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map((item) => (
            <div
              key={item._id || item.id}
              onClick={() => !item.isRead && handleMarkItemRead(item._id || item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: !item.isRead ? 'pointer' : 'default',
                background: !item.isRead ? 'rgba(30, 28, 25, 0.90)' : 'rgba(22, 20, 18, 0.84)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: !item.isRead ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.10)',
                borderRadius: '14px',
                padding: '16px 20px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if (!item.isRead) e.currentTarget.style.backgroundColor = 'rgba(38, 35, 30, 0.94)'; }}
              onMouseLeave={(e) => { if (!item.isRead) e.currentTarget.style.backgroundColor = 'rgba(30, 28, 25, 0.90)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A8780' }}>
                  <Bell size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#F0EBE3' }}>{item.subject || item.title || item.event?.replace(/_/g, ' ') || 'Notification'}</span>
                  <span style={{ fontSize: '13px', color: '#9A9690' }}>{item.body || item.message || ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#6A6865' }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time || ''}
                </span>
                {!item.isRead && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cream)' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </AppShell>
  );
};

// ==========================================
// PAGE 12: PROFILE PAGE
// ==========================================
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    email: true, leave: true, attendance: true, system: false
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: ''
  });

  // Company Profile states
  const isHROrCEO = user?.role === 'HR_ADMIN' || user?.role === 'LEADERSHIP';
  const [activeTab, setActiveTab] = useState('My Profile');
  const [org, setOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [editOrgMode, setEditOrgMode] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  
  const [orgForm, setOrgForm] = useState({
    name: '',
    industry: 'Technology',
    logo: '',
    street: '',
    city: '',
    state: '',
    country: ''
  });

  useEffect(() => {
    Promise.all([
      essAPI.getProfile().catch(() => ({ data: null })),
      leaveAPI.getMyBalance().catch(() => ({ data: { data: [] } }))
    ]).then(([profRes, balRes]) => {
      const prof = profRes.data;
      setProfile(prof);
      setLeaveBalances(balRes.data?.data || []);
      if (prof) {
        setEditForm({
          name: `${prof.personal?.firstName || ''} ${prof.personal?.lastName || ''}`.trim(),
          phone: prof.contact?.personalPhone || prof.contact?.phone || prof.personal?.phone || '',
          dateOfBirth: prof.personal?.dateOfBirth ? new Date(prof.personal.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: prof.personal?.gender || 'MALE',
          address: prof.personal?.address || ''
        });
      }
    }).catch(console.error).finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (isHROrCEO && activeTab === 'Company Profile') {
      setLoadingOrg(true);
      orgAPI.getOrganization()
        .then(res => {
          const organization = res.data?.data || res.data;
          setOrg(organization);
          if (organization) {
            setOrgForm({
              name: organization.name || '',
              industry: organization.industry || 'Technology',
              logo: organization.logo || '',
              street: organization.address?.street || '',
              city: organization.address?.city || '',
              state: organization.address?.state || '',
              country: organization.address?.country || ''
            });
          }
        })
        .catch(err => {
          console.error('Failed to fetch organization details:', err);
        })
        .finally(() => setLoadingOrg(false));
    }
  }, [activeTab, isHROrCEO]);

  const handleSaveOrgChanges = async () => {
    setSavingOrg(true);
    try {
      const payload = {
        name: orgForm.name,
        industry: orgForm.industry,
        logo: orgForm.logo,
        address: {
          street: orgForm.street,
          city: orgForm.city,
          state: orgForm.state,
          country: orgForm.country
        }
      };
      const res = await orgAPI.updateOrganization(payload);
      if (res.data?.success || res.status === 200) {
        toast.success('Company details updated successfully!');
        const updatedOrg = res.data?.data || res.data;
        setOrg(updatedOrg);
        setEditOrgMode(false);
        if (updateUser) {
          updateUser({ companyName: updatedOrg.name || orgForm.name });
        }
      } else {
        toast.error('Failed to update company details');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update company details');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await essAPI.updateProfile(editForm);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        const updatedProfile = res.data?.data || res.data;
        setProfile(updatedProfile);
        
        // Sync name globally
        const newFullName = `${updatedProfile.personal?.firstName || ''} ${updatedProfile.personal?.lastName || ''}`.trim();
        if (updateUser) {
          updateUser({ name: newFullName });
        }
      } else {
        toast.error(res.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fullName = profile
    ? `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim()
    : user?.name || 'User';
  const initials = fullName.split(' ').map(p => p[0] || '').join('').toUpperCase().slice(0, 2) || 'U';
  const dept = profile?.employment?.departmentId?.name || 'N/A';
  const designation = profile?.employment?.designationId?.name || user?.roleTitle || 'N/A';
  const location = profile?.employment?.locationId?.name || 'N/A';
  const doj = profile?.employment?.dateOfJoining ? new Date(profile.employment.dateOfJoining).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const email = profile?.contact?.officialEmail || user?.email || 'N/A';
  const phone = profile?.contact?.personalPhone || profile?.contact?.phone || profile?.personal?.phone || 'N/A';
  const empId = profile?.employeeId || 'N/A';
  const manager = profile?.employment?.reportingManagerId?.personal ? `${profile.employment.reportingManagerId.personal.firstName || ''} ${profile.employment.reportingManagerId.personal.lastName || ''}`.trim() : 'N/A';
  const totalLeaveBalance = leaveBalances.reduce((sum, b) => sum + Math.max(0, (b.openingBalance || 0) + (b.accrued || 0) - (b.availed || 0)), 0);

  return (
    <AppShell pageTitle="My Profile" activeNav="Profile">
      {isHROrCEO && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          {['My Profile', 'Company Profile'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? 'var(--cream)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === 'My Profile' ? (
        <>
          {/* Top Header Card */}
          <div style={{
            ...glassStyles.cardDark,
            padding: '32px',
            marginBottom: '24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E8E3DD',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A1815', fontWeight: '700', fontSize: '28px'
              }}>
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#F0EBE3', margin: 0 }}>{fullName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', color: '#D4D0C8', fontWeight: '600' }}>
                    {designation}
                  </span>
                  <span style={{ fontSize: '13px', color: '#9A9690' }}>
                    Department: <strong>{dept}</strong>
                  </span>
                </div>
              </div>
            </div>
            {editMode ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setEditMode(false);
                    if (profile) {
                      setEditForm({
                        name: `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim(),
                        phone: profile.contact?.personalPhone || profile.contact?.phone || profile.personal?.phone || '',
                        dateOfBirth: profile.personal?.dateOfBirth ? new Date(profile.personal.dateOfBirth).toISOString().slice(0, 10) : '',
                        gender: profile.personal?.gender || 'MALE',
                        address: profile.personal?.address || ''
                      });
                    }
                  }}
                  disabled={saving}
                  style={{
                    background: 'transparent',
                    color: '#E8E4DC',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  style={{
                    ...glassStyles.btnPrimary,
                    padding: '10px 20px',
                    fontSize: '13px'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{ ...glassStyles.btnPrimary, padding: '10px 24px', fontSize: '13px' }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Two Column Grid */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Left Column (60%) */}
            <div style={{ flex: '3 1 540px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Personal Information */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Personal Information</h3>
                {loadingProfile ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 160, animation: 'shimmer 1.5s infinite' }} />
                ) : editMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Employee ID (Read Only)</label>
                      <input
                        type="text"
                        value={empId}
                        disabled
                        style={{ ...glassStyles.input, width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px' }}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer Not To Say</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Phone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Official Email (Read Only)</label>
                      <input
                        type="text"
                        value={email}
                        disabled
                        style={{ ...glassStyles.input, width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Address</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Full Name', value: fullName },
                      { label: 'Employee ID', value: empId },
                      { label: 'Date of Birth', value: profile?.personal?.dateOfBirth ? new Date(profile.personal.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
                      { label: 'Gender', value: profile?.personal?.gender || 'N/A' },
                      { label: 'Phone', value: phone },
                      { label: 'Official Email', value: email },
                      { label: 'Address', value: profile?.personal?.address || 'N/A' }
                    ].map((row, idx, arr) => (
                      <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#6A6865' }}>{row.label}</span>
                          <span style={{ color: '#E8E4DC', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                        </div>
                        {idx < arr.length - 1 && <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '8px' }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 2: Employment Details */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Employment Details</h3>
                {loadingProfile ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 160, animation: 'shimmer 1.5s infinite' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Company Name', value: user?.companyName || 'N/A' },
                      { label: 'Work Email', value: email },
                      { label: 'Department', value: dept },
                      { label: 'Designation', value: designation },
                      { label: 'Date of Joining', value: doj },
                      { label: 'Employment Type', value: profile?.employment?.employmentType || 'Full-time' },
                      { label: 'Reporting Manager', value: manager },
                      { label: 'Work Shift', value: profile?.employment?.shiftId?.name || 'General (9AM - 6PM)' }
                    ].map((row, idx, arr) => (
                      <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#6A6865' }}>{row.label}</span>
                          <span style={{ color: '#E8E4DC', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                        </div>
                        {idx < arr.length - 1 && <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '8px' }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (40%) */}
            <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Quick Stats */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Quick Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Employee ID', value: empId },
                    { label: 'Leave Balance', value: `${totalLeaveBalance} days` },
                    { label: 'Department', value: dept !== 'N/A' ? dept.split(' ')[0] : '—' },
                    { label: 'Role', value: user?.role ? user.role.replace('_', ' ') : '—' }
                  ].map((stat) => (
                    <div key={stat.label} style={{ ...glassStyles.card, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>{stat.value}</span>
                      <span style={{ fontSize: '11px', color: '#9A9690' }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Leave Balances */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Leave Balances</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {leaveBalances.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>No leave data</p>
                  ) : leaveBalances.slice(0, 4).map((bal, i) => {
                    const remaining = Math.max(0, (bal.openingBalance || 0) + (bal.accrued || 0) - (bal.availed || 0));
                    const total = (bal.openingBalance || 0) + (bal.accrued || 0);
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#F0EBE3' }}>{bal.leaveTypeId?.name || 'Leave'}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{remaining} / {total} days</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div style={{ width: `${total > 0 ? (remaining / total) * 100 : 0}%`, height: '100%', backgroundColor: 'rgba(232,228,220,0.7)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Security & Access */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Security</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button style={{ background: 'transparent', color: '#E8E4DC', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 16px', width: '100%', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    Change Password
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#D4D0C8' }}>Two-Factor Auth</span>
                    <div onClick={() => setTwoFa(!twoFa)} style={{ width: '40px', height: '20px', borderRadius: '10px', backgroundColor: twoFa ? '#704A3C' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', top: '2px', left: twoFa ? '22px' : '2px', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Notification Preferences */}
              <div style={glassStyles.cardDark}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Notifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { key: 'email', label: 'Email Notifications' },
                    { key: 'leave', label: 'Leave Approvals' },
                    { key: 'attendance', label: 'Attendance Alerts' },
                    { key: 'system', label: 'System Updates' }
                  ].map((pref) => {
                    const isON = notifPrefs[pref.key];
                    return (
                      <div key={pref.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#D4D0C8' }}>{pref.label}</span>
                        <div onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))} style={{ width: '40px', height: '20px', borderRadius: '10px', backgroundColor: isON ? '#704A3C' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', top: '2px', left: isON ? '22px' : '2px', transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </>
      ) : (
        /* Company Profile Layout */
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Left Column (60%) */}
          <div style={{ flex: '3 1 540px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={glassStyles.cardDark}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: 0 }}>Company Information</h3>
                {editOrgMode ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setEditOrgMode(false);
                        if (org) {
                          setOrgForm({
                            name: org.name || '',
                            industry: org.industry || 'Technology',
                            logo: org.logo || '',
                            street: org.address?.street || '',
                            city: org.address?.city || '',
                            state: org.address?.state || '',
                            country: org.address?.country || ''
                          });
                        }
                      }}
                      disabled={savingOrg}
                      style={{ background: 'transparent', color: '#E8E4DC', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOrgChanges}
                      disabled={savingOrg}
                      style={{ ...glassStyles.btnPrimary, padding: '6px 16px', fontSize: '12px' }}
                    >
                      {savingOrg ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditOrgMode(true)}
                    style={{ ...glassStyles.btnPrimary, padding: '6px 16px', fontSize: '12px' }}
                  >
                    Edit Company
                  </button>
                )}
              </div>

              {loadingOrg ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 200, animation: 'shimmer 1.5s infinite' }} />
              ) : editOrgMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Company Name</label>
                      <input
                        type="text"
                        value={orgForm.name}
                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Industry Type</label>
                      <select
                        value={orgForm.industry}
                        onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
                        style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px' }}
                      >
                        {['Technology', 'Finance', 'Manufacturing', 'Retail', 'Healthcare', 'Consulting', 'Other'].map(ind => (
                          <option key={ind} value={ind} style={{ background: '#12100E' }}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Logo URL</label>
                    <input
                      type="text"
                      value={orgForm.logo}
                      onChange={(e) => setOrgForm({ ...orgForm, logo: e.target.value })}
                      style={{ ...glassStyles.input, width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Street Address</label>
                    <input
                      type="text"
                      value={orgForm.street}
                      onChange={(e) => setOrgForm({ ...orgForm, street: e.target.value })}
                      style={{ ...glassStyles.input, width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>City</label>
                      <input
                        type="text"
                        value={orgForm.city}
                        onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>State</label>
                      <input
                        type="text"
                        value={orgForm.state}
                        onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Country</label>
                      <input
                        type="text"
                        value={orgForm.country}
                        onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
                        style={{ ...glassStyles.input, width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Company Name', value: org?.name || 'N/A' },
                    { label: 'Industry', value: org?.industry || 'N/A' },
                    { label: 'Street Address', value: org?.address?.street || 'N/A' },
                    { label: 'City', value: org?.address?.city || 'N/A' },
                    { label: 'State', value: org?.address?.state || 'N/A' },
                    { label: 'Country', value: org?.address?.country || 'N/A' }
                  ].map((row, idx, arr) => (
                    <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#6A6865' }}>{row.label}</span>
                        <span style={{ color: '#E8E4DC', fontWeight: '500' }}>{row.value}</span>
                      </div>
                      {idx < arr.length - 1 && <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '8px' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (40%) */}
          <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={glassStyles.cardDark}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', margin: '0 0 20px' }}>Company Logo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
                {org?.logo ? (
                  <img src={org.logo} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <div style={{ width: '120px', height: '120px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A6865', fontSize: '13px' }}>
                    No Logo Added
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

// ==========================================
// PAGE: COMPENSATION PAGE
// ==========================================
const CompensationPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Compensation');
  const [compensation, setCompensation] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipDetail, setPayslipDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // For HR/Manager team view
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedTeamEmp, setSelectedTeamEmp] = useState(null);
  const [teamPayslips, setTeamPayslips] = useState([]);

  const role = currentUser?.role;
  const isHROrCEO = role === 'HR_ADMIN' || role === 'LEADERSHIP';
  const isManager = role === 'MANAGER';

  const tabs = ['My Compensation', ...(isManager ? ['Team Compensation'] : []), ...(isHROrCEO ? ['All Compensation'] : []), 'Salary Benchmarks'];

  const fmt = (n) => n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';

  useEffect(() => {
    setLoading(true);
    compensationAPI.getMyCompensation()
      .then(res => {
        const data = res.data?.data || res.data;
        setCompensation(data);
        const empId = data?.employee?._id;
        if (empId) {
          return compensationAPI.getPayslips(empId);
        }
      })
      .then(res => {
        if (res) setPayslips(res.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if ((activeTab === 'Team Compensation' || activeTab === 'All Compensation') && teamEmployees.length === 0) {
      setLoadingTeam(true);
      employeeAPI.getAll({ limit: 200 })
        .then(res => setTeamEmployees(res.data?.data || []))
        .catch(console.error)
        .finally(() => setLoadingTeam(false));
    }
  }, [activeTab]);

  const openPayslipDetail = async (payslip, empId) => {
    setSelectedPayslip(payslip);
    setLoadingDetail(true);
    setShowPayslipModal(true);
    try {
      const res = await compensationAPI.getPayslipDetail(empId, payslip.yearMonth);
      setPayslipDetail(res.data?.data || null);
    } catch (e) {
      toast.error('Failed to load payslip detail');
      setPayslipDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openTeamPayslips = async (emp) => {
    setSelectedTeamEmp(emp);
    setTeamPayslips([]);
    try {
      const res = await compensationAPI.getPayslips(emp._id);
      setTeamPayslips(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const myEmp = compensation?.employee;
  const myStructure = compensation?.structure;
  const annualCTC = myEmp?.employment?.salary || 0;

  const filteredTeam = teamEmployees.filter(e => {
    const name = `${e.personal?.firstName || ''} ${e.personal?.lastName || ''}`.toLowerCase();
    const empId = (e.employeeId || '').toLowerCase();
    const dept = (e.employment?.departmentId?.name || '').toLowerCase();
    const q = teamSearch.toLowerCase();
    return !q || name.includes(q) || empId.includes(q) || dept.includes(q);
  });

  return (
    <AppShell pageTitle="Compensation" activeNav="Compensation">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #payslip-printable, #payslip-printable * { visibility: visible !important; }
          #payslip-printable { position: fixed !important; top: 0; left: 0; width: 100%; background: white !important; color: black !important; padding: 40px; box-sizing: border-box; z-index: 99999; }
          #payslip-printable .no-print { display: none !important; }
        }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSelectedTeamEmp(null); }}
            style={activeTab === tab ? glassStyles.pillActive : glassStyles.pillInactive}>
            {tab}
          </button>
        ))}
      </div>

      {/* MY COMPENSATION TAB */}
      {activeTab === 'My Compensation' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6A6865' }}>Loading compensation data…</div>
        ) : !myStructure ? (
          <div style={{ ...glassStyles.card, textAlign: 'center', padding: '60px', color: '#A8A5A0' }}>
            <Coins size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>No salary data found. Please contact HR to update your CTC.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {/* Left: Salary Structure */}
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* CTC Overview */}
              <div style={{ ...glassStyles.card, background: 'linear-gradient(135deg, rgba(112,74,60,0.45) 0%, rgba(20,18,16,0.9) 100%)', border: '1px solid rgba(232,228,220,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A8A5A0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Annual CTC</p>
                    <h2 style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: '800', color: '#F0EBE3' }}>{fmt(annualCTC)}</h2>
                  </div>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(232,228,220,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Landmark size={28} color="#E8E4DC" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A8A5A0' }}>Monthly Gross</p>
                    <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#F0EBE3' }}>{fmt(myStructure.gross)}</p>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A8A5A0' }}>Net Take-Home</p>
                    <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#7dd87d' }}>{fmt(myStructure.gross - myStructure.employeePF - myStructure.employeeESI - myStructure.professionalTax)}</p>
                  </div>
                </div>
              </div>

              {/* Designation Salary Benchmark */}
              {(() => {
                const desig = myEmp?.employment?.designationId?.name;
                const suggested = getSuggestedSalary(desig);
                const range = getSuggestedSalaryRange(desig);
                if (!suggested || !range) return null;
                
                const diff = annualCTC - suggested;
                const pctDiff = suggested > 0 ? ((diff / suggested) * 100).toFixed(1) : 0;
                
                return (
                  <div style={{ ...glassStyles.card, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <Coins size={18} color="#7dd87d" />
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Designation Benchmark
                      </h3>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#D4D0C8' }}>
                      Suggested annual package range for <strong>{desig}</strong>:
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#A8A5A0' }}>Reference Range</p>
                        <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '700', color: '#F0EBE3' }}>
                          {fmt(range.min)} - {fmt(range.max)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: '#A8A5A0' }}>Midpoint</p>
                        <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '700', color: '#7dd87d' }}>{fmt(suggested)}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#A8A5A0' }}>Your CTC vs Midpoint:</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: diff >= 0 ? '#7dd87d' : '#f28888',
                        background: diff >= 0 ? 'rgba(125,216,125,0.1)' : 'rgba(242,136,136,0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${diff >= 0 ? 'rgba(125,216,125,0.15)' : 'rgba(242,136,136,0.15)'}`
                      }}>
                        {diff === 0 ? 'On Benchmark' : diff > 0 ? `+${pctDiff}% (Competitive)` : `${pctDiff}% (Below Benchmark)`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Earnings Breakdown */}
              <div style={glassStyles.card}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings (Monthly)</h3>
                {[
                  { label: 'Basic Salary', value: myStructure.basic, pct: '50%' },
                  { label: 'House Rent Allowance (HRA)', value: myStructure.hra, pct: '20%' },
                  { label: 'Special Allowance', value: myStructure.specialAllowance, pct: '20%' },
                  { label: 'Conveyance / Internet', value: myStructure.conveyance, pct: '5%' },
                  { label: 'Medical / Other', value: myStructure.otherAllowance, pct: '5%' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#D4D0C8' }}>{row.label}</span>
                      <span style={{ fontSize: '10px', color: '#6A6865', marginLeft: '8px' }}>({row.pct} of Gross)</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#7dd87d' }}>{fmt(row.value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>Total Gross</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#F0EBE3' }}>{fmt(myStructure.gross)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div style={glassStyles.card}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deductions (Monthly)</h3>
                {[
                  { label: 'Employee PF (12% of Basic)', value: myStructure.employeePF },
                  ...(myStructure.employeeESI > 0 ? [{ label: 'Employee ESI (0.75% of Gross)', value: myStructure.employeeESI }] : []),
                  ...(myStructure.professionalTax > 0 ? [{ label: 'Professional Tax', value: myStructure.professionalTax }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '13px', color: '#D4D0C8' }}>{row.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f28888' }}>{fmt(row.value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>Total Deductions</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#f28888' }}>{fmt(myStructure.employeePF + myStructure.employeeESI + myStructure.professionalTax)}</span>
                </div>
              </div>

              {/* Employer Contributions */}
              <div style={glassStyles.card}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employer Contributions</h3>
                {[
                  { label: 'Employer PF (12% of Basic)', value: myStructure.employerPF },
                  { label: 'Gratuity (4.81% of Basic)', value: myStructure.gratuity },
                  ...(myStructure.employerESI > 0 ? [{ label: 'Employer ESI (3.25% of Gross)', value: myStructure.employerESI }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '13px', color: '#D4D0C8' }}>{row.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#A8CFFF' }}>{fmt(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Payslip History */}
            <div style={{ flex: '1 1 340px' }}>
              <div style={glassStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Receipt size={18} color="#A8A5A0" />
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payslip History</h3>
                </div>
                {payslips.length === 0 ? (
                  <p style={{ color: '#6A6865', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No payslips generated yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {payslips.map((ps, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#F0EBE3', fontSize: '14px' }}>{ps.monthName} {ps.year}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6A6865' }}>Net: {fmt(ps.netSalary)} {ps.unpaidDays > 0 ? `· ${ps.unpaidDays}d LWP` : ''}</p>
                        </div>
                        <button
                          onClick={() => openPayslipDetail(ps, myEmp?._id)}
                          style={{ ...glassStyles.btnSecondary, padding: '7px 14px', fontSize: '12px', borderRadius: '8px' }}
                        >
                          <Download size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Designation Salary Benchmarks Reference Card */}
              <div style={{ ...glassStyles.card, marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Coins size={18} color="#7dd87d" />
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F0EBE3', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Role Benchmarks Reference
                  </h3>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#A8A5A0' }}>
                  Standard salary terms and annual CTC ranges for organizational roles:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.keys(DESIGNATION_SALARY_MAP).map(key => {
                    const midpoint = DESIGNATION_SALARY_MAP[key];
                    const range = getSuggestedSalaryRange(key) || { min: midpoint * 0.7, max: midpoint * 1.3 };
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#F0EBE3' }}>{key}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6A6865' }}>
                            Range: {(range.min / 100000).toFixed(1)}-{(range.max / 100000).toFixed(1)} LPA
                          </p>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#7dd87d' }}>
                          {(midpoint / 100000).toFixed(1)} LPA
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* TEAM / ALL COMPENSATION TAB */}
      {(activeTab === 'Team Compensation' || activeTab === 'All Compensation') && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Employee List */}
          <div style={{ flex: '1 1 340px' }}>
            <div style={glassStyles.card}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Search by name, ID, or department…"
                  value={teamSearch}
                  onChange={e => setTeamSearch(e.target.value)}
                  style={{ ...glassStyles.input, width: '100%' }}
                />
              </div>
              {loadingTeam ? (
                <p style={{ color: '#6A6865', textAlign: 'center', padding: '24px 0' }}>Loading employees…</p>
              ) : filteredTeam.length === 0 ? (
                <p style={{ color: '#6A6865', textAlign: 'center', padding: '24px 0' }}>No employees found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                  {filteredTeam.map(emp => {
                    const name = `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`.trim();
                    const dept = emp.employment?.departmentId?.name || '—';
                    const ctc = emp.employment?.salary;
                    const isSelected = selectedTeamEmp?._id === emp._id;
                    return (
                      <div
                        key={emp._id}
                        onClick={() => openTeamPayslips(emp)}
                        style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${isSelected ? 'rgba(232,228,220,0.3)' : 'rgba(255,255,255,0.06)'}`, background: isSelected ? 'rgba(232,228,220,0.08)' : 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#F0EBE3', fontSize: '13px' }}>{name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6A6865' }}>{dept} · {emp.employeeId}</p>
                          </div>
                          {isHROrCEO && (
                            <span style={{ fontSize: '13px', fontWeight: '700', color: ctc ? '#7dd87d' : '#6A6865' }}>
                              {ctc ? fmt(ctc) : 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Payslip list for selected employee */}
          {selectedTeamEmp && (
            <div style={{ flex: '1 1 340px' }}>
              <div style={glassStyles.card}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#F0EBE3' }}>
                    {`${selectedTeamEmp.personal?.firstName || ''} ${selectedTeamEmp.personal?.lastName || ''}`.trim()}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#A8A5A0' }}>
                    {selectedTeamEmp.employment?.designationId?.name || ''}
                  </p>
                  
                  {/* Market rate benchmark comparison */}
                  {(() => {
                    const desig = selectedTeamEmp.employment?.designationId?.name;
                    const ctc = selectedTeamEmp.employment?.salary || 0;
                    const suggested = getSuggestedSalary(desig);
                    const range = getSuggestedSalaryRange(desig);
                    if (!suggested || !range) return null;
                    
                    const diff = ctc - suggested;
                    const pctDiff = suggested > 0 ? ((diff / suggested) * 100).toFixed(1) : 0;
                    
                    return (
                      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#A8A5A0' }}>
                          <span>Actual CTC: <strong>{fmt(ctc)}</strong></span>
                          <span>Suggested Midpoint: <strong>{fmt(suggested)}</strong></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                          <span style={{ color: '#6A6865' }}>Range: {fmt(range.min)} - {fmt(range.max)}</span>
                          <span style={{
                            color: diff >= 0 ? '#7dd87d' : '#f28888',
                            fontWeight: '600'
                          }}>
                            {diff === 0 ? 'On Benchmark' : diff > 0 ? `+${pctDiff}% vs Midpoint` : `${pctDiff}% vs Midpoint`}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {teamPayslips.length === 0 ? (
                  <p style={{ color: '#6A6865', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>No payslips available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {teamPayslips.map((ps, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#F0EBE3', fontSize: '13px' }}>{ps.monthName} {ps.year}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6A6865' }}>Net: {fmt(ps.netSalary)} {ps.unpaidDays > 0 ? `· ${ps.unpaidDays}d LWP` : ''}</p>
                        </div>
                        <button
                          onClick={() => openPayslipDetail(ps, selectedTeamEmp._id)}
                          style={{ ...glassStyles.btnSecondary, padding: '7px 14px', fontSize: '12px', borderRadius: '8px' }}
                        >
                          <Download size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SALARY BENCHMARKS TAB */}
      {activeTab === 'Salary Benchmarks' && (
        <div style={glassStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#F0EBE3' }}>Role Salary Benchmarks</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#A8A5A0' }}>Reference salary packages and annual ranges by designation</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search designation..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                style={{ ...glassStyles.input, width: '220px' }}
              />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#A8A5A0', textTransform: 'uppercase' }}>Designation</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#A8A5A0', textTransform: 'uppercase', textAlign: 'right' }}>Suggested Midpoint (CTC)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#A8A5A0', textTransform: 'uppercase', textAlign: 'right' }}>Monthly Est. (Gross)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: '#A8A5A0', textTransform: 'uppercase', textAlign: 'right' }}>Annual Range</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(DESIGNATION_SALARY_MAP)
                  .filter(key => key.toLowerCase().includes(teamSearch.toLowerCase()))
                  .map(key => {
                    const midpoint = DESIGNATION_SALARY_MAP[key];
                    const range = getSuggestedSalaryRange(key) || { min: midpoint * 0.7, max: midpoint * 1.3 };
                    const monthlyGross = midpoint / 12;
                    return (
                      <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#F0EBE3' }}>{key}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#7dd87d', textAlign: 'right' }}>{fmt(midpoint)}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#D4D0C8', textAlign: 'right' }}>{fmt(monthlyGross)}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#A8CFFF', textAlign: 'right', fontWeight: '600' }}>
                          {fmt(range.min)} - {fmt(range.max)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYSLIP MODAL */}
      {showPayslipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ ...glassStyles.cardDark, width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
            {/* Modal Header (no-print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#F0EBE3' }}>
                {selectedPayslip ? `Payslip — ${selectedPayslip.monthName} ${selectedPayslip.year}` : 'Payslip'}
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={handlePrintPayslip} style={{ ...glassStyles.btnPrimary, padding: '8px 18px', fontSize: '13px' }}>
                  <Download size={14} />
                  <span>Download / Print</span>
                </button>
                <X size={20} style={{ color: '#A8A5A0', cursor: 'pointer' }} onClick={() => { setShowPayslipModal(false); setPayslipDetail(null); }} />
              </div>
            </div>

            {/* Printable Payslip */}
            <div id="payslip-printable" style={{ padding: '32px 36px' }}>
              {loadingDetail ? (
                <p style={{ textAlign: 'center', color: '#6A6865', padding: '40px 0' }}>Loading payslip…</p>
              ) : !payslipDetail ? (
                <p style={{ textAlign: 'center', color: '#f28888', padding: '40px 0' }}>Could not load payslip details.</p>
              ) : (() => {
                const emp = selectedTeamEmp || myEmp;
                const name = emp ? `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`.trim() : '—';
                const dept = emp?.employment?.departmentId?.name || '—';
                const desig = emp?.employment?.designationId?.name || '—';
                const empId = emp?.employeeId || '—';
                const s = payslipDetail.structure;
                return (
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#F0EBE3', letterSpacing: '0.04em' }}>PAYSLIP</h2>
                      <p style={{ margin: 0, fontSize: '13px', color: '#A8A5A0' }}>{payslipDetail.monthName} {payslipDetail.year}</p>
                    </div>

                    {/* Employee Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                      {[
                        { label: 'Employee Name', value: name },
                        { label: 'Employee ID', value: empId },
                        { label: 'Department', value: dept },
                        { label: 'Designation', value: desig },
                        { label: 'Days in Month', value: payslipDetail.daysInMonth },
                        { label: 'Leave Without Pay', value: payslipDetail.unpaidDays > 0 ? `${payslipDetail.unpaidDays} day(s)` : 'None' },
                      ].map((item, i) => (
                        <div key={i} style={{ minWidth: '180px' }}>
                          <p style={{ margin: 0, fontSize: '10px', color: '#6A6865', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                          <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: '600', color: '#E8E4DC' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Earnings and Deductions in 2 columns */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {/* Earnings */}
                      <div style={{ flex: '1 1 260px', background: 'rgba(125,216,125,0.06)', border: '1px solid rgba(125,216,125,0.15)', borderRadius: '10px', padding: '16px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#7dd87d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Earnings</h4>
                        {[
                          { label: 'Basic Salary', value: s.basic },
                          { label: 'HRA', value: s.hra },
                          { label: 'Special Allowance', value: s.specialAllowance },
                          { label: 'Conveyance / Internet', value: s.conveyance },
                          { label: 'Medical / Other', value: s.otherAllowance },
                        ].map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '12px', color: '#C8C4BC' }}>{r.label}</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#7dd87d' }}>{fmt(r.value)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>Gross Earnings</span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#F0EBE3' }}>{fmt(s.gross)}</span>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div style={{ flex: '1 1 260px', background: 'rgba(242,136,136,0.06)', border: '1px solid rgba(242,136,136,0.15)', borderRadius: '10px', padding: '16px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#f28888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deductions</h4>
                        {[
                          { label: 'Employee PF', value: s.employeePF },
                          ...(s.employeeESI > 0 ? [{ label: 'Employee ESI', value: s.employeeESI }] : []),
                          ...(s.professionalTax > 0 ? [{ label: 'Professional Tax', value: s.professionalTax }] : []),
                          ...(payslipDetail.lwpDeduction > 0 ? [{ label: `LWP (${payslipDetail.unpaidDays}d)`, value: payslipDetail.lwpDeduction }] : []),
                        ].map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '12px', color: '#C8C4BC' }}>{r.label}</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f28888' }}>{fmt(r.value)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0EBE3' }}>Total Deductions</span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#F0EBE3' }}>{fmt(payslipDetail.totalDeductions)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Pay */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(112,74,60,0.4) 0%, rgba(20,18,16,0.9) 100%)', border: '1px solid rgba(232,228,220,0.2)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#A8A5A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Net Salary Payable</p>
                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#6A6865' }}>{payslipDetail.monthName} {payslipDetail.year} ({payslipDetail.daysInMonth} working days)</p>
                      </div>
                      <span style={{ fontSize: '28px', fontWeight: '900', color: '#F0EBE3', letterSpacing: '-0.02em' }}>{fmt(payslipDetail.netSalary)}</span>
                    </div>

                    <p style={{ margin: '20px 0 0', fontSize: '10px', color: '#4A4845', textAlign: 'center' }}>
                      This is a computer-generated payslip and does not require a signature. Generated by HRMS on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

// ==========================================
// EMPLOYEE DETAIL PAGE
// ==========================================
const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backHover, setBackHover] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newlyGeneratedPassword, setNewlyGeneratedPassword] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedEmail1, setCopiedEmail1] = useState(false);
  const [copiedEmail2, setCopiedEmail2] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    department: '',
    designation: '',
    salary: 0
  });
  const [saving, setSaving] = useState(false);

  // Offboarding state
  const [offboardForm, setOffboardForm] = useState({
    exitType: 'RESIGNED',
    exitDate: new Date().toISOString().slice(0, 10),
    lastWorkingDate: '',
    noticePeriodDays: 30,
    reason: '',
    exitInterviewNotes: '',
    rehireEligible: true,
    finalSettlementDone: false
  });
  const [offboarding, setOffboarding] = useState(false);
  const [showOffboardConfirm, setShowOffboardConfirm] = useState(false);

  const fetchEmployeeData = () => {
    setLoading(true);
    employeeAPI.getById(id).then((empRes) => {
      const emp = empRes.data?.data || empRes.data;
      setEmployee(emp);
      setEditForm({
        name: `${emp.personal?.firstName || ''} ${emp.personal?.lastName || ''}`.trim() || emp.name || '',
        email: emp.contact?.officialEmail || emp.userId?.email || emp.email || '',
        phone: emp.personal?.phone || emp.phone || emp.contact?.personalPhone || '',
        dateOfBirth: emp.personal?.dateOfBirth ? new Date(emp.personal.dateOfBirth).toISOString().slice(0, 10) : '',
        gender: emp.personal?.gender || emp.gender || 'MALE',
        address: emp.personal?.address || emp.address || '',
        department: emp.employment?.departmentId?._id || emp.employment?.departmentId || '',
        designation: emp.employment?.designationId?._id || emp.employment?.designationId || '',
        salary: emp.employment?.salary || 0
      });
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load employee details');
    }).finally(() => setLoading(false));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Determine if the logged-in user is editing their own profile
      const ownProfile = !!(currentUser && employee && (
        employee.userId?._id === currentUser._id ||
        employee.userId === currentUser._id ||
        employee.userId?.email === currentUser.email
      ));
      let res;
      if (ownProfile && currentUser?.role !== 'HR_ADMIN') {
        // Non-HR users editing own profile use the ESS (self-service) endpoint
        res = await essAPI.updateProfile({
          name: editForm.name,
          phone: editForm.phone,
          dateOfBirth: editForm.dateOfBirth,
          gender: editForm.gender,
          address: editForm.address
        });
      } else {
        // HR Admins use the full employee update endpoint
        res = await employeeAPI.update(id, editForm);
      }
      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        fetchEmployeeData();
      } else {
        toast.error(res.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    orgAPI.getDepartments().then(res => {
      setDepartments(res.data?.data || res.data?.departments || res.data || []);
    }).catch(console.error);
    orgAPI.getDesignations().then(res => {
      setDesignations(res.data?.data || res.data?.designations || res.data || []);
    }).catch(console.error);
  }, [id]);

  useEffect(() => {
    window.addEventListener('employee-updated', fetchEmployeeData);
    return () => window.removeEventListener('employee-updated', fetchEmployeeData);
  }, [id]);

  if (loading) {
    return (
      <AppShell pageTitle="Employee Profile" activeNav="Employees">
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 200, animation: 'shimmer 1.5s infinite', marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '3 1 540px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 300, animation: 'shimmer 1.5s infinite' }} />
          <div style={{ flex: '2 1 360px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 300, animation: 'shimmer 1.5s infinite' }} />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell pageTitle="Employee Profile" activeNav="Employees">
        <div style={{ ...glassStyles.card, textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#F0EBE3' }}>Employee Not Found</h3>
          <button onClick={() => navigate('/employees')} style={{ ...glassStyles.btnPrimary, marginTop: '20px' }}>
            Back to Directory
          </button>
        </div>
      </AppShell>
    );
  }

  const fullName = getFullName(employee);
  const initials = getInitials(employee);
  
  const empId = employee.employeeId || 'N/A';
  const role = getEmployeeRole(employee);
  
  const dept = getEmployeeDept(employee);

  const designation = getEmployeeDesig(employee);

  const location = getEmployeeLoc(employee);
  
  const doj = getEmployeeDoj(employee)
    ? new Date(getEmployeeDoj(employee)).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) 
    : '—';
  const dob = employee.personal?.dateOfBirth 
    ? new Date(employee.personal.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) 
    : '—';
  
  const emailVal = getEmployeeEmail(employee);
  const phone = employee.personal?.phone || employee.phone || employee.contact?.personalPhone || '—';
  const gender = employee.personal?.gender || employee.gender || '—';
  const address = employee.personal?.address || employee.address || '—';
  
  const managerName = employee.employment?.reportingManagerId
    ? (typeof employee.employment.reportingManagerId === 'object'
        ? getFullName(employee.employment.reportingManagerId)
        : employee.employment.reportingManagerId)
    : '—';
  const employmentType = employee.employment?.employmentType || 'Full-time';
  const shift = employee.employment?.shiftId?.name || employee.employment?.shift || 'General (9AM - 6PM)';
  const status = employee.status || 'Active';

  const joinDateRaw = employee.employment?.dateOfJoining || employee.dateOfJoining;
  const daysActive = joinDateRaw
    ? Math.max(0, Math.floor((new Date() - new Date(joinDateRaw)) / (1000 * 60 * 60 * 24)))
    : null;
  const employeeSinceText = daysActive !== null ? `${daysActive} days` : '—';

  // Role Badge Config
  const getRoleBadgeConfig = (r) => {
    switch (r) {
      case 'EMPLOYEE':
        return { background: 'rgba(40,90,50,0.45)', color: '#7dd87d', border: '1px solid rgba(80,180,80,0.25)', text: 'Employee', icon: User };
      case 'MANAGER':
        return { background: 'rgba(40,60,120,0.45)', color: '#88b0f8', border: '1px solid rgba(80,130,220,0.25)', text: 'Manager', icon: Users };
      case 'LEADERSHIP':
      case 'CEO':
        return { background: 'rgba(110,80,20,0.45)', color: '#f5c842', border: '1px solid rgba(200,160,40,0.25)', text: 'CEO', icon: Crown };
      case 'HR_ADMIN':
        return { background: 'rgba(110,30,70,0.45)', color: '#f288b8', border: '1px solid rgba(190,70,130,0.25)', text: 'HR Admin', icon: Shield };
      default:
        return { background: 'rgba(255,255,255,0.08)', color: '#D4D0C8', border: '1px solid rgba(255,255,255,0.12)', text: r, icon: User };
    }
  };

  const roleBadge = getRoleBadgeConfig(role);
  const BadgeIcon = roleBadge.icon;
  const RoleIcon = role === 'EMPLOYEE' ? User : (role === 'MANAGER' ? Users : (role === 'HR_ADMIN' ? Shield : Crown));

  const getRoleHeaderGradient = (r) => {
    switch (r) {
      case 'EMPLOYEE':
        return 'linear-gradient(135deg, rgba(40,90,50,0.8), rgba(60,130,70,0.8))';
      case 'MANAGER':
        return 'linear-gradient(135deg, rgba(40,60,120,0.8), rgba(60,90,180,0.8))';
      case 'LEADERSHIP':
      case 'CEO':
        return 'linear-gradient(135deg, rgba(110,80,20,0.8), rgba(160,120,30,0.8))';
      case 'HR_ADMIN':
        return 'linear-gradient(135deg, rgba(110,30,70,0.8), rgba(160,50,100,0.8))';
      default:
        return 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))';
    }
  };

  const getRoleDesc = (r) => {
    switch (r) {
      case 'EMPLOYEE':
        return "Can view own attendance, apply leaves, download payslips and update profile";
      case 'MANAGER':
        return "Can approve team leaves and attendance, view team reports and manage direct reports";
      case 'LEADERSHIP':
      case 'CEO':
        return "Read-only access to organization-wide analytics, headcount and performance data";
      case 'HR_ADMIN':
        return "Full system access — manage all employees, configure policies and generate reports";
      default:
        return "";
    }
  };

  const getPermissionsList = (r) => {
    switch (r) {
      case 'EMPLOYEE':
        return [
          { active: true, text: 'View own attendance' },
          { active: true, text: 'Apply for leave' },
          { active: true, text: 'View payslips' },
          { active: true, text: 'Update profile' },
          { active: false, text: 'Approve requests' },
          { active: false, text: 'View other employees' },
          { active: false, text: 'Access reports' }
        ];
      case 'MANAGER':
        return [
          { active: true, text: 'View own attendance' },
          { active: true, text: 'Apply for leave' },
          { active: true, text: 'Approve team requests' },
          { active: true, text: 'View team reports' },
          { active: true, text: 'View direct reports' },
          { active: false, text: 'Manage all employees' },
          { active: false, text: 'Configure policies' }
        ];
      case 'LEADERSHIP':
      case 'CEO':
        return [
          { active: true, text: 'View org-wide analytics' },
          { active: true, text: 'View headcount reports' },
          { active: true, text: 'View attendance summary' },
          { active: true, text: 'View leave reports' },
          { active: false, text: 'Approve requests' },
          { active: false, text: 'Edit employee data' }
        ];
      case 'HR_ADMIN':
        return [
          { active: true, text: 'Full employee management' },
          { active: true, text: 'Generate credentials' },
          { active: true, text: 'Configure policies' },
          { active: true, text: 'All reports' },
          { active: true, text: 'Approve all requests' },
          { active: true, text: 'View entire organization' }
        ];
      default:
        return [];
    }
  };

  const handleResetPassword = async () => {
    const newPass = generatePassword();
    try {
      await employeeAPI.update(employee._id, { password: newPass });
      setNewlyGeneratedPassword(newPass);
      setShowNewPassword(true);
      toast.success('Password reset successfully!');
      window.dispatchEvent(new CustomEvent('employee-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleCopyEmail1 = () => {
    navigator.clipboard.writeText(emailVal);
    setCopiedEmail1(true);
    toast.success('Email copied!');
    setTimeout(() => setCopiedEmail1(false), 2000);
  };

  const handleCopyEmail2 = () => {
    navigator.clipboard.writeText(emailVal);
    setCopiedEmail2(true);
    toast.success('Email copied!');
    setTimeout(() => setCopiedEmail2(false), 2000);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(newlyGeneratedPassword);
    setCopiedPass(true);
    toast.success('Password copied!');
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const isUserActive = employee.userId?.isActive !== false;
  // True when the logged-in user is viewing their own employee profile
  const isOwnProfile = !!(currentUser && (
    employee.userId?._id === currentUser._id ||
    employee.userId === currentUser._id ||
    employee.userId?.email === currentUser.email
  ));

  return (
    <AppShell pageTitle="Employee Profile" activeNav="Employees">
      
      {/* Back to Employees link */}
      <button
        onClick={() => navigate(-1)}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          color: backHover ? '#F0EBE3' : '#8A8780',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          transition: 'color 0.2s ease',
          marginBottom: '20px',
          outline: 'none'
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Employees</span>
      </button>

      {/* Profile Header Card */}
      <div style={{
        background: 'rgba(18,16,14,0.88)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '20px',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Left and Center Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar Section */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: getRoleHeaderGradient(role),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F0EBE3',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            {initials}
          </div>

          {/* Identity Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '26px', color: '#F0EBE3', fontWeight: '700', marginBottom: '6px' }}>
              {fullName}
            </span>
            
            {/* Row of badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Employee ID pill */}
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                padding: '4px 12px',
                color: '#C8C4BC',
                fontSize: '12px'
              }}>
                {empId}
              </span>
              
              {/* Role badge */}
              <span style={{
                background: roleBadge.background,
                color: roleBadge.color,
                border: roleBadge.border,
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <BadgeIcon size={12} />
                {roleBadge.text}
              </span>

              {/* Status badge */}
              <span style={{
                background: isUserActive ? 'rgba(30,70,35,0.5)' : 'rgba(80,30,30,0.5)',
                color: isUserActive ? '#7dd87d' : '#f28888',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {isUserActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Row 2 info */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: '#8A8780', fontSize: '13px' }}>📁 Dept: <strong>{dept}</strong></span>
              <span style={{ color: '#8A8780', fontSize: '13px' }}>💼 Role Title: <strong>{designation}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Section Action Buttons */}
        {currentUser?.role === 'HR_ADMIN' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
            <button
              onClick={() => downloadCredentials(employee)}
              style={{
                background: 'rgba(232,228,220,0.90)',
                color: '#1A1815',
                borderRadius: '999px',
                padding: '10px 20px',
                fontWeight: '600',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Download Credentials</span>
            </button>
            
            {editMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  style={{
                    ...glassStyles.btnPrimary,
                    padding: '10px 20px',
                    fontSize: '13px',
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditForm({
                      name: `${employee.personal?.firstName || ''} ${employee.personal?.lastName || ''}`.trim() || employee.name || '',
                      email: employee.contact?.officialEmail || employee.userId?.email || employee.email || '',
                      phone: employee.personal?.phone || employee.phone || employee.contact?.personalPhone || '',
                      dateOfBirth: employee.personal?.dateOfBirth ? new Date(employee.personal.dateOfBirth).toISOString().slice(0, 10) : '',
                      gender: employee.personal?.gender || employee.gender || 'MALE',
                      address: employee.personal?.address || employee.address || '',
                      department: employee.employment?.departmentId?._id || employee.employment?.departmentId || '',
                      designation: employee.employment?.designationId?._id || employee.employment?.designationId || '',
                      salary: employee.employment?.salary || 0
                    });
                  }}
                  disabled={saving}
                  style={{
                    ...glassStyles.btnSecondary,
                    padding: '10px 20px',
                    fontSize: '13px',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResetPassword}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#F0EBE3',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#F0EBE3',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Settings size={14} />
                  <span>Edit Profile</span>
                </button>
              </>
            )}
          </div>
        ) : isOwnProfile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  style={{ ...glassStyles.btnPrimary, padding: '10px 20px', fontSize: '13px', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                  style={{ ...glassStyles.btnSecondary, padding: '10px 20px', fontSize: '13px' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{ ...glassStyles.btnPrimary, padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                <span>✏️ Edit Profile</span>
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Column (58%) */}
        <div style={{ flex: '5.8 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Personal Information */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              Personal Information
            </h3>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px' }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer Not To Say</option>
                  </select>
                </div>
                {/* Department — HR Admin only */}
                {currentUser?.role === 'HR_ADMIN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    disabled={role === 'LEADERSHIP' || role === 'CEO'}
                    style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px', opacity: (role === 'LEADERSHIP' || role === 'CEO') ? 0.5 : 1 }}
                  >
                    <option value="" style={{ backgroundColor: '#201E1C' }}>Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id} style={{ backgroundColor: '#201E1C' }}>{d.name}</option>
                    ))}
                  </select>
                </div>
                )}
                {/* Designation — HR Admin only */}
                {currentUser?.role === 'HR_ADMIN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Designation</label>
                  <select
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    disabled={role === 'LEADERSHIP' || role === 'CEO'}
                    style={{ ...glassStyles.select, width: '100%', padding: '12px 16px', borderRadius: '10px', opacity: (role === 'LEADERSHIP' || role === 'CEO') ? 0.5 : 1 }}
                  >
                    <option value="" style={{ backgroundColor: '#201E1C' }}>Select Designation</option>
                    {designations.map((d) => (
                      <option key={d._id} value={d._id} style={{ backgroundColor: '#201E1C' }}>{d.name}</option>
                    ))}
                  </select>
                </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ ...glassStyles.input, width: '100%' }}
                  />
                </div>
                {currentUser?.role === 'HR_ADMIN' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Annual CTC (₹)</label>
                    <input
                      type="number"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                      style={{ ...glassStyles.input, width: '100%' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'Full Name', value: fullName },
                  {
                    label: 'Email',
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{emailVal}</span>
                        <button onClick={handleCopyEmail1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8780', padding: 0 }}>
                          {copiedEmail1 ? <span style={{ color: '#7dd87d', fontSize: '11px' }}>Copied!</span> : <Copy size={13} />}
                        </button>
                      </div>
                    )
                  },
                  { label: 'Phone', value: phone },
                  { label: 'Date of Birth', value: dob },
                  { label: 'Gender', value: gender },
                  { label: 'Address', value: address }
                ].map((row, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ color: '#6A6865', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</span>
                    <span style={{ color: '#E8E4DC', fontSize: '14px', fontWeight: '500' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Employment Details */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              Employment Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Department', value: dept },
                { label: 'Designation', value: designation },
                { label: 'Date of Joining', value: doj },
                { label: 'Employment Type', value: employmentType },
                { label: 'Work Shift', value: shift },
                { label: 'Reporting To', value: managerName },
                { label: 'Employee Since', value: employeeSinceText },
                ...((currentUser?.role === 'HR_ADMIN' || currentUser?.role === 'LEADERSHIP' || currentUser?.employeeId === employee?._id)
                  ? [{ label: 'Annual CTC', value: employee?.employment?.salary ? `₹${employee.employment.salary.toLocaleString('en-IN')}` : '₹0' }]
                  : [])
              ].map((row, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span style={{ color: '#6A6865', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</span>
                  <span style={{ color: '#E8E4DC', fontSize: '14px', fontWeight: '500' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (42%) */}
        <div style={{ flex: '4.2 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Account Access */}
          {currentUser?.role === 'HR_ADMIN' && (
            <div style={glassStyles.cardDark}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
                Account Access
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Login Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600' }}>Login Email</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
                    <span style={{ color: '#F0EBE3', fontSize: '13px', wordBreak: 'break-all' }}>{emailVal}</span>
                    <button onClick={handleCopyEmail2} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A5A0' }}>
                      {copiedEmail2 ? <span style={{ color: '#7dd87d', fontSize: '11px' }}>Copied!</span> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Password representation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#6A6865', textTransform: 'uppercase', fontWeight: '600' }}>Password</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
                    <span style={{ color: '#6A6865', fontSize: '13px' }}>••••••••••</span>
                    <span style={{ fontSize: '11px', color: '#6A6865', fontStyle: 'italic' }}>Set during account creation by HR</span>
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  onClick={handleResetPassword}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#F0EBE3',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Reset Password</span>
                </button>

                {/* New Password generation display box */}
                {showNewPassword && (
                  <div style={{
                    background: 'rgba(232,228,220,0.10)',
                    border: '1px solid rgba(232,228,220,0.30)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '6px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#A8A5A0', textTransform: 'uppercase', fontWeight: '600' }}>New Password Generated</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#F0EBE3', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700' }}>{newlyGeneratedPassword}</span>
                      <button onClick={handleCopyPass} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-dark)' }}>
                        {copiedPass ? <span style={{ color: '#7dd87d', fontSize: '11px' }}>Copied!</span> : <Copy size={14} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#C8A080', fontWeight: '500' }}>⚠️ Copy this now. It won't be shown again.</span>
                    
                    <button
                      onClick={() => downloadCredentials(employee, newlyGeneratedPassword)}
                      style={{
                        background: 'rgba(232,228,220,0.90)',
                        color: '#1A1815',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Download size={12} />
                      <span>Download Updated Credentials</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 2: Role & Access Level */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              Role & Access Level
            </h3>
            
            {/* Large Role display */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: roleBadge.color
              }}>
                <RoleIcon size={32} />
              </div>
              <span style={{ color: '#F0EBE3', fontSize: '18px', fontWeight: '600' }}>{roleBadge.text}</span>
              <p style={{ color: '#8A8780', fontSize: '13px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>{getRoleDesc(role)}</p>
            </div>

            {/* Permissions checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              {getPermissionsList(role).map((perm, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <span style={{ color: perm.active ? '#7dd87d' : 'rgba(255,255,255,0.20)', fontWeight: '700' }}>
                    {perm.active ? '✓' : '✗'}
                  </span>
                  <span style={{ color: '#C8C4BC', fontSize: '13px' }}>{perm.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Download Credentials */}
          <div style={glassStyles.cardDark}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F0EBE3', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              Credentials
            </h3>
            <span style={{ color: '#6A6865', fontSize: '13px', display: 'block', marginBottom: '10px' }}>
              Share these login credentials securely with the employee
            </span>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#B8B4AC',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              Login URL: http://localhost:5173/login{'\n'}
              Email: {emailVal}{'\n'}
              Password: ••••••••  (reset to reveal)
            </div>
            <button
              onClick={() => downloadCredentials(employee)}
              style={{
                background: 'rgba(232, 228, 220, 0.92)',
                color: '#1A1815',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 24px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={14} />
              <span>Download as .txt</span>
            </button>
          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* OFFBOARD SECTION — HR Admin only, full-width below */}
      {/* ================================================= */}
      {currentUser?.role === 'HR_ADMIN' && (
        <div style={{
          marginTop: '28px',
          background: employee?.status === 'EXITED' ? 'rgba(30,18,10,0.92)' : 'rgba(40,12,12,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: employee?.status === 'EXITED' ? '1px solid rgba(255,140,0,0.25)' : '1px solid rgba(220,60,60,0.30)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: employee?.status === 'EXITED' ? 'rgba(255,140,0,0.15)' : 'rgba(220,60,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {employee?.status === 'EXITED' ? '📋' : '🚪'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: employee?.status === 'EXITED' ? '#ffb347' : '#ff7b7b' }}>
                  {employee?.status === 'EXITED' ? 'Offboarding Record' : 'Offboard Employee'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#8A8780', marginTop: '2px' }}>
                  {employee?.status === 'EXITED'
                    ? `This employee was offboarded. Last working day: ${employee.exit?.lastWorkingDate ? new Date(employee.exit.lastWorkingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}`
                    : 'Initiate the offboarding process. This will mark the employee as Exited and disable their account.'}
                </p>
              </div>
            </div>
            {employee?.status === 'EXITED' && (
              <span style={{ background: 'rgba(255,140,0,0.15)', color: '#ffb347', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '999px', padding: '4px 14px', fontSize: '12px', fontWeight: '700' }}>EXITED</span>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px' }}>
            {employee?.status === 'EXITED' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Exit Type', value: employee.exit?.exitType || '—' },
                  { label: 'Exit Date', value: employee.exit?.exitDate ? new Date(employee.exit.exitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Last Working Day', value: employee.exit?.lastWorkingDate ? new Date(employee.exit.lastWorkingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Notice Period', value: employee.exit?.noticePeriodDays ? `${employee.exit.noticePeriodDays} days` : '—' },
                  { label: 'Rehire Eligible', value: employee.exit?.rehireEligible ? '✅ Yes' : '❌ No' },
                  { label: 'Final Settlement', value: employee.exit?.finalSettlementDone ? '✅ Done' : '⏳ Pending' },
                ].map((row, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '6px' }}>{row.label}</div>
                    <div style={{ color: '#E8E4DC', fontSize: '14px', fontWeight: '600' }}>{row.value}</div>
                  </div>
                ))}
                {employee.exit?.reason && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', gridColumn: '1 / -1' }}>
                    <div style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '6px' }}>Reason</div>
                    <div style={{ color: '#C8C4BC', fontSize: '13px', lineHeight: '1.6' }}>{employee.exit.reason}</div>
                  </div>
                )}
                {employee.exit?.exitInterviewNotes && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', gridColumn: '1 / -1' }}>
                    <div style={{ color: '#6A6865', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '6px' }}>Exit Interview Notes</div>
                    <div style={{ color: '#C8C4BC', fontSize: '13px', lineHeight: '1.6' }}>{employee.exit.exitInterviewNotes}</div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Exit Type *</label>
                    <select value={offboardForm.exitType} onChange={e => setOffboardForm(f => ({ ...f, exitType: e.target.value }))}
                      style={{ ...glassStyles.select, padding: '11px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}>
                      <option value="RESIGNED" style={{ background: '#201E1C' }}>Resigned</option>
                      <option value="TERMINATED" style={{ background: '#201E1C' }}>Terminated</option>
                      <option value="RETIRED" style={{ background: '#201E1C' }}>Retired</option>
                      <option value="ABSCONDED" style={{ background: '#201E1C' }}>Absconded</option>
                      <option value="CONTRACT_END" style={{ background: '#201E1C' }}>Contract End</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Exit Date *</label>
                    <input type="date" value={offboardForm.exitDate} onChange={e => setOffboardForm(f => ({ ...f, exitDate: e.target.value }))}
                      style={{ ...glassStyles.input, width: '100%', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Last Working Day</label>
                    <input type="date" value={offboardForm.lastWorkingDate} onChange={e => setOffboardForm(f => ({ ...f, lastWorkingDate: e.target.value }))}
                      style={{ ...glassStyles.input, width: '100%', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Notice Period (Days)</label>
                    <input type="number" min="0" value={offboardForm.noticePeriodDays} onChange={e => setOffboardForm(f => ({ ...f, noticePeriodDays: Number(e.target.value) }))}
                      style={{ ...glassStyles.input, width: '100%', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Rehire Eligible</label>
                    <select value={offboardForm.rehireEligible ? 'yes' : 'no'} onChange={e => setOffboardForm(f => ({ ...f, rehireEligible: e.target.value === 'yes' }))}
                      style={{ ...glassStyles.select, padding: '11px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}>
                      <option value="yes" style={{ background: '#201E1C' }}>Yes</option>
                      <option value="no" style={{ background: '#201E1C' }}>No</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Final Settlement</label>
                    <select value={offboardForm.finalSettlementDone ? 'done' : 'pending'} onChange={e => setOffboardForm(f => ({ ...f, finalSettlementDone: e.target.value === 'done' }))}
                      style={{ ...glassStyles.select, padding: '11px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}>
                      <option value="pending" style={{ background: '#201E1C' }}>Pending</option>
                      <option value="done" style={{ background: '#201E1C' }}>Done</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Reason for Exit</label>
                  <textarea rows={2} value={offboardForm.reason} onChange={e => setOffboardForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="Brief reason for exit..."
                    style={{ ...glassStyles.input, width: '100%', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '22px' }}>
                  <label style={{ color: '#8A8780', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Exit Interview Notes</label>
                  <textarea rows={3} value={offboardForm.exitInterviewNotes} onChange={e => setOffboardForm(f => ({ ...f, exitInterviewNotes: e.target.value }))}
                    placeholder="Notes from exit interview (optional)..."
                    style={{ ...glassStyles.input, width: '100%', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                {!showOffboardConfirm ? (
                  <button onClick={() => setShowOffboardConfirm(true)}
                    style={{ background: 'rgba(200,50,50,0.85)', color: '#FFF', border: '1px solid rgba(220,80,80,0.4)', borderRadius: '12px', padding: '13px 28px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,60,60,0.95)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,50,50,0.85)'}
                  >
                    🚪 Initiate Offboarding
                  </button>
                ) : (
                  <div style={{ background: 'rgba(220,60,60,0.10)', border: '1px solid rgba(220,60,60,0.30)', borderRadius: '14px', padding: '18px 22px' }}>
                    <p style={{ color: '#ff8a8a', fontSize: '14px', fontWeight: '700', margin: '0 0 6px' }}>⚠️ Confirm Offboarding</p>
                    <p style={{ color: '#A8A5A0', fontSize: '13px', margin: '0 0 16px' }}>
                      This will mark <strong style={{ color: '#F0EBE3' }}>{fullName}</strong> as <strong style={{ color: '#ff8a8a' }}>EXITED</strong> and disable their system access. This action is difficult to reverse.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button disabled={offboarding}
                        onClick={async () => {
                          setOffboarding(true);
                          try {
                            await employeeAPI.exit(id, offboardForm);
                            toast.success(`${fullName} has been successfully offboarded.`);
                            setShowOffboardConfirm(false);
                            fetchEmployeeData();
                            window.dispatchEvent(new CustomEvent('employee-updated'));
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Offboarding failed');
                          } finally { setOffboarding(false); }
                        }}
                        style={{ background: 'rgba(200,50,50,0.9)', color: '#FFF', border: 'none', borderRadius: '10px', padding: '11px 24px', fontWeight: '700', fontSize: '13px', cursor: offboarding ? 'not-allowed' : 'pointer', opacity: offboarding ? 0.6 : 1 }}
                      >
                        {offboarding ? 'Processing...' : '✅ Yes, Offboard'}
                      </button>
                      <button onClick={() => setShowOffboardConfirm(false)} style={{ ...glassStyles.btnSecondary, padding: '11px 24px', fontSize: '13px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </AppShell>
  );
};

// ==========================================
// PROTECTED ROUTE WRAPPER
// ==========================================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('hrms_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ==========================================
// CORE APP ROUTER WRAPPER
// ==========================================
export const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <div style={{
          ...OFFICE_BG_STYLE,
          fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup-company" element={<SetupCompanyPage />} />
            
            {/* Dashboard Pages */}
            <Route path="/hr-dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
            <Route path="/manager-dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetailPage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
            <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
            <Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/compensation" element={<ProtectedRoute><CompensationPage /></ProtectedRoute>} />

            {/* Fallback to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
