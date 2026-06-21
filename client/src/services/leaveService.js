import api from './api';

export const leaveService = {
  getLeaveTypes: async () => {
    const response = await api.get('/leave-requests/types');
    return response.data;
  },

  getMyBalances: async () => {
    const response = await api.get('/leave-requests/balances/my');
    return response.data;
  },

  getEmployeeBalances: async (id) => {
    const response = await api.get(`/leave-requests/balances/employee/${id}`);
    return response.data;
  },

  getTeamBalances: async () => {
    const response = await api.get('/leave-requests/balances/team');
    return response.data;
  },

  applyLeave: async (data) => {
    const response = await api.post('/leave-requests/requests', data);
    return response.data;
  },

  getMyRequests: async (params) => {
    const response = await api.get('/leave-requests/requests/my', { params });
    return response.data;
  },

  getTeamRequests: async (params) => {
    const response = await api.get('/leave-requests/requests/team', { params });
    return response.data;
  },

  getAllRequests: async (params) => {
    const response = await api.get('/leave-requests/requests/all', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/leave-requests/requests/${id}`);
    return response.data;
  },

  cancelRequest: async (id, comment) => {
    const response = await api.put(`/leave-requests/requests/${id}/cancel`, { comment });
    return response.data;
  },

  withdrawRequest: async (id) => {
    const response = await api.put(`/leave-requests/requests/${id}/withdraw`);
    return response.data;
  },

  getMyCalendar: async (params) => {
    const response = await api.get('/leave-requests/calendar/my', { params });
    return response.data;
  },

  getTeamCalendar: async (params) => {
    const response = await api.get('/leave-requests/calendar/team', { params });
    return response.data;
  }
};
