import React, { useState, useEffect } from 'react';
import { workflowService } from '../../services/workflowService';
import StatCard from '../../components/common/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { Spinner } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { 
  FileCheck, 
  Check, 
  X, 
  ShieldAlert, 
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PendingApprovals = () => {
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVE'); // 'APPROVE' or 'REJECT'
  const [comment, setComment] = useState('');

  const loadApprovals = async () => {
    try {
      const response = await workflowService.getMyApprovals();
      if (response?.success && Array.isArray(response?.data)) {
        const pending = response.data.filter((r) => r.status === 'PENDING');
        const history = response.data.filter((r) => r.status !== 'PENDING');
        setPendingRequests(pending);
        setHistoryRequests(history);
      } else {
        // Fallback Mock Data
        const mockPending = [
          {
            _id: '1',
            name: 'Janet Dev',
            requestType: 'LEAVE',
            details: 'Medical Checkup (CL - 2 days)',
            date: 'June 15, 2026',
            status: 'PENDING',
          },
          {
            _id: '2',
            name: 'Chris Fox',
            requestType: 'REGULARIZATION',
            details: 'Clock In Missed (June 11)',
            date: 'June 12, 2026',
            status: 'PENDING',
          },
          {
            _id: '3',
            name: 'Emma Watson',
            requestType: 'LEAVE',
            details: 'Family Function (SL - 1 day)',
            date: 'June 10, 2026',
            status: 'PENDING',
          },
        ];
        
        const mockHistory = [
          {
            _id: '4',
            name: 'Woody Alen',
            requestType: 'LEAVE',
            details: 'Earned Leave (EL - 5 days)',
            date: 'June 08, 2026',
            status: 'APPROVED',
          },
          {
            _id: '5',
            name: 'Owen Wilson',
            requestType: 'REGULARIZATION',
            details: 'Late regularization approved',
            date: 'June 05, 2026',
            status: 'APPROVED',
          },
          {
            _id: '6',
            name: 'Adam Driver',
            requestType: 'LEAVE',
            details: 'Casual Leave (CL - 1 day)',
            date: 'June 03, 2026',
            status: 'REJECTED',
          },
        ];
        
        setPendingRequests(mockPending);
        setHistoryRequests(mockHistory);
      }
    } catch (err) {
      console.error('Error fetching approvals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const openDecisionModal = (req, type) => {
    setSelectedRequest(req);
    setDecisionType(type);
    setIsDecisionOpen(true);
    setComment('');
  };

  const handleDecisionSubmit = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      let response;
      if (decisionType === 'APPROVE') {
        response = await workflowService.approve(selectedRequest._id, comment);
      } else {
        response = await workflowService.reject(selectedRequest._id, comment);
      }

      if (response?.success) {
        toast.success(`Request ${decisionType === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
        setIsDecisionOpen(false);
        await loadApprovals();
      } else {
        // Mock success for display
        toast.success(`Request successfully ${decisionType === 'APPROVE' ? 'approved' : 'rejected'} (demo)`);
        setPendingRequests(prev => prev.filter(p => p._id !== selectedRequest._id));
        setHistoryRequests(prev => [
          {
            ...selectedRequest,
            status: decisionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          },
          ...prev
        ]);
        setIsDecisionOpen(false);
      }
    } catch (err) {
      console.error('Error submitting approval decision:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', Approved: 24, Rejected: 2 },
    { name: 'Feb', Approved: 28, Rejected: 4 },
    { name: 'Mar', Approved: 35, Rejected: 3 },
    { name: 'Apr', Approved: 30, Rejected: 5 },
    { name: 'May', Approved: 45, Rejected: 6 },
    { name: 'Jun', Approved: 42, Rejected: 4 },
  ];

  const tableColumns = [
    {
      header: 'Applicant',
      accessor: 'name',
      render: (val, row) => {
        const nameVal = row.requestedByEmployeeId 
          ? `${row.requestedByEmployeeId.personal?.firstName || ''} ${row.requestedByEmployeeId.personal?.lastName || ''}`.trim()
          : val;
        return (
          <div className="flex items-center gap-3">
            <Avatar name={nameVal} size="sm" />
            <span className="font-semibold text-text-primary">{nameVal}</span>
          </div>
        );
      }
    },
    { 
      header: 'Type', 
      accessor: 'requestType',
      render: (val) => val === 'LEAVE_REQUEST' ? 'Leave Request' : (val === 'ATTENDANCE_REGULARIZATION' ? 'Attendance Correction' : val)
    },
    { 
      header: 'Reason', 
      accessor: 'metadata',
      render: (val, row) => val?.reason || row.details || 'N/A'
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (_, row) => (
        <button 
          onClick={() => openDecisionModal(row, 'APPROVE')}
          style={{
            backgroundColor: '#704A3C',
            color: '#E8E3DD',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="hover:bg-[#5C3B30] active:scale-95 transition-all"
        >
          Update Status
        </button>
      )
    }
  ];

  const donutData = [
    { name: 'Leaves', value: 8 },
    { name: 'Regularization', value: 4 },
    { name: 'Other Workflows', value: 2 },
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
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Workflow Approvals</h2>
              <p className="text-xs text-text-secondary mt-1">Pending workspace requests requiring your manager authority</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-elevated border border-border-color text-xs text-text-primary">
              <Clock size={14} className="text-primary-purple" />
              <span>Roster Active</span>
            </div>
          </div>

          {/* Card 2: Approvals Processed Trend Chart */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="text-base font-semibold text-text-primary">Approvals Processed Trend</h3>
              <span className="text-xs text-text-muted">Target Time: 24h</span>
            </div>
            <AreaChart
              data={chartData}
              xKey="name"
              series={[
                { key: 'Approved', name: 'Approved Requests', color: '#8B7B6F' },
                { key: 'Rejected', name: 'Rejected Requests', color: 'rgba(255, 255, 255, 0.25)' },
              ]}
              height={300}
            />
          </div>

          {/* Card 3: Pending Approvals Table */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Pending Action Queue</h3>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="md" />
              </div>
            ) : (
              <Table columns={tableColumns} data={pendingRequests} />
            )}
          </div>

        </div>

        {/* Right Column (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 4: Donut Chart Card */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <div className="flex justify-between items-center mb-4 select-none">
              <span className="text-base font-semibold text-text-primary">Pending by Category</span>
              <span className="text-xs text-text-muted">Ratios</span>
            </div>
            
            <div className="bg-dark-navy border border-border-color rounded-xl p-4 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2 select-none">
                <span className="text-xs font-semibold text-text-primary bg-primary-purple/10 px-2 py-0.5 rounded text-primary-purple border border-primary-purple/20">
                  Workflow Splits
                </span>
                <span className="text-xs text-text-secondary">Summary</span>
              </div>
              
              <DonutChart
                data={donutData}
                valueKey="value"
                nameKey="name"
                colors={['#704A3C', '#704A3C', '#8B7B6F']}
                height={160}
                centerText={`${pendingRequests.length}`}
                centerSubtext="Pending Actions"
              />
              
              <div className="flex justify-between items-center w-full mt-4 select-none text-xs text-text-secondary">
                <span>Leaves: {pendingRequests.filter(p => p.requestType === 'LEAVE').length}</span>
                <span>Clock Corrections: {pendingRequests.filter(p => p.requestType === 'REGULARIZATION').length}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Recent Approval Actions List */}
          <div className="bg-card-dark border border-border-color rounded-xl p-6 shadow-purple-glow hover:shadow-purple-glow-active transition-all duration-300">
            <h3 className="text-base font-semibold text-text-primary mb-4 select-none">Decision Audit History</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {historyRequests.slice(0, 6).map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-card-dark border border-border-color/40 hover:bg-card-elevated hover:shadow-purple-glow transition-all duration-200 select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-border-color text-primary-purple group-hover:bg-primary-purple group-hover:text-text-primary transition-all shadow-purple-glow">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{item.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.requestType} • {item.date}</p>
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

          {/* Card 6 & 7: 2 Metric Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total Pending"
              value={pendingRequests.length}
              trend="Awaiting Action"
              trendDirection="up"
            />
            <StatCard
              title="Avg Decision Time"
              value="1.2 days"
              trend="-0.3 days MoM"
              trendDirection="down"
            />
          </div>

        </div>

      </div>

      {/* Decision Comments Modal */}
      <Modal
        isOpen={isDecisionOpen}
        onClose={() => {
          setIsDecisionOpen(false);
          setSelectedRequest(null);
        }}
        title="Update Request Status"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              onClick={() => {
                setIsDecisionOpen(false);
                setSelectedRequest(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-border-color text-text-primary hover:bg-card-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDecisionSubmit}
              className={`px-5 py-2 rounded-lg text-xs font-semibold text-text-primary shadow-lg transition-all cursor-pointer ${
                decisionType === 'APPROVE' 
                  ? 'bg-primary-purple hover:bg-light-purple shadow-primary-purple/20' 
                  : 'bg-pink-accent hover:bg-pink-accent/80 shadow-pink-accent/20'
              }`}
            >
              Confirm {decisionType === 'APPROVE' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-text-primary select-none">
          <p className="text-xs text-text-secondary leading-relaxed">
            Applicant: <span className="font-semibold text-text-primary">
              {selectedRequest?.requestedByEmployeeId 
                ? `${selectedRequest.requestedByEmployeeId.personal?.firstName || ''} ${selectedRequest.requestedByEmployeeId.personal?.lastName || ''}`.trim()
                : selectedRequest?.name}
            </span>
            <br />
            Details: <span className="text-text-primary">{selectedRequest?.metadata?.reason || selectedRequest?.details || 'N/A'}</span>
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Select Action</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                <input
                  type="radio"
                  name="decisionType"
                  value="APPROVE"
                  checked={decisionType === 'APPROVE'}
                  onChange={() => setDecisionType('APPROVE')}
                  className="accent-primary-purple"
                />
                Approve Request
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                <input
                  type="radio"
                  name="decisionType"
                  value="REJECT"
                  checked={decisionType === 'REJECT'}
                  onChange={() => setDecisionType('REJECT')}
                  className="accent-pink-accent"
                />
                Reject Request
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Reason / Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={decisionType === 'REJECT' ? 'Provide rejection reason (Required)...' : 'Provide context or instructions (Optional)...'}
              className="w-full px-3 py-2 rounded-lg bg-dark-navy border border-border-color text-xs focus:outline-none focus:border-primary-purple text-text-primary placeholder:text-text-muted"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingApprovals;
