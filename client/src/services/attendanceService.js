import api from './api';

export const attendanceService = {
  punch: async (data = {}) => {
    // Punch requires latitude, longitude, and deviceId (or dummy values)
    const payload = {
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      deviceId: data.deviceId || 'WEB_BROWSER',
      ...data
    };
    const response = await api.post('/attendance/punch', payload);
    return response.data;
  },

  getMyAttendance: async (params) => {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  },

  getTeamAttendance: async (params) => {
    const response = await api.get('/attendance/team', { params });
    return response.data;
  },

  getAllAttendance: async (params) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },

  getAttendanceSummary: async (params) => {
    const response = await api.get('/attendance/summary', { params });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/attendance/dashboard');
    return response.data;
  },

  getMuster: async (params) => {
    const response = await api.get('/attendance/muster', { params });
    return response.data;
  },

  regularize: async (data) => {
    const response = await api.post('/attendance/regularize', data);
    return response.data;
  },

  getMyRegularizations: async () => {
    const response = await api.get('/attendance/regularize/my');
    return response.data;
  },

  getPendingRegularizations: async () => {
    const response = await api.get('/attendance/regularize/pending');
    return response.data;
  },

  approveRegularization: async (id, comment) => {
    const response = await api.put(`/attendance/regularize/${id}/approve`, { comment });
    return response.data;
  },

  rejectRegularization: async (id, comment) => {
    const response = await api.put(`/attendance/regularize/${id}/reject`, { comment });
    return response.data;
  },

  getHolidays: async () => {
    const response = await api.get('/attendance/holidays');
    return response.data;
  }
};
