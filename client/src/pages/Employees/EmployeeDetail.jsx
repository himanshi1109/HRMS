import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { attendanceService } from '../../services/attendanceService';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Clock,
  Trash2,
  Upload,
  Calendar,
  DollarSign,
  Shield,
  FileBadge,
  Edit,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const EmployeeDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'employment', 'attendance', 'documents', 'timeline', 'credentials'
  const [employee, setEmployee] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    officialEmail: '',
    personalPhone: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    designationId: '',
    locationId: '',
    reportingManagerId: '',
    salary: 0,
    dateOfJoining: '',
    status: 'ACTIVE',
    role: 'EMPLOYEE'
  });

  // Edit dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [managers, setManagers] = useState([]);

  // Attendance tab data
  const [empAttendance, setEmpAttendance] = useState([]);
  const [empAttendanceLoading, setEmpAttendanceLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccessPassword, setResetSuccessPassword] = useState('');

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter or generate a password');
      return;
    }
    setResetting(true);
    try {
      const response = await employeeService.resetEmployeePassword(id, newPassword);
      if (response?.success) {
        toast.success('Password updated successfully');
        setResetSuccessPassword(newPassword);
        setNewPassword('');
        await loadEmployeeData();
        window.dispatchEvent(new CustomEvent('employee-updated'));
      } else {
        toast.error(response?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setResetting(false);
    }
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployeeById(id);
      if (response?.success && response?.data) {
        setEmployee(response.data);
      }
      
      const timelineRes = await employeeService.getTimeline(id);
      if (timelineRes?.success && timelineRes?.data) {
        setTimeline(timelineRes.data);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [id]);

  useEffect(() => {
    window.addEventListener('employee-updated', loadEmployeeData);
    return () => window.removeEventListener('employee-updated', loadEmployeeData);
  }, [id]);

  // Load Dropdown Data when entering Edit Mode
  const handleStartEdit = async () => {
    setIsEditing(true);
    setEditForm({
      firstName: employee.personal?.firstName || '',
      lastName: employee.personal?.lastName || '',
      officialEmail: employee.contact?.officialEmail || '',
      personalPhone: employee.contact?.personalPhone || '',
      gender: employee.personal?.gender || 'MALE',
      dateOfBirth: employee.personal?.dateOfBirth ? employee.personal.dateOfBirth.split('T')[0] : '',
      address: employee.personal?.address || '',
      departmentId: employee.employment?.departmentId?._id || employee.employment?.departmentId || '',
      designationId: employee.employment?.designationId?._id || employee.employment?.designationId || '',
      locationId: employee.employment?.locationId?._id || employee.employment?.locationId || '',
      reportingManagerId: employee.employment?.reportingManagerId?._id || employee.employment?.reportingManagerId || '',
      salary: employee.employment?.salary || 0,
      dateOfJoining: employee.employment?.dateOfJoining ? employee.employment.dateOfJoining.split('T')[0] : '',
      status: employee.status || 'ACTIVE',
      role: employee.userId?.role || 'EMPLOYEE'
    });

    try {
      const depRes = await api.get('/departments');
      if (depRes.data?.success) setDepartments(depRes.data.data);

      const desigRes = await api.get('/designations');
      if (desigRes.data?.success) setDesignations(desigRes.data.data);

      const locRes = await api.get('/locations');
      if (locRes.data?.success) setLocations(locRes.data.data);

      const empRes = await api.get('/employees');
      if (empRes.data?.success) {
        const empList = Array.isArray(empRes.data.data) ? empRes.data.data : (empRes.data.data?.docs || []);
        setManagers(empList.filter(e => e._id.toString() !== id.toString()));
      }
    } catch (err) {
      console.error('Error fetching dropdown lists:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        personal: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          gender: editForm.gender,
          dateOfBirth: editForm.dateOfBirth,
          address: editForm.address
        },
        contact: {
          officialEmail: editForm.officialEmail,
          personalPhone: editForm.personalPhone
        },
        employment: {
          departmentId: editForm.departmentId || null,
          designationId: editForm.designationId || null,
          locationId: editForm.locationId || null,
          reportingManagerId: editForm.reportingManagerId || null,
          salary: editForm.salary,
          dateOfJoining: editForm.dateOfJoining
        },
        status: editForm.status,
        role: editForm.role
      };

      const response = await employeeService.updateEmployee(id, payload);
      if (response?.success) {
        toast.success('Employee profile updated successfully');
        setIsEditing(false);
        await loadEmployeeData();
        window.dispatchEvent(new CustomEvent('employee-updated'));
      }
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to update employee details');
    }
  };

  // Load Employee Attendance Logs
  useEffect(() => {
    const fetchEmpAttendance = async () => {
      if (activeTab !== 'attendance') return;
      setEmpAttendanceLoading(true);
      try {
        let res;
        if (currentUser.role === 'HR_ADMIN') {
          res = await attendanceService.getAllAttendance({ employeeId: id, limit: 100 });
        } else {
          res = await attendanceService.getTeamAttendance({ employeeId: id, limit: 100 });
        }
        if (res?.success) {
          setEmpAttendance(res.data?.docs || res.data || []);
        }
      } catch (err) {
        console.error('Error fetching employee attendance:', err);
      } finally {
        setEmpAttendanceLoading(false);
      }
    };
    fetchEmpAttendance();
  }, [activeTab, id, currentUser]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await employeeService.uploadDocument(id, file);
      if (response?.success) {
        toast.success('Document uploaded successfully');
        await loadEmployeeData();
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDocDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await employeeService.deleteDocument(id, docId);
      if (response?.success) {
        toast.success('Document deleted successfully');
        await loadEmployeeData();
      }
    } catch (err) {
      console.error('File deletion failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-stardust-text">
        <p className="text-grey-text">Employee details not found.</p>
        <Link to="/employees" className="mt-4 inline-block text-indigo-brand hover:underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  const fullName = `${employee.personal?.firstName} ${employee.personal?.lastName}`;

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

  const attendanceColumns = [
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

  return (
    <div className="space-y-6 select-none">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/employees"
            className="p-2 rounded bg-charcoal-sidebar border border-indigo-border text-grey-text hover:text-stardust-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stardust-text">Employee Profile</h2>
            <span className="text-xs text-grey-text mt-0.5 block">Manage single employee workspace config</span>
          </div>
        </div>

        {currentUser?.role === 'HR_ADMIN' && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-charcoal-sidebar border border-indigo-border text-xs font-semibold text-grey-text hover:text-stardust-text cursor-pointer transition-colors"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-brand hover:bg-indigo-hover text-xs font-semibold text-stardust-text cursor-pointer transition-colors"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Header Widget */}
      <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <Avatar name={fullName} size="xl" />
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h3 className="text-2xl font-bold text-stardust-text">{fullName}</h3>
              <Badge status={employee.status || 'ACTIVE'} />
            </div>
            <p className="text-sm text-grey-text font-medium uppercase tracking-wide">
              {employee.employment?.designationId?.name || employee.employment?.designationName || 'Staff'}
            </p>
            <p className="text-xs text-grey-text">
              ID: <span className="font-semibold text-stardust-text">{employee.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-center md:text-right bg-charcoal-navbar/40 p-4 border border-indigo-border/30 rounded-lg">
          <div>
            <span className="text-[10px] text-grey-text uppercase block font-semibold">Department</span>
            <span className="text-sm font-semibold text-stardust-text block mt-1">
              {employee.employment?.departmentId?.name || employee.employment?.departmentName || 'General'}
            </span>
          </div>
          <div className="w-px h-8 bg-indigo-border self-center" />
          <div>
            <span className="text-[10px] text-grey-text uppercase block font-semibold">Office Location</span>
            <span className="text-sm font-semibold text-stardust-text block mt-1">
              {employee.employment?.locationId?.name || employee.employment?.locationName || 'HQ'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-b border-indigo-border flex gap-6 text-sm font-medium">
        {['personal', 'employment', 'attendance', 'documents', 'timeline', ...(currentUser?.role === 'HR_ADMIN' ? ['credentials'] : [])].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 px-1 transition-all capitalize cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-brand text-indigo-brand font-bold'
                : 'border-transparent text-grey-text hover:text-stardust-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-6 shadow-lg min-h-[250px]">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Personal details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-grey-text block">First Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block">{employee.personal?.firstName}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-grey-text block">Last Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block">{employee.personal?.lastName}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-grey-text block">Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.officialEmail}
                      onChange={(e) => setEditForm({ ...editForm, officialEmail: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block truncate max-w-[170px]" title={employee.contact?.officialEmail}>
                      {employee.contact?.officialEmail || '-'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-grey-text block">Phone</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.personalPhone}
                      onChange={(e) => setEditForm({ ...editForm, personalPhone: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block">{employee.contact?.personalPhone || '-'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Demographics & Location
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-grey-text block">Gender</span>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block capitalize">{employee.personal?.gender?.toLowerCase() || '-'}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-grey-text block">Date of Birth</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block">
                      {formatDate(employee.personal?.dateOfBirth)}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-grey-text block">Address</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="mt-1 px-2.5 py-1.5 w-full rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text mt-0.5 block">{employee.personal?.address || '-'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Deployment Settings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-1 border-b border-indigo-border/20 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Briefcase size={14} /> Department</span>
                  {isEditing ? (
                    <select
                      value={editForm.departmentId}
                      onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                      className="px-2 py-1.5 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-stardust-text">{employee.employment?.departmentId?.name || employee.employment?.departmentName || 'General'}</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-border/20 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Briefcase size={14} /> Designation</span>
                  {isEditing ? (
                    <select
                      value={editForm.designationId}
                      onChange={(e) => setEditForm({ ...editForm, designationId: e.target.value })}
                      className="px-2 py-1.5 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-stardust-text">{employee.employment?.designationId?.name || employee.employment?.designationName || 'Staff'}</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-border/20 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Briefcase size={14} /> Location</span>
                  {isEditing ? (
                    <select
                      value={editForm.locationId}
                      onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                      className="px-2 py-1.5 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    >
                      <option value="">Select Location</option>
                      {locations.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-stardust-text">{employee.employment?.locationId?.name || employee.employment?.locationName || 'HQ'}</span>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-border/20 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Briefcase size={14} /> Reporting Manager</span>
                  {isEditing ? (
                    <select
                      value={editForm.reportingManagerId}
                      onChange={(e) => setEditForm({ ...editForm, reportingManagerId: e.target.value })}
                      className="px-2 py-1.5 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    >
                      <option value="">No Reporting Manager</option>
                      {managers.map((d) => (
                        <option key={d._id} value={d._id}>{`${d.personal?.firstName} ${d.personal?.lastName}`}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-stardust-text">
                      {employee.employment?.reportingManagerId 
                        ? `${employee.employment.reportingManagerId.personal?.firstName} ${employee.employment.reportingManagerId.personal?.lastName}`
                        : 'None'}
                    </span>
                  )}
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Calendar size={14} /> Joining Date</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dateOfJoining}
                      onChange={(e) => setEditForm({ ...editForm, dateOfJoining: e.target.value })}
                      className="px-2 py-1.5 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text">{formatDate(employee.employment?.dateOfJoining)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Financial details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-1 border-b border-indigo-border/20 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><DollarSign size={14} /> Base Compensation</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                      className="px-2 py-1.5 w-32 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                  ) : (
                    <span className="font-semibold text-stardust-text">{formatCurrency(employee.employment?.salary)}</span>
                  )}
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-grey-text flex items-center gap-1.5"><Shield size={14} /> Security Clearance</span>
                  <span className="font-semibold text-indigo-brand">Level-1 ESS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-border/30 pb-3">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider">
                Attendance Log history
              </h3>
              <span className="text-xs text-grey-text">Last 100 entries</span>
            </div>

            {empAttendanceLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <Table
                columns={attendanceColumns}
                data={empAttendance}
              />
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-indigo-border/30 pb-3">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider">
                Workspace Attachments & Logs
              </h3>
              
              <label className="flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-brand hover:bg-indigo-hover text-xs font-semibold text-stardust-text cursor-pointer select-none">
                {uploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload Attachment</span>
                  </>
                )}
                <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!employee.documents || employee.documents.length === 0 ? (
                <p className="col-span-full text-center text-sm text-grey-text py-8">
                  No documents uploaded. Attach identification credentials.
                </p>
              ) : (
                employee.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-3.5 bg-charcoal-navbar border border-indigo-border rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2 bg-indigo-brand/10 text-indigo-brand rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-stardust-text truncate max-w-[160px]" title={doc.name}>
                          {doc.name}
                        </h4>
                        <span className="text-[10px] text-grey-text mt-0.5 block uppercase">
                          {doc.documentType || 'Doc'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDocDelete(doc._id)}
                        className="p-1.5 rounded text-grey-text hover:text-[#704A3C] hover:bg-[#2E1F1B]/20 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-3">
              Organizational History Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-indigo-border/60 ml-2 space-y-6">
              {timeline.length === 0 ? (
                <div className="text-sm text-grey-text py-4">No events logged in the profile timeline.</div>
              ) : (
                timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon marker */}
                    <span className="absolute -left-[31px] top-1 bg-charcoal-sidebar p-0.5 rounded-full border border-indigo-border">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-brand" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-grey-text">
                        {formatDate(event.createdAt, 'dd MMM yyyy, hh:mm a')}
                      </span>
                      <h4 className="text-sm font-bold text-stardust-text mt-1">{event.action}</h4>
                      <p className="text-xs text-grey-text mt-1">{event.comment || 'System logged audit transaction.'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && currentUser?.role === 'HR_ADMIN' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-3">
              Portal Credentials & Account Security
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <div className="space-y-4">
                <div className="p-4 bg-charcoal-navbar border border-indigo-border rounded-lg space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-indigo-border/20">
                    <span className="text-xs text-grey-text">Login Username</span>
                    <span className="text-sm font-semibold text-indigo-brand">{employee.userId?.username || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-indigo-border/20">
                    <span className="text-xs text-grey-text">Login Email</span>
                    <span className="text-sm font-semibold text-stardust-text">{employee.contact?.officialEmail || employee.contact?.personalEmail || employee.userId?.email || 'No Email'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-indigo-border/20">
                    <span className="text-xs text-grey-text">System Role</span>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-2 py-1 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="HR_ADMIN">HR Admin</option>
                        <option value="LEADERSHIP">Leadership</option>
                      </select>
                    ) : (
                      <span className="text-sm font-semibold text-indigo-brand">{employee.userId?.role || 'EMPLOYEE'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-grey-text">Account Status</span>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="px-2 py-1 rounded bg-dark-navy border border-border-color text-xs text-stardust-text focus:outline-none focus:border-indigo-brand"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="TERMINATED">TERMINATED</option>
                      </select>
                    ) : (
                      <Badge status={employee.userId?.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    )}
                  </div>
                </div>
              </div>

              {/* Password Reset Form */}
              <div className="p-4 bg-charcoal-navbar border border-indigo-border rounded-lg space-y-4">
                <h4 className="text-sm font-bold text-stardust-text">Administrative Password Reset</h4>
                <p className="text-xs text-grey-text">
                  Update the password for this employee's portal login. The new password will take effect immediately.
                </p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 px-3 py-2 rounded bg-charcoal-sidebar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-3 py-2 bg-charcoal-sidebar border border-indigo-border text-xs text-grey-text hover:text-stardust-text rounded cursor-pointer"
                    >
                      Generate
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="w-full py-2 bg-indigo-brand hover:bg-indigo-hover text-xs font-semibold text-stardust-text rounded transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {resetting ? 'Updating...' : 'Update Password'}
                  </button>

                  {/* Reset Password Success Display */}
                  {resetSuccessPassword && (
                    <div className="mt-4 p-3 bg-charcoal-sidebar border border-indigo-border rounded space-y-2 text-xs">
                      <div className="text-grey-text font-bold">New Temporary Credentials:</div>
                      <div className="font-mono text-stardust-text bg-charcoal-navbar p-2 rounded break-all select-all">
                        <div>Username: {employee.contact?.officialEmail || employee.userId?.email}</div>
                        <div>Password: {resetSuccessPassword}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const copyText = `Workspace Login details:\nUsername/Email: ${employee.contact?.officialEmail || employee.userId?.email}\nPassword: ${resetSuccessPassword}`;
                          navigator.clipboard.writeText(copyText);
                          toast.success('Credentials copied to clipboard!');
                        }}
                        className="w-full mt-1 py-1.5 bg-indigo-brand/20 hover:bg-indigo-brand border border-indigo-brand/30 text-[10px] font-bold text-indigo-brand hover:text-stardust-text rounded transition-all cursor-pointer text-center"
                      >
                        Copy Credentials to Clipboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
