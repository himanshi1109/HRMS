import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { employeeService } from '../../services/employeeService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Smartphone, 
  Laptop, 
  ShoppingBag, 
  CreditCard,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

export const HRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load HR dashboard metrics
        const res = await reportService.getHrDashboard();
        if (res?.success && res?.data) {
          const { totalActiveEmployees, todayPresencePercentage } = res.data;
          const present = Math.round(totalActiveEmployees * (todayPresencePercentage / 100));
          setMetrics({
            totalEmployees: totalActiveEmployees || 0,
            presentToday: present || 0,
          });
        }

        // Load employee list for the directory table
        const empRes = await employeeService.getEmployees({ page: 1, limit: 10 });
        if (empRes?.success) {
          const list = Array.isArray(empRes.data)
            ? empRes.data
            : (empRes.data?.docs || empRes.data?.employees || []);
          setEmployees(list);
        }
      } catch (err) {
        console.error('Error fetching HR Dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Strict Mock Data matching reference image
  const areaChartData = [
    { name: 'Jan', Primary: 18000, Ghost: 19500 },
    { name: 'Feb', Primary: 18500, Ghost: 20000 },
    { name: 'Mar', Primary: 21000, Ghost: 18500 },
    { name: 'Apr', Primary: 16000, Ghost: 19000 },
    { name: 'May', Primary: 15500, Ghost: 17500 },
    { name: 'June', Primary: 22000, Ghost: 21500 },
    { name: 'July', Primary: 18000, Ghost: 20000 },
    { name: 'Aug', Primary: 19000, Ghost: 18000 },
    { name: 'Sept', Primary: 17000, Ghost: 21000 },
    { name: 'Oct', Primary: 26000, Ghost: 24500 },
    { name: 'Nov', Primary: 23000, Ghost: 25000 },
    { name: 'Dec', Primary: 24000, Ghost: 23500 },
  ];

  const tableColumns = [
    {
      header: 'Employee',
      accessor: 'personal',
      render: (val, row) => {
        const name = `${val?.firstName || ''} ${val?.lastName || ''}`.trim() || 'Employee';
        return (
          <div className="flex items-center gap-3">
            <Avatar name={name} size="sm" />
            <div>
              <span className="font-semibold text-text-primary block">{name}</span>
              <span className="text-[10px] text-text-muted">{row.employeeId}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'employment',
      render: (val) => (
        <span className="px-3 py-1 rounded bg-dark-navy border border-border-color text-xs text-text-secondary">
          {val?.departmentId?.name || val?.departmentName || '—'}
        </span>
      )
    },
    {
      header: 'Designation',
      accessor: 'employment',
      render: (val) => <span className="text-text-secondary text-sm">{val?.designationId?.name || val?.designationName || '—'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge status={val || 'ACTIVE'} />
    },
    {
      header: '',
      accessor: '_id',
      render: (val) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/employees/${val}`); }}
          className="p-1.5 rounded hover:bg-primary-purple/10 text-text-muted hover:text-primary-purple transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      )
    }
  ];

  const donutData = [
    { name: 'Efficiency', value: 44.8 },
    { name: 'Remaining', value: 55.2 }
  ];

  const listItems = [
    { icon: Smartphone, name: 'Apple', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
    { icon: Laptop, name: 'Zoom', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
    { icon: ShoppingBag, name: 'Woody Alen', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
    { icon: CreditCard, name: 'Owen Wilson', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
    { icon: Layers, name: 'Adam Driver', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
    { icon: Smartphone, name: 'Stanley Kubrick', date: 'Willum Bickham', amount: '+$240', isUp: true, time: '20:20' },
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) - spans 3 columns on large screens */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Header / Filter section */}
          <div className="flex justify-between items-center bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow select-none">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h2>
              <p className="text-xs text-text-muted mt-1">Unified HR operations indicators</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary hover:border-primary-purple hover:shadow-purple-glow-active transition-all cursor-pointer">
              <Filter size={14} className="text-primary-purple" />
              <span>Filter</span>
            </button>
          </div>

          {/* Card 2: Tasks Overview Area Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Tasks Overview</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary hover:border-primary-purple transition-all cursor-pointer">
                <span>Filter</span>
                <Filter size={12} className="text-text-muted" />
              </button>
            </div>
            <AreaChart
              data={areaChartData}
              xKey="name"
              series={[
                { key: 'Primary', name: 'Primary Line', color: '#8B7B6F' },
                { key: 'Ghost', name: 'Ghost Line', color: 'rgba(255, 255, 255, 0.3)' },
              ]}
              height={300}
            />
          </div>

          {/* Card 3: Employee Directory Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="text-base font-semibold text-text-primary">Employee Directory</h3>
              <button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary hover:border-primary-purple hover:shadow-purple-glow-active transition-all cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={12} />
              </button>
            </div>
            <Table
              columns={tableColumns}
              data={employees}
              onRowClick={(row) => navigate(`/employees/${row._id}`)}
            />
          </div>

        </div>

        {/* Right Column (40% width) - spans 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Donut Chart Card */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Transactions</span>
              <button className="p-1 rounded hover:bg-card-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <MoreHorizontal size={18} />
              </button>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  EIR
                </span>
                <button className="p-1 rounded-full bg-card-dark border border-border-color text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  <ArrowUpRight size={14} />
                </button>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C']}
                height={160}
                centerText="44.80%"
                centerSubtext="Efficiency"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>4 June</span>
                <span>Efficiency Metric</span>
              </div>
            </div>
          </div>

          {/* Card 5: Transactions List */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Recent Activities List</h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {listItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-border-color text-primary-purple group-hover:bg-primary-purple group-hover:text-text-primary transition-all shadow-purple-glow">
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{item.name}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{item.date} • {item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-bold text-text-primary">{item.amount}</span>
                      {item.isUp ? (
                        <ArrowUpRight size={16} className="text-primary-purple" />
                      ) : (
                        <ArrowDownRight size={16} className="text-pink-accent" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 6 & 7: 2 Total Balance Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total Balance"
              value="$80.440"
              trend="44%"
              trendDirection="up"
            />
            <StatCard
              title="Total Balance"
              value="$84.220"
              trend="1%"
              trendDirection="down"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default HRDashboard;
