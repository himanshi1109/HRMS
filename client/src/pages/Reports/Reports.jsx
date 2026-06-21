import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import { Spinner } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { 
  FileDown, 
  FileSpreadsheet, 
  PieChart, 
  Users, 
  BarChart3,
  Clock,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [activeReport, setActiveReport] = useState('headcount'); // 'headcount', 'attendance', 'attrition'
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const reportsList = [
    { id: 'headcount', name: 'Headcount Summary' },
    { id: 'attendance', name: 'Attendance Trends' },
    { id: 'attrition', name: 'Attrition Rates' },
  ];

  const loadReport = async () => {
    setLoading(true);
    try {
      if (activeReport === 'headcount') {
        const res = await reportService.getHeadcount({ groupBy: 'department' });
        if (res?.success && Array.isArray(res?.data)) {
          setReportData(res.data);
          setChartData(res.data.map(d => ({ name: d._id || 'General', count: d.count })));
        } else {
          const mockHeadcount = [
            { _id: 'Engineering', count: 54 },
            { _id: 'Product', count: 18 },
            { _id: 'Marketing', count: 22 },
            { _id: 'HR Operations', count: 12 },
            { _id: 'Finance', count: 10 },
            { _id: 'Sales', count: 12 },
          ];
          setReportData(mockHeadcount.map(d => ({ name: d._id, count: d.count })));
          setChartData(mockHeadcount.map(d => ({ name: d._id, count: d.count })));
        }
      } else if (activeReport === 'attendance') {
        const res = await reportService.getAttendanceSummary({ month: '2026-06' });
        if (res?.success && Array.isArray(res?.data)) {
          setReportData(res.data);
          setChartData(res.data);
        } else {
          const mockAttendance = [
            { name: 'Jan', count: 90 },
            { name: 'Feb', count: 92 },
            { name: 'Mar', count: 88 },
            { name: 'Apr', count: 94 },
            { name: 'May', count: 91 },
            { name: 'Jun', count: 95 },
          ];
          setReportData(mockAttendance);
          setChartData(mockAttendance);
        }
      } else if (activeReport === 'attrition') {
        const res = await reportService.getAttrition({ year: '2026' });
        if (res?.success && Array.isArray(res?.data)) {
          setReportData(res.data);
          setChartData(res.data);
        } else {
          const mockAttrition = [
            { name: 'Q1', count: 3 },
            { name: 'Q2', count: 5 },
            { name: 'Q3', count: 2 },
            { name: 'Q4', count: 1 },
          ];
          setReportData(mockAttrition);
          setChartData(mockAttrition);
        }
      }
    } catch (err) {
      console.error('Failed to load reports details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReport]);

  const handleExport = (format) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const tableColumns = [
    {
      header: 'Category / Name',
      accessor: 'name',
      render: (val, row) => (
        <span className="font-semibold text-text-primary">{val || row._id || 'General'}</span>
      )
    },
    {
      header: 'Metric Value',
      accessor: 'count',
      render: (val) => <span className="font-semibold text-light-purple">{val || 0}</span>
    },
    {
      header: 'Status Ratio',
      accessor: 'count',
      render: (val, row) => `${Math.round(((val || 0) / 128) * 100)}% of total`
    }
  ];

  const donutData = [
    { name: 'Headcount', value: 54 },
    { name: 'Operations', value: 46 }
  ];

  const downloadHistory = [
    { name: 'Headcount_Summary_June.xlsx', date: 'June 12, 2026', size: '24 KB', format: 'xlsx' },
    { name: 'Attendance_Compliance_May.pdf', date: 'June 08, 2026', size: '185 KB', format: 'pdf' },
    { name: 'Attrition_Annual_Roster.xlsx', date: 'June 05, 2026', size: '42 KB', format: 'xlsx' },
    { name: 'Late_Arrival_Audit_April.xlsx', date: 'June 02, 2026', size: '36 KB', format: 'xlsx' },
    { name: 'Muster_Grid_Export.pdf', date: 'May 28, 2026', size: '344 KB', format: 'pdf' },
    { name: 'Operations_Roster_Audit.pdf', date: 'May 20, 2026', size: '128 KB', format: 'pdf' },
  ];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (60% width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Header / Filter section */}
          <div className="bg-card-dark border border-border-color rounded-xl p-5 shadow-purple-glow select-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">Reports & Analytics</h2>
                <p className="text-xs text-text-secondary mt-1">Generate workspace operations audits and export metrics</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('xlsx')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary hover:border-primary-purple transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-light-purple" />
                  <span>Excel</span>
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary hover:border-primary-purple transition-all cursor-pointer"
                >
                  <FileDown size={14} className="text-pink-accent" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Tab switch buttons */}
            <div className="flex bg-dark-navy border border-border-color rounded-lg p-0.5 mt-5 select-none w-full sm:w-max">
              {reportsList.map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => setActiveReport(rep.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeReport === rep.id 
                      ? 'bg-primary-purple text-text-primary shadow-purple-glow-active' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-elevated/40'
                  }`}
                >
                  {rep.name}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Analytics Trend Area Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Analytics Trend</h3>
              <span className="text-xs text-text-muted">Ratios Chart</span>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Spinner size="md" />
              </div>
            ) : (
              <AreaChart
                data={chartData}
                xKey="name"
                series={[
                  { key: 'count', name: activeReport.toUpperCase(), color: '#8B7B6F' },
                ]}
                height={300}
              />
            )}
          </div>

          {/* Card 3: Generated Audit Data Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Audit Data Records</h3>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="md" />
              </div>
            ) : (
              <Table columns={tableColumns} data={reportData} />
            )}
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Categories Donut Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Allocations Summary</span>
              <span className="text-xs text-text-muted">Current Month</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Department Split
                </span>
                <span className="text-xs text-text-secondary">Summary</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C']}
                height={160}
                centerText="128"
                centerSubtext="Audited Items"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Headcount: 54%</span>
                <span>Other: 46%</span>
              </div>
            </div>
          </div>

          {/* Card 5: Recent Export downloads list */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Export Download Logs</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {downloadHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-border-color text-primary-purple group-hover:bg-primary-purple group-hover:text-text-primary transition-all shadow-purple-glow">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary truncate max-w-[170px]">{item.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.date} • {item.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-secondary bg-card-elevated px-2 py-0.5 rounded border border-border-color uppercase">
                      {item.format}
                    </span>
                    <ChevronRight 
                      size={14} 
                      className="text-text-muted group-hover:text-primary-purple transition-colors cursor-pointer"
                      onClick={() => handleExport(item.format)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6 & 7: 2 Reports Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total Audits"
              value="1,482"
              trend="Compliance OK"
              trendDirection="stable"
            />
            <StatCard
              title="Downloads Count"
              value={downloadHistory.length}
              trend="+2 exported"
              trendDirection="up"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default Reports;
