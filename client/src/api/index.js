import axios from 'axios'

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem('hrms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/logout')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('hrms_token')
      localStorage.removeItem('hrms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  setupCompany: (data) => API.post('/auth/setup-company', data),
  logout: () => API.post('/auth/logout')
}

export const employeeAPI = {
  getAll: (params) => API.get('/employees', { params }),
  getById: (id) => API.get(`/employees/${id}`),
  create: (data) => API.post('/employees', data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`),
  exit: (id, data) => API.post(`/employees/${id}/exit`, data),
  getTimeline: (id) => API.get(`/employees/${id}/timeline`),
  promote: (id, data) => API.post(`/employees/${id}/promote`, data),
  transfer: (id, data) => API.post(`/employees/${id}/transfer`, data),
}

export const attendanceAPI = {
  getTodaySummary: () => API.get('/attendance/dashboard'),
  punchIn: (data) => API.post('/attendance/punch', { source: 'WEB', location: 'Main Office', ...data }),
  punchOut: () => API.post('/attendance/punch'),
  getMyToday: () => {
    const now = new Date();
    const month = now.toISOString().slice(0, 7); // YYYY-MM
    return API.get('/attendance/my', { params: { month } }).then(res => {
      const todayStr = now.toDateString();
      const records = res.data?.data || [];
      const todayRecord = records.find(r => new Date(r.date).toDateString() === todayStr) || null;
      return { ...res, data: todayRecord };
    });
  },
  getMuster: (params) => {
    let month = params?.month && params?.year 
      ? `${params.year}-${String(params.month).padStart(2, '0')}` 
      : new Date().toISOString().slice(0, 7);
    return API.get('/attendance/muster', { params: { month } });
  },
  getMyMonth: (params) => {
    let month = params?.month && params?.year 
      ? `${params.year}-${String(params.month).padStart(2, '0')}` 
      : new Date().toISOString().slice(0, 7);
    return API.get('/attendance/my', { params: { month } });
  },
  getTeamAttendance: (params) => API.get('/attendance/team', { params }),
  getAll: (params) => API.get('/attendance/all', { params }),
  regularize: (data) => API.post('/attendance/regularize', data),
  getMyRegularizations: () => API.get('/attendance/regularize/my'),
  getPendingRegularizations: () => API.get('/attendance/regularize/pending'),
  approveRegularization: (id, data) => API.put(`/attendance/regularize/${id}/approve`, data),
  rejectRegularization: (id, data) => API.put(`/attendance/regularize/${id}/reject`, data),
  updateRecord: (id, data) => API.put(`/attendance/${id}`, data)
}

export const leaveAPI = {
  getMy: () => API.get('/leave-requests/requests/my'),
  getAll: (params) => API.get('/leave-requests/requests/all', { params }),
  getMyBalance: () => API.get('/leave-requests/balances/my'),
  getEmployeeBalance: (id) => API.get(`/leave-requests/balances/employee/${id}`),
  apply: (data) => API.post('/leave-requests/requests', {
    leaveTypeId: data.leaveType,
    startDate: data.fromDate,
    endDate: data.toDate,
    reason: data.reason,
    isHalfDay: data.isHalfDay || false
  }),
  update: (id, data) => API.put(`/leave-requests/requests/${id}/cancel`, data)
}

export const approvalAPI = {
  getPending: () => API.get('/workflow-requests/my-approvals'),
  getHistory: () => API.get('/workflow-requests/my-approvals').then(res => ({
    ...res,
    data: { ...res.data, data: [] } // history fallback
  })),
  approve: (id, data) => API.put(`/workflow-requests/${id}/approve`, data),
  reject: (id, data) => API.put(`/workflow-requests/${id}/reject`, data)
}

export const notificationAPI = {
  getAll: (params) => API.get('/notifications/my', { params }),
  markAllRead: () => API.put('/notifications/read-all'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  getUnreadCount: () => API.get('/notifications/unread-count')
}

export const reportAPI = {
  getHeadcount: (params) => API.get('/reports/headcount', { params: { groupBy: 'department', ...params } }),
  getAttendance: (params) => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return API.get('/reports/attendance/summary', { params: { month, ...params } });
  },
  getLeave: (params) => {
    const year = new Date().getFullYear();
    return API.get('/reports/leave/usage', { params: { year, ...params } });
  },
  getAttrition: (params) => {
    const year = new Date().getFullYear();
    return API.get('/reports/attrition', { params: { year, ...params } });
  }
}

export const orgAPI = {
  getDepartments: () => API.get('/departments'),
  getDesignations: () => API.get('/designations'),
  getLocations: () => API.get('/locations'),
  getGrades: () => API.get('/grades'),
  getOrganization: () => API.get('/organizations'),
  updateOrganization: (data) => API.put('/organizations', data)
}

export const essAPI = {
  getProfile: () => API.get('/ess/dashboard').then(res => ({
    ...res,
    data: res.data?.data?.profile || res.data
  })),
  updateProfile: (data) => API.put('/ess/profile', data),
  getLeaveBalance: () => API.get('/leave-requests/balances/my'),
  getMyAttendance: (params) => {
    let month = params?.month && params?.year 
      ? `${params.year}-${String(params.month).padStart(2, '0')}` 
      : new Date().toISOString().slice(0, 7);
    return API.get('/attendance/my', { params: { month } });
  }
}

export const mssAPI = {
  getTeam: () => API.get('/mss/team'),
  getTeamAttendance: (params) => API.get('/mss/team/attendance', { params }),
  getPendingApprovals: () => API.get('/mss/approvals')
}

export const compensationAPI = {
  getMyCompensation: () => API.get('/employees/my/compensation'),
  getEmployeeCompensation: (id) => API.get(`/employees/${id}/compensation`),
  getPayslips: (id, params) => API.get(`/employees/${id}/payslips`, { params }),
  getPayslipDetail: (id, yearMonth) => API.get(`/employees/${id}/payslips/${yearMonth}`)
}

export default API
