import api from './api';

export const reportService = {
  getHeadcount: async (params) => {
    const response = await api.get('/reports/headcount', { params });
    return response.data;
  },

  getAttendanceSummary: async (params) => {
    const response = await api.get('/reports/attendance/summary', { params });
    return response.data;
  },

  getLateReport: async (params) => {
    const response = await api.get('/reports/attendance/late', { params });
    return response.data;
  },

  getAbsentReport: async (params) => {
    const response = await api.get('/reports/attendance/absent', { params });
    return response.data;
  },

  getOvertimeReport: async (params) => {
    const response = await api.get('/reports/attendance/overtime', { params });
    return response.data;
  },

  getLeaveBalances: async (params) => {
    const response = await api.get('/reports/leave/balances', { params });
    return response.data;
  },

  getLeaveUsage: async (params) => {
    const response = await api.get('/reports/leave/usage', { params });
    return response.data;
  },

  getLeaveLop: async (params) => {
    const response = await api.get('/reports/leave/lop', { params });
    return response.data;
  },

  getAttrition: async (params) => {
    const response = await api.get('/reports/attrition', { params });
    return response.data;
  },

  getHrDashboard: async () => {
    const response = await api.get('/reports/dashboard/hr');
    return response.data;
  },

  getLeadershipDashboard: async () => {
    const response = await api.get('/reports/dashboard/leadership');
    return response.data;
  }
};
