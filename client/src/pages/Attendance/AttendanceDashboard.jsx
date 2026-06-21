import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import { formatDate } from '../../utils/formatters';
import { 
  CalendarDays, 
  Clock, 
  Search,
  Filter,
  Users,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceDashboard = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isManagerOrAdmin = isHR || isManager;

  const [activeView, setActiveView] = useState('logs'); // 'logs' or 'summary'
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters state
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [status, setStatus] = useState('');

  const [departments, setDepartments] = useState([]);

  // Stats summary metrics
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
  });

  // Fetch departments for filtering
  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const response = await api.get('/departments');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    if (isManagerOrAdmin) {
      fetchDeps();
    }
  }, [user]);

  // Load dashboard / metrics
  const loadMetrics = async () => {
    try {
      const response = await attendanceService.getDashboard();
      if (response?.success && response?.data) {
        setMetrics({
          totalEmployees: response.data.totalEmployees || 0,
          presentCount: response.data.present || 0,
          absentCount: response.data.absent || 0,
          lateCount: response.data.late || 0,
        });
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  // Fetch attendance records (Logs)
  const loadLogs = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentId: departmentId || undefined,
        employeeName: employeeName || undefined,
        status: status || undefined,
      };

      let response;
      if (isHR) {
        response = await attendanceService.getAllAttendance(params);
      } else if (isManager) {
        response = await attendanceService.getTeamAttendance(params);
      } else {
        response = await attendanceService.getMyAttendance({
          month: new Date().toISOString().slice(0, 7) // Current month for employee
        });
      }

      if (response?.success) {
        if (isHR || isManager) {
          setRecords(response.data?.docs || response.data || []);
          setTotalRecords(response.data?.totalDocs || response.data?.length || 0);
        } else {
          // Employee direct array response
          setRecords(response.data || []);
          setTotalRecords(response.data?.length || 0);
        }
      }
    } catch (err) {
      console.error('Error loading attendance logs:', err);
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance summaries per employee
  const loadSummaries = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentId: departmentId || undefined,
        employeeName: employeeName || undefined,
      };
      const response = await attendanceService.getAttendanceSummary(params);
      if (response?.success && Array.isArray(response.data)) {
        setSummaries(response.data);
      }
    } catch (err) {
      console.error('Error loading summaries:', err);
      toast.error('Failed to load summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManagerOrAdmin) {
      loadMetrics();
    }
  }, [user]);

  useEffect(() => {
    if (activeView === 'logs') {
      loadLogs(page);
    } else {
      loadSummaries();
    }
  }, [page, activeView, user]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    if (activeView === 'logs') {
      loadLogs(1);
    } else {
      loadSummaries();
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDepartmentId('');
    setEmployeeName('');
    setStatus('');
    setPage(1);
    setTimeout(() => {
      if (activeView === 'logs') {
        loadLogs(1);
      } else {
        loadSummaries();
      }
    }, 0);
  };

  // Color coding status function
  const renderStatusBadge = (statusVal) => {
    const s = (statusVal || '').toUpperCase();
    if (s === 'PRESENT' || s === 'REGULARIZED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-500/10 text-green-500 border-green-500/20">
          {s}
        </span>
      );
    }
    if (s === 'ABSENT') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-500/10 text-red-500 border-red-500/20">
          {s}
        </span>
      );
    }
    if (s === 'LATE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-500/10 text-orange-500 border-orange-500/20">
          {s}
        </span>
      );
    }
    if (s === 'HALF_DAY') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          HALF DAY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-indigo-muted text-stardust-text border-indigo-border">
        {s.replace(/_/g, ' ')}
      </span>
    );
  };

  const logColumns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (val, row) => row.employeeId?.employeeId || val?.employeeId || '-'
    },
    {
      header: 'Employee Name',
      accessor: 'employeeName',
      render: (_, row) => {
        const emp = row.employeeId || {};
        const first = emp.personal?.firstName || '';
        const last = emp.personal?.lastName || '';
        return `${first} ${last}`.trim() || 'Employee';
      }
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (_, row) => {
        const emp = row.employeeId || {};
        return emp.employment?.departmentId?.name || '-';
      }
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => formatDate(val, 'dd MMM yyyy')
    },
    {
      header: 'Punch In',
      accessor: 'punchIn',
      render: (val) => val ? formatDate(val, 'hh:mm:ss a') : '--'
    },
    {
      header: 'Punch Out',
      accessor: 'punchOut',
      render: (val) => val ? formatDate(val, 'hh:mm:ss a') : '--'
    },
    {
      header: 'Total Hours',
      accessor: 'workingMinutes',
      render: (val) => val ? `${(val / 60).toFixed(2)} hrs` : '0.00 hrs'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => renderStatusBadge(val)
    }
  ];

  const summaryColumns = [
    {
      header: 'Employee ID',
      accessor: 'empIdCode'
    },
    {
      header: 'Employee Name',
      accessor: 'employeeName'
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Total Days Checked',
      accessor: 'summary',
      render: (val) => val?.totalDays || 0
    },
    {
      header: 'Present Days',
      accessor: 'summary',
      render: (val) => <span className="text-green-500 font-semibold">{val?.present || 0}</span>
    },
    {
      header: 'Absent Days',
      accessor: 'summary',
      render: (val) => <span className="text-red-500 font-semibold">{val?.absent || 0}</span>
    },
    {
      header: 'Late Days',
      accessor: 'summary',
      render: (val) => <span className="text-orange-500 font-semibold">{val?.late || 0}</span>
    },
    {
      header: 'Half Days',
      accessor: 'summary',
      render: (val) => <span className="text-yellow-500 font-semibold">{val?.halfDay || 0}</span>
    },
    {
      header: 'Total Hours Worked',
      accessor: 'summary',
      render: (val) => `${val?.totalHours || 0} hrs`
    }
  ];

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow select-none">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Attendance Dashboard</h2>
          <p className="text-xs text-text-secondary mt-1">
            {isHR ? 'HR Administrative View' : isManager ? 'Team Manager Scoped View' : 'My Personal Attendance Logs'}
          </p>
        </div>
        
        {isManagerOrAdmin && (
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => { setActiveView('logs'); setPage(1); }}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'logs'
                  ? 'bg-primary-purple border-primary-purple text-text-primary shadow-purple-glow'
                  : 'bg-card-elevated border-border-color text-text-secondary hover:text-text-primary'
              }`}
            >
              Attendance Logs
            </button>
            <button
              onClick={() => { setActiveView('summary'); setPage(1); }}
              className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'summary'
                  ? 'bg-primary-purple border-primary-purple text-text-primary shadow-purple-glow'
                  : 'bg-card-elevated border-border-color text-text-secondary hover:text-text-primary'
              }`}
            >
              Attendance Summaries
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards (For Admin / Manager only) */}
      {isManagerOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title={isHR ? 'Total Employees' : 'Total Direct Reports'}
            value={metrics.totalEmployees}
            trend="Active Profiles"
            trendDirection="stable"
          />
          <StatCard
            title="Present Today"
            value={metrics.presentCount}
            trend={`${((metrics.presentCount / (metrics.totalEmployees || 1)) * 100).toFixed(1)}% Present`}
            trendDirection="up"
          />
          <StatCard
            title="Absent Today"
            value={metrics.absentCount}
            trend="Unscheduled / Off"
            trendDirection="down"
          />
          <StatCard
            title="Late Today"
            value={metrics.lateCount}
            trend="Punched after start time"
            trendDirection="stable"
          />
        </div>
      )}

      {/* Filter panel (For Admin / Manager only) */}
      {isManagerOrAdmin && (
        <form onSubmit={handleFilterSubmit} className="bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary border-b border-border-color pb-2">
            <Filter size={16} className="text-primary-purple" />
            <span>Search & Filter Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Start Date */}
            <div>
              <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-dark-navy border border-border-color text-xs text-text-primary focus:outline-none focus:border-primary-purple transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-dark-navy border border-border-color text-xs text-text-primary focus:outline-none focus:border-primary-purple transition-all"
              />
            </div>

            {/* Department (HR view only or managers with multiple departments) */}
            <div>
              <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-dark-navy border border-border-color text-xs text-text-primary focus:outline-none focus:border-primary-purple transition-all"
              >
                <option value="">All Departments</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>{dep.name}</option>
                ))}
              </select>
            </div>

            {/* Employee Name */}
            <div>
              <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Employee Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name..."
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded bg-dark-navy border border-border-color text-xs text-text-primary focus:outline-none focus:border-primary-purple transition-all"
                />
                <Search size={12} className="absolute left-2.5 top-3 text-text-muted" />
              </div>
            </div>

            {/* Status (Log View only) */}
            <div>
              <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Attendance Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={activeView === 'summary'}
                className="w-full px-3 py-2 rounded bg-dark-navy border border-border-color text-xs text-text-primary focus:outline-none focus:border-primary-purple transition-all disabled:opacity-50"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LATE">LATE</option>
                <option value="HALF_DAY">HALF DAY</option>
                <option value="WEEKLY_OFF">WEEKLY OFF</option>
                <option value="HOLIDAY">HOLIDAY</option>
                <option value="ON_LEAVE">ON LEAVE</option>
                <option value="REGULARIZED">REGULARIZED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-color/40">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-1.5 rounded bg-card-elevated border border-border-color text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-primary-purple border border-primary-purple text-xs font-semibold text-text-primary hover:bg-opacity-95 transition-all cursor-pointer shadow-purple-glow"
            >
              Search Logs
            </button>
          </div>
        </form>
      )}

      {/* Attendance Grid / Register */}
      <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow select-none">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            {activeView === 'logs' ? 'Attendance Punch Clock Register' : 'Muster Summary Registers'}
          </h3>
          <span className="text-xs text-text-muted">Total records: {totalRecords}</span>
        </div>

        {activeView === 'logs' ? (
          <Table
            columns={logColumns}
            data={records}
            pagination={isManagerOrAdmin ? {
              currentPage: page,
              totalPages: totalPages || 1,
              onPageChange: (newPage) => setPage(newPage)
            } : null}
          />
        ) : (
          <Table
            columns={summaryColumns}
            data={summaries}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
