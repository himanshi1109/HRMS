import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CalendarCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Compass,
  FileText
} from 'lucide-react';

export const LeadershipDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 120,
    overallRetention: '94.2%',
  });

  const [locationHeadcount, setLocationHeadcount] = useState([
    { name: 'Headquarters', value: 75 },
    { name: 'Regional Office', value: 30 },
    { name: 'Remote Hub', value: 15 },
  ]);

  const [exitsList, setExitsList] = useState([
    { id: 1, name: 'Janet Dev', dept: 'Engineering', tenure: '2.4 years', type: 'Voluntary' },
    { id: 2, name: 'Chris Fox', dept: 'Design', tenure: '1.8 years', type: 'Voluntary' },
    { id: 3, name: 'Emma Watson', dept: 'Product', tenure: '3.1 years', type: 'Involuntary' },
    { id: 4, name: 'John Doe', dept: 'Support', tenure: '0.8 years', type: 'Voluntary' },
    { id: 5, name: 'Alisha Thomas', dept: 'HR Ops', tenure: '4.2 years', type: 'Voluntary' },
  ]);

  useEffect(() => {
    const fetchLeadershipMetrics = async () => {
      try {
        const response = await reportService.getLeadershipDashboard();
        if (response?.success && response?.data) {
          const { totalActiveEmployees, avgPresencePercentage } = response.data;
          setMetrics({
            totalEmployees: totalActiveEmployees || 120,
            overallRetention: `${avgPresencePercentage || 94.2}%`,
          });
        }
      } catch (err) {
        console.error('Error fetching leadership metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadershipMetrics();
  }, []);

  const chartData = [
    { name: 'Jan', Active: 98, Target: 100 },
    { name: 'Feb', Active: 102, Target: 105 },
    { name: 'Mar', Active: 108, Target: 110 },
    { name: 'Apr', Active: 114, Target: 115 },
    { name: 'May', Active: 118, Target: 120 },
    { name: 'Jun', Active: 120, Target: 125 },
  ];

  const tableColumns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (val) => (
        <span className="font-semibold text-text-primary">{val}</span>
      )
    },
    { header: 'Department', accessor: 'dept' },
    { header: 'Tenure', accessor: 'tenure', render: (val) => <span className="font-semibold text-light-purple">{val}</span> },
    { header: 'Exit Type', accessor: 'type' }
  ];

  const donutData = [
    { name: 'Onsite', value: 75 },
    { name: 'Remote Office', value: 45 }
  ];

  const activeVips = [
    { name: 'Janet Dev', dept: 'Engineering', status: 'ACTIVE', time: '1.2h ago' },
    { name: 'Emma Watson', dept: 'Product', status: 'ON_LEAVE', time: '1d ago' },
    { name: 'Chris Fox', dept: 'Design', status: 'ACTIVE', time: '4h ago' },
    { name: 'Alisha Thomas', dept: 'HR Ops', status: 'ACTIVE', time: '2m ago' },
    { name: 'Woody Alen', dept: 'Executive', status: 'ACTIVE', time: 'Just now' },
    { name: 'Owen Wilson', dept: 'Executive', status: 'ACTIVE', time: '10m ago' },
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Header Section */}
          <div className="flex justify-between items-center bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow select-none">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Executive Oversight</h2>
              <p className="text-xs text-text-secondary mt-1">High-level operations insights and talent indices</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary">
              <Compass size={14} className="text-primary-purple" />
              <span>Console Active</span>
            </div>
          </div>

          {/* Card 2: Headcount Growth Trend Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Staffing & Target Allocation</h3>
              <span className="text-xs text-text-muted">Target: 125</span>
            </div>
            <AreaChart
              data={chartData}
              xKey="name"
              series={[
                { key: 'Active', name: 'Active Roster', color: '#8B7B6F' },
                { key: 'Target', name: 'Planned Target', color: 'rgba(255, 255, 255, 0.25)' },
              ]}
              height={300}
            />
          </div>

          {/* Card 3: Attrition Records Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Recent Talent Departures</h3>
            <Table columns={tableColumns} data={exitsList} />
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Location splits Donut Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Oversight Splits</span>
              <span className="text-xs text-text-muted">Direct Balance</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Location splits
                </span>
                <span className="text-xs text-text-secondary">Summary</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C']}
                height={160}
                centerText={`${metrics.totalEmployees}`}
                centerSubtext="Total Talent"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Headquarters: 75</span>
                <span>Regional: 45</span>
              </div>
            </div>
          </div>

          {/* Card 5: Recent activities list */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Workspace Status logs</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeVips.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={item.name} size="sm" />
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{item.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.dept} • {item.time}</p>
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

          {/* Card 6 & 7: 2 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Talent Retention"
              value={metrics.overallRetention}
              trend="94.2% overall"
              trendDirection="stable"
            />
            <StatCard
              title="Active Headcount"
              value={metrics.totalEmployees}
              trend="+2 joiners MoM"
              trendDirection="up"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default LeadershipDashboard;
