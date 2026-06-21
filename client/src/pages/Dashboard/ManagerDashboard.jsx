import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mssService } from '../../services/mssService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { formatDate } from '../../utils/formatters';
import { 
  Users, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  ChevronRight,
  CalendarCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    present: 0,
    absent: 0,
    pending: 0,
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch dashboard stats
        const dashRes = await mssService.getDashboard();
        if (dashRes?.success && dashRes?.data) {
          const { teamSize, presentCount, pendingApprovals } = dashRes.data;
          setTeamStats({
            totalMembers: teamSize || 0,
            present: presentCount || 0,
            absent: (teamSize || 0) - (presentCount || 0),
            pending: (pendingApprovals?.leave || 0) + (pendingApprovals?.regularization || 0),
          });
        }

        // Fetch real team members
        const teamRes = await mssService.getTeam();
        if (teamRes?.success && Array.isArray(teamRes?.data)) {
          setTeamMembers(teamRes.data);
        }

        // Fetch real pending approvals
        const approvalsRes = await mssService.getApprovals();
        if (approvalsRes?.success && Array.isArray(approvalsRes?.data)) {
          const pending = approvalsRes.data
            .filter(r => r.status === 'PENDING' || r.currentStatus === 'PENDING')
            .map(r => ({
              id: r._id,
              name: r.requestedBy?.personal?.firstName
                ? `${r.requestedBy.personal.firstName} ${r.requestedBy.personal.lastName}`
                : (r.employeeId?.personal?.firstName
                    ? `${r.employeeId.personal.firstName} ${r.employeeId.personal.lastName}`
                    : 'Employee'),
              type: r.leaveType || r.requestType || 'Leave',
              duration: r.duration ? `${r.duration} day(s)` : '-',
              date: r.startDate ? formatDate(r.startDate, 'dd MMM yyyy') : '-',
              status: 'PENDING',
            }));
          setPendingLeaves(pending);
        }
      } catch (err) {
        console.error('Error fetching manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'Approved') {
        await mssService.approveRequest(id, 'Approved by Manager');
      } else {
        await mssService.rejectRequest(id, 'Rejected by Manager');
      }
      toast.success(`Request ${action} successfully`);
      setPendingLeaves(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      toast.error(`Failed to ${action.toLowerCase()} the request`);
    }
  };

  const chartData = [
    { name: 'Jan', Hours: 42, Target: 45 },
    { name: 'Feb', Hours: 43, Target: 45 },
    { name: 'Mar', Hours: 46.5, Target: 45 },
    { name: 'Apr', Hours: 44, Target: 45 },
    { name: 'May', Hours: 45.5, Target: 45 },
    { name: 'Jun', Hours: 46.5, Target: 45 },
  ];

  const tableColumns = [
    {
      header: 'Applicant',
      accessor: 'name',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-semibold text-text-primary">{val}</span>
        </div>
      )
    },
    { header: 'Type', accessor: 'type' },
    { header: 'Duration', accessor: 'duration' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (val) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAction(val, 'Approved')}
            className="p-1 rounded bg-primary-purple/10 text-light-purple hover:bg-primary-purple hover:text-text-primary transition-all cursor-pointer"
          >
            <CheckCircle2 size={15} />
          </button>
          <button 
            onClick={() => handleAction(val, 'Rejected')}
            className="p-1 rounded bg-pink-accent/10 text-pink-accent hover:bg-pink-accent hover:text-text-primary transition-all cursor-pointer"
          >
            <XCircle size={15} />
          </button>
        </div>
      )
    }
  ];

  const donutData = [
    { name: 'Present', value: teamStats.present },
    { name: 'Absent', value: teamStats.absent }
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Greeting Header */}
          <div className="relative overflow-hidden bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow flex flex-col md:flex-row justify-between items-start md:items-center min-h-[100px] select-none">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                Good morning, {user?.name?.split(' ')[0] || 'Manager'}
              </h2>
              <p className="text-xs text-text-secondary mt-1">Direct team occupancy and pending operations roster</p>
            </div>
            <div className="mt-4 md:mt-0 text-right bg-dark-navy p-2.5 rounded-lg border border-border-color">
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Date</span>
              <span className="text-xs font-semibold text-text-primary block mt-0.5">
                {formatDate(new Date(), 'dd MMM yyyy')}
              </span>
            </div>
          </div>

          {/* Card 2: Team Attendance Compliance Area Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Avg Weekly Work Hours</h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary">
                <span>June 2026</span>
              </div>
            </div>
            <AreaChart
              data={chartData}
              xKey="name"
              series={[
                { key: 'Hours', name: 'Work Hours', color: '#8B7B6F' },
                { key: 'Target', name: 'Target Hours', color: 'rgba(255, 255, 255, 0.25)' },
              ]}
              height={300}
            />
          </div>

          {/* Card 3: Team Approvals Queue Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Pending Team Actions</h3>
            <Table columns={tableColumns} data={pendingLeaves} />
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Attendance Splits Donut Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Attendance Distribution</span>
              <span className="text-xs text-text-muted">Direct Reports</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Daily Split
                </span>
                <span className="text-xs text-text-secondary">Today</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C']}
                height={160}
                centerText={`${Math.round((teamStats.present / (teamStats.totalMembers || 1)) * 100)}%`}
                centerSubtext="Present"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Present: {teamStats.present}</span>
                <span>Absent: {teamStats.absent}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Direct Reports List */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Direct Reports Directory</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {teamMembers.length === 0 && !loading && (
                <p className="text-sm text-text-muted text-center py-6">No direct reports found.</p>
              )}
              {teamMembers.map((member, idx) => {
                const firstName = member.personal?.firstName || '';
                const lastName = member.personal?.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim() || 'Employee';
                const designation = member.employment?.designationId?.name || member.employment?.designationName || 'Staff';
                const memberStatus = member.status || 'ACTIVE';
                const employeeMongoId = member._id;
                return (
                  <div 
                    key={member._id || idx}
                    onClick={() => navigate(`/employees/${employeeMongoId}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName} size="sm" />
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary-purple transition-colors">{fullName}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{designation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={memberStatus} />
                      <ChevronRight size={14} className="text-text-muted group-hover:text-primary-purple transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 6 & 7: 2 Metric Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Pending Approvals"
              value={teamStats.pending}
              trend="Requires Action"
              trendDirection="up"
            />
            <StatCard
              title="Avg Weekly Hours"
              value="46.5"
              trend="+1.5% target"
              trendDirection="up"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
