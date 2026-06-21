import api from './api';

export const mssService = {
  getDashboard: async () => {
    const response = await api.get('/mss/dashboard');
    return response.data;
  },

  getApprovals: async () => {
    const response = await api.get('/mss/approvals');
    return response.data;
  },

  approveRequest: async (requestId, comment) => {
    const response = await api.post(`/mss/approvals/${requestId}/approve`, { comment });
    return response.data;
  },

  rejectRequest: async (requestId, comment) => {
    const response = await api.post(`/mss/approvals/${requestId}/reject`, { comment });
    return response.data;
  },

  getTeam: async () => {
    const response = await api.get('/mss/team');
    return response.data;
  },

  getTeamAttendance: async (params) => {
    const response = await api.get('/mss/team/attendance', { params });
    return response.data;
  },

  getTeamLeave: async (params) => {
    const response = await api.get('/mss/team/leave', { params });
    return response.data;
  },

  initiateTransfer: async (data) => {
    const response = await api.post('/mss/team/transfer', data);
    return response.data;
  }
};
