import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { essService } from '../../services/essService';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/common/StatCard';
import HeatmapChart from '../../components/charts/HeatmapChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { 
  Play, 
  Square, 
  CalendarDays, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [punchStatus, setPunchStatus] = useState(null); // 'IN', 'OUT' or null
  const [punchRecord, setPunchRecord] = useState(null);

  const [leaveBalances, setLeaveBalances] = useState([
    { name: 'Casual Leave', code: 'CL', balance: 8, max: 12 },
    { name: 'Sick Leave', code: 'SL', balance: 6, max: 10 },
    { name: 'Earned Leave', code: 'EL', balance: 14, max: 18 },
  ]);

  const [holidays, setHolidays] = useState([
    { name: 'Independence Day', date: new Date('2026-08-15'), type: 'National' },
    { name: 'Gandhi Jayanti', date: new Date('2026-10-02'), type: 'National' },
    { name: 'Christmas Day', date: new Date('2026-12-25'), type: 'Gazetted' },
    { name: 'New Year Day', date: new Date('2027-01-01'), type: 'Restricted' },
    { name: 'Makar Sankranti', date: new Date('2027-01-14'), type: 'Restricted' },
    { name: 'Republic Day', date: new Date('2027-01-26'), type: 'National' },
  ]);

  const [myLeaves, setMyLeaves] = useState([
    { _id: '1', leaveType: 'Casual Leave', startDate: '2026-06-15', endDate: '2026-06-16', durationDays: 2, status: 'APPROVED' },
    { _id: '2', leaveType: 'Sick Leave', startDate: '2026-05-10', endDate: '2026-05-10', durationDays: 1, status: 'COMPLETED' },
    { _id: '3', leaveType: 'Earned Leave', startDate: '2026-07-20', endDate: '2026-07-24', durationDays: 5, status: 'PENDING' },
    { _id: '4', leaveType: 'Casual Leave', startDate: '2026-04-12', endDate: '2026-04-12', durationDays: 1, status: 'APPROVED' },
    { _id: '5', leaveType: 'Sick Leave', startDate: '2026-03-08', endDate: '2026-03-09', durationDays: 2, status: 'COMPLETED' },
  ]);

  const [heatmapData, setHeatmapData] = useState([
    { date: '2026-06-12', hours: 8.5 },
    { date: '2026-06-11', hours: 8.0 },
    { date: '2026-06-10', hours: 9.0 },
    { date: '2026-06-09', hours: 4.0 },
    { date: '2026-06-08', hours: 8.2 },
    { date: '2026-06-05', hours: 7.5 },
    { date: '2026-06-04', hours: 9.5 },
    { date: '2026-06-03', hours: 10.0 },
  ]);

  const loadData = async () => {
    try {
      const essDash = await essService.getDashboard();
      if (essDash?.success && essDash?.data) {
        const { todayRecord, balances, upcomingHolidays, recentRequests, heatmap } = essDash.data;
        if (todayRecord) {
          setPunchRecord(todayRecord);
          setPunchStatus(todayRecord.punchOutTime ? 'OUT' : todayRecord.punchInTime ? 'IN' : null);
        }
        if (balances) {
          setLeaveBalances(balances.map(b => ({
            name: b.leaveTypeId?.name || b.name,
            code: b.leaveTypeId?.code || b.code,
            balance: b.currentBalance || b.balance,
            max: b.maxAllowance || b.max || 12,
          })));
        }
        if (upcomingHolidays && upcomingHolidays.length > 0) {
          setHolidays(upcomingHolidays.map(h => ({ name: h.name, date: new Date(h.date), type: h.type || 'Official' })));
        }
        if (recentRequests && recentRequests.length > 0) {
          setMyLeaves(recentRequests);
        }
        if (heatmap && heatmap.length > 0) {
          setHeatmapData(heatmap);
        }
      }
    } catch (err) {
      console.error('Error fetching employee dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePunch = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.punch({
        latitude: 12.9716,
        longitude: 77.5946,
        deviceId: 'CHROME_DESKTOP',
      });

      if (response?.success) {
        toast.success(response.message || 'Punch recorded successfully');
        await loadData();
      }
    } catch (err) {
      console.error('Punch action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      header: 'Type',
      accessor: 'leaveType',
      render: (val) => (
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
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge status={val} />,
    },
  ];

  const donutData = [
    { name: 'Leaves Taken', value: 14 },
    { name: 'Remaining Balance', value: 22 }
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Shift logging/Punch card */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300 flex flex-col justify-between min-h-[160px] select-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Attendance Clock</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Today: {punchRecord?.status ? `Shift Active (${punchRecord.status})` : 'No clock log recorded'}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-dark-navy p-1.5 px-3 rounded-lg border border-border-color">
                <Clock size={14} className="text-primary-purple" />
                <span className="text-xs font-semibold text-text-primary">
                  {formatDate(new Date(), 'dd MMM yyyy')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 border-t border-b border-border-color/30 py-3.5">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">First In</span>
                <span className="text-sm font-semibold text-text-primary mt-1 block">
                  {punchRecord?.punchInTime ? formatDate(punchRecord.punchInTime, 'hh:mm a') : '--:--'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Last Out</span>
                <span className="text-sm font-semibold text-text-primary mt-1 block">
                  {punchRecord?.punchOutTime ? formatDate(punchRecord.punchOutTime, 'hh:mm a') : '--:--'}
                </span>
              </div>
            </div>

            <button
              onClick={handlePunch}
              disabled={punchStatus === 'OUT'}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                punchStatus === 'IN'
                  ? 'bg-pink-accent hover:bg-pink-accent/80 text-text-primary'
                  : punchStatus === 'OUT'
                  ? 'bg-card-elevated text-text-muted border border-border-color cursor-not-allowed shadow-none'
                  : 'bg-primary-purple hover:bg-light-purple text-text-primary shadow-primary-purple/20'
              }`}
            >
              {punchStatus === 'IN' ? (
                <>
                  <Square size={14} className="fill-current" />
                  <span>Clock Out Shift</span>
                </>
              ) : punchStatus === 'OUT' ? (
                <span>Shift Completed</span>
              ) : (
                <>
                  <Play size={14} className="fill-current" />
                  <span>Clock In Shift</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Attendance Heatmap Grid */}
          <div className="hover:shadow-purple-glow-active transition-all duration-300 rounded-xl overflow-hidden">
            <HeatmapChart data={heatmapData} />
          </div>

          {/* Card 3: Leave Requests Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">My Recent Leave Applications</h3>
            <Table columns={tableColumns} data={myLeaves} />
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Leave Balances Donut Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Leave Consumption</span>
              <span className="text-xs text-text-muted">Current Year</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Usage Ratio
                </span>
                <span className="text-xs text-text-secondary">Summary</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C']}
                height={160}
                centerText="14/36"
                centerSubtext="Days Used"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Taken: 14 days</span>
                <span>Remaining: 22 days</span>
              </div>
            </div>
          </div>

          {/* Card 5: Upcoming Holidays List */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Upcoming Official Holidays</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {holidays.map((hol, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-border-color text-primary-purple group-hover:bg-primary-purple group-hover:text-text-primary transition-all shadow-purple-glow">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{hol.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{formatDate(hol.date, 'eeee, dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary bg-card-elevated px-2 py-0.5 rounded border border-border-color select-none">
                      {hol.type}
                    </span>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-primary-purple transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6 & 7: 2 Leave Balance Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Casual Leave"
              value={`${leaveBalances[0]?.balance || 8} days`}
              trend="Available CL"
              trendDirection="stable"
            />
            <StatCard
              title="Earned Leave"
              value={`${leaveBalances[2]?.balance || 14} days`}
              trend="Available EL"
              trendDirection="stable"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
