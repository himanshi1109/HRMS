import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leaveService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { 
  CalendarDays, 
  Clock, 
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Check,
  X,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LeaveRequests = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = ['HR_ADMIN', 'MANAGER'].includes(user?.role);
  const [loading, setLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  
  const [balances, setBalances] = useState({ CL: 8, SL: 6, EL: 14 });
  const [myRequests, setMyRequests] = useState([
    { id: 1, leaveType: 'Casual Leave', startDate: '2026-06-15', endDate: '2026-06-16', durationDays: 2, reason: 'Family function', status: 'APPROVED' },
    { id: 2, leaveType: 'Sick Leave', startDate: '2026-05-10', endDate: '2026-05-10', durationDays: 1, reason: 'High fever', status: 'COMPLETED' },
    { id: 3, leaveType: 'Earned Leave', startDate: '2026-07-20', endDate: '2026-07-24', durationDays: 5, reason: 'Annual vacation', status: 'PENDING' },
    { id: 4, leaveType: 'Casual Leave', startDate: '2026-04-12', endDate: '2026-04-12', durationDays: 1, reason: 'Personal work', status: 'APPROVED' },
    { id: 5, leaveType: 'Sick Leave', startDate: '2026-03-08', endDate: '2026-03-09', durationDays: 2, reason: 'Dental appointment', status: 'COMPLETED' },
  ]);

  const [teamRequests, setTeamRequests] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leaveTypeCode: 'CL',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
    },
  });

  const loadLeaveDetails = async () => {
    try {
      const balRes = await leaveService.getMyBalances();
      if (balRes?.success && balRes?.data) {
        const mapped = {};
        balRes.data.forEach((b) => {
          mapped[b.leaveTypeId?.code || b.code || 'CL'] = b.currentBalance || b.balance;
        });
        setBalances((prev) => ({ ...prev, ...mapped }));
      }

      const myRes = await leaveService.getMyRequests();
      if (myRes?.success && Array.isArray(myRes?.data)) {
        setMyRequests(myRes.data);
      }

      if (isManagerOrAdmin) {
        const teamRes = await leaveService.getTeamRequests();
        if (teamRes?.success && Array.isArray(teamRes?.data)) {
          setTeamRequests(teamRes.data);
        }
      }
    } catch (err) {
      console.error('Error loading leave details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveDetails();
  }, [user]);

  const onSubmitLeave = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        leaveTypeCode: formData.leaveTypeCode,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        isHalfDay: formData.isHalfDay,
      };

      const response = await leaveService.applyLeave(payload);
      if (response?.success) {
        toast.success(response.message || 'Leave applied successfully!');
        reset();
        setIsApplyOpen(false);
        await loadLeaveDetails();
      }
    } catch (err) {
      console.error('Apply leave error:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', Requests: 4, Approved: 3 },
    { name: 'Feb', Requests: 5, Approved: 4 },
    { name: 'Mar', Requests: 3, Approved: 3 },
    { name: 'Apr', Requests: 8, Approved: 7 },
    { name: 'May', Requests: 12, Approved: 10 },
    { name: 'Jun', Requests: 10, Approved: 8 },
  ];

  const tableColumns = [
    {
      header: 'Type',
      accessor: 'leaveType',
      render: (val, row) => (
        <span className="font-semibold text-text-primary">
          {typeof val === 'object' ? val.name : val}
        </span>
      ),
    },
    {
      header: 'Duration',
      accessor: 'startDate',
      render: (_, row) => `${formatDate(row.startDate)} to ${formatDate(row.endDate)}`,
    },
    {
      header: 'Days',
      accessor: 'durationDays',
      render: (val) => `${val} ${val > 1 ? 'days' : 'day'}`,
    },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge status={val} />,
    },
  ];

  const donutData = [
    { name: 'Casual Leave', value: balances.CL || 8 },
    { name: 'Sick Leave', value: balances.SL || 6 },
    { name: 'Earned Leave', value: balances.EL || 14 },
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Header section */}
          <div className="flex justify-between items-center bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow select-none">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Leave Management</h2>
              <p className="text-xs text-text-secondary mt-1">Submit applications and track balance allotments</p>
            </div>
            <button 
              onClick={() => setIsApplyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-primary-purple hover:bg-light-purple text-text-primary transition-all cursor-pointer shadow-lg shadow-primary-purple/20"
            >
              <Plus size={14} />
              <span>Apply Leave</span>
            </button>
          </div>

          {/* Card 2: Leave Analytics Area Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Leave Requests Trend</h3>
              <span className="text-xs text-text-muted">Target Ratios</span>
            </div>
            <AreaChart
              data={chartData}
              xKey="name"
              series={[
                { key: 'Requests', name: 'Leave Applications', color: '#8B7B6F' },
                { key: 'Approved', name: 'Approved Requests', color: 'rgba(255, 255, 255, 0.25)' },
              ]}
              height={300}
            />
          </div>

          {/* Card 3: Recent Leave Requests Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">My Leave Applications</h3>
            <Table columns={tableColumns} data={myRequests} />
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Leave Balances Donut Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Allotment Distribution</span>
              <span className="text-xs text-text-muted">Direct Balance</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Credit Ratio
                </span>
                <span className="text-xs text-text-secondary">Summary</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C', '#8B7B6F']}
                height={160}
                centerText={`${(balances.CL || 8) + (balances.SL || 6) + (balances.EL || 14)}`}
                centerSubtext="Total Days Left"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Earned: {balances.EL || 14}</span>
                <span>Casual: {balances.CL || 8}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Recent Approvals List */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Recent Leave Approvals</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {myRequests.slice(0, 6).map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-border-color text-primary-purple group-hover:bg-primary-purple group-hover:text-text-primary transition-all shadow-purple-glow">
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{item.leaveType}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{formatDate(item.startDate)} • {item.durationDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={item.status} />
                    <ChevronRight size={14} className="text-text-muted group-hover:text-primary-purple transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6 & 7: 2 Leave balance cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Sick Leave Balance"
              value={`${balances.SL || 6} days`}
              trend="Available SL"
              trendDirection="stable"
            />
            <StatCard
              title="Casual Leave Balance"
              value={`${balances.CL || 8} days`}
              trend="Available CL"
              trendDirection="stable"
            />
          </div>

        </div>

      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => {
          setIsApplyOpen(false);
          reset();
        }}
        title="Apply for Workspace Leave"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setIsApplyOpen(false);
                reset();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-border-color text-text-primary hover:bg-card-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmitLeave)}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary-purple hover:bg-light-purple text-text-primary shadow-lg shadow-primary-purple/20 transition-all cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        }
      >
        <form className="space-y-4 text-text-primary select-none">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Leave Type</label>
            <select
              {...register('leaveTypeCode', { required: 'Leave type is required' })}
              className="w-full px-3 py-2 rounded-lg bg-dark-navy border border-border-color text-xs focus:outline-none focus:border-primary-purple text-text-primary"
            >
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
              <option value="EL">Earned Leave (EL)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Start Date</label>
              <input
                {...register('startDate', { required: 'Start date is required' })}
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-dark-navy border border-border-color text-xs focus:outline-none focus:border-primary-purple text-text-primary"
              />
              {errors.startDate && <span className="text-[10px] text-pink-accent block">{errors.startDate.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">End Date</label>
              <input
                {...register('endDate', { required: 'End date is required' })}
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-dark-navy border border-border-color text-xs focus:outline-none focus:border-primary-purple text-text-primary"
              />
              {errors.endDate && <span className="text-[10px] text-pink-accent block">{errors.endDate.message}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              {...register('isHalfDay')}
              type="checkbox"
              id="isHalfDay"
              className="accent-primary-purple"
            />
            <label htmlFor="isHalfDay" className="text-xs font-medium text-text-secondary select-none cursor-pointer">
              Apply as half-day leave
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Reason / Details</label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={3}
              placeholder="Provide a valid explanation for leave..."
              className="w-full px-3 py-2 rounded-lg bg-dark-navy border border-border-color text-xs focus:outline-none focus:border-primary-purple text-text-primary placeholder:text-text-muted"
            />
            {errors.reason && <span className="text-[10px] text-pink-accent block">{errors.reason.message}</span>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
