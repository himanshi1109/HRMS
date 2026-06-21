import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { usePagination } from '../../hooks/usePagination';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { Spinner } from '../../components/common/Loader';
import {
  Grid,
  List,
  Search,
  UserPlus,
  Download,
  Filter,
  Eye,
  CheckCircle,
  Building,
  Building2,
  MapPin,
  X,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const getRoleLabel = (role) => {
  const norm = (role || '').toUpperCase();
  if (norm === 'HR_ADMIN') return 'HR Admin';
  if (norm === 'MANAGER') return 'Manager';
  if (norm === 'LEADERSHIP') return 'CEO';
  return 'Employee';
};

export const EmployeeList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(1); // 1 = Personal, 2 = Employment, 3 = Docs
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Pagination hook
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters,
    handlePageChange,
    handleSearchChange,
    handleSort,
    handleFilterChange,
    getQueryParams,
  } = usePagination(10);

  // Load employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = getQueryParams();
      const response = await employeeService.getEmployees(params);
      if (response?.success && response?.data) {
        // Handle pagination response
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
          setTotalPages(1);
        } else {
          setEmployees(response.data.docs || []);
          setTotalPages(response.data.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching employees list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    const handleUpdate = () => {
      loadEmployees();
    };
    window.addEventListener('employee-updated', handleUpdate);
    return () => window.removeEventListener('employee-updated', handleUpdate);
  }, []);

  // Add Employee Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'MALE',
      dateOfBirth: '',
      employeeId: '',
      departmentName: '',
      designationName: '',
      locationName: '',
      dateOfJoining: '',
      salary: '',
    },
  });

  const onSubmitEmployee = async (formData) => {
    try {
      setLoading(true);
      // Map to backend schema structures
      const payload = {
        employeeId: formData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        personal: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        },
        employment: {
          departmentName: formData.departmentName,
          designationName: formData.designationName,
          locationName: formData.locationName,
          dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
          salary: Number(formData.salary) || 0,
        },
      };

      const response = await employeeService.createEmployee(payload);
      if (response?.success) {
        toast.success('Employee created successfully');
        setIsAddOpen(false);
        setAddStep(1);
        reset();
        await loadEmployees();
        window.dispatchEvent(new CustomEvent('employee-updated'));
      }
    } catch (err) {
      console.error('Error creating employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setAddStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setAddStep((prev) => Math.max(prev - 1, 1));

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      sortable: true,
    },
    {
      header: 'Name',
      accessor: 'personal',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.personal?.firstName} ${row.personal?.lastName}`} size="sm" />
          <span className="font-semibold text-stardust-text">
            {row.personal?.firstName} {row.personal?.lastName}
          </span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'employment',
      render: (val) => val?.departmentId?.name || val?.departmentName || 'General',
    },
    {
      header: 'Designation',
      accessor: 'employment',
      render: (val) => val?.designationId?.title || val?.designationName || 'Staff',
    },
    {
      header: 'Location',
      accessor: 'employment',
      render: (val) => val?.locationId?.name || val?.locationName || 'Main HQ',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge status={val || 'ACTIVE'} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (val) => (
        <button
          onClick={() => navigate(`/employees/${val}`)}
          className="p-1 rounded text-grey-text hover:text-indigo-brand hover:bg-indigo-muted/20 transition-colors cursor-pointer"
          title="View profile details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stardust-text">Employee Directory</h2>
          <p className="text-sm text-grey-text mt-1">Manage active workspace members and profiles</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-all cursor-pointer shadow-lg shadow-indigo-brand/10"
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and View Mode Toggles */}
      <div className="bg-charcoal-sidebar border border-indigo-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-text w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID, Name or Email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors placeholder:text-grey-placeholder"
          />
        </div>

        {/* Filters and View controls */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          {/* Status filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-xs text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="EXITED">Exited</option>
          </select>

          {/* Grid/Table view toggles */}
          <div className="flex bg-charcoal-navbar border border-indigo-border rounded-lg p-0.5 select-none">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-indigo-brand text-stardust-text' : 'text-grey-text hover:text-stardust-text'
              } transition-colors cursor-pointer`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-indigo-brand text-stardust-text' : 'text-grey-text hover:text-stardust-text'
              } transition-colors cursor-pointer`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Display List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'table' ? (
        <Table
          columns={columns}
          data={employees}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: handlePageChange,
          }}
        />
      ) : (
        /* Grid Layout */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
            {employees.length === 0 ? (
              <p className="col-span-full text-center text-grey-text py-12">No records found.</p>
            ) : (
              employees.map((emp) => {
                const fullName = `${emp.personal?.firstName} ${emp.personal?.lastName}`;
                return (
                  <div
                    key={emp._id}
                    onClick={() => navigate(`/employees/${emp._id}`)}
                    className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-5 shadow-lg relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-brand min-h-[220px] cursor-pointer select-none"
                  >
                    {/* Role badge top right */}
                    <div className="absolute top-4 right-4">
                      <Badge status={getRoleLabel(emp.userId?.role || 'EMPLOYEE')} />
                    </div>

                    {/* Avatar, Name, Designation, ID */}
                    <div className="mt-2 flex flex-col items-center w-full">
                      <Avatar name={fullName} size="lg" />
                      <h3 className="text-base font-bold text-stardust-text mt-3 leading-tight truncate max-w-[170px]" title={fullName}>
                        {fullName}
                      </h3>
                      <span className="text-xs text-grey-text mt-1 leading-normal truncate max-w-[180px]">
                        {emp.employment?.designationId?.name || emp.employment?.designationName || '—'}
                      </span>
                      <span className="text-[10px] text-grey-placeholder mt-1 font-mono">
                        #{emp.employeeId || '—'}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="w-full my-3 border-t border-indigo-border/30" />

                    {/* Department Row */}
                    <div className="flex items-center gap-1 text-xs text-grey-text mb-3">
                      <Building2 size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {emp.employment?.departmentId?.name || emp.employment?.departmentName || 'No Department'}
                      </span>
                    </div>

                    {/* Status Badge bottom */}
                    <div className="mt-auto">
                      <Badge status={emp.status || 'ACTIVE'} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Multi-step Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAddStep(1);
          reset();
        }}
        title="Add Workspace Employee"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            {addStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-border text-stardust-text hover:bg-charcoal-navbar transition-colors cursor-pointer"
              >
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {addStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text transition-colors cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmitEmployee)}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all cursor-pointer"
              >
                Complete & Save
              </button>
            )}
          </div>
        }
      >
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8 select-none">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 flex items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                  addStep >= step
                    ? 'bg-indigo-brand text-stardust-text'
                    : 'bg-charcoal-navbar border border-indigo-border text-grey-text'
                }`}
              >
                {step}
              </div>
              <span
                className={`ml-3 text-xs font-semibold uppercase tracking-wider hidden sm:block ${
                  addStep >= step ? 'text-stardust-text' : 'text-grey-text'
                }`}
              >
                {step === 1 ? 'Personal' : step === 2 ? 'Employment' : 'Complete'}
              </span>
              {step < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    addStep > step ? 'bg-indigo-brand' : 'bg-indigo-border/40'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Forms */}
        <form className="space-y-5">
          {addStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">First Name</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
                {errors.firstName && <span className="text-[10px] text-[#704A3C]">{errors.firstName.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Last Name</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
                {errors.lastName && <span className="text-[10px] text-[#704A3C]">{errors.lastName.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Work Email</label>
                <input
                  {...register('email', { required: 'Work email is required' })}
                  type="email"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
                {errors.email && <span className="text-[10px] text-[#704A3C]">{errors.email.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Mobile Number</label>
                <input
                  {...register('phone')}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Date of Birth</label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Employee ID</label>
                <input
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  type="text"
                  placeholder="e.g. EMP-028"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
                {errors.employeeId && <span className="text-[10px] text-[#704A3C]">{errors.employeeId.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Department</label>
                <input
                  {...register('departmentName', { required: 'Department name is required' })}
                  type="text"
                  placeholder="e.g. Engineering"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Designation</label>
                <input
                  {...register('designationName', { required: 'Designation title is required' })}
                  type="text"
                  placeholder="e.g. Frontend Engineer"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Location</label>
                <input
                  {...register('locationName', { required: 'Location is required' })}
                  type="text"
                  placeholder="e.g. Bangalore"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Date of Joining</label>
                <input
                  {...register('dateOfJoining')}
                  type="date"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Salary (Base)</label>
                <input
                  {...register('salary')}
                  type="number"
                  placeholder="INR"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm focus:outline-none focus:border-indigo-brand text-stardust-text"
                />
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-indigo-brand/10 border border-indigo-brand/20 text-indigo-brand flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold">Ready to Save</h3>
              <p className="text-sm text-grey-text max-w-sm mx-auto">
                Check and confirm all provided information. You will be able to upload identification documents on the employee's detail profile page.
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeList;
