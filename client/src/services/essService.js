import api from './api';

export const essService = {
  getDashboard: async () => {
    const response = await api.get('/ess/dashboard');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/ess/profile', data);
    return response.data;
  },

  updateProfileSensitive: async (data) => {
    const response = await api.put('/ess/profile/sensitive', data);
    return response.data;
  },

  getPayslips: async () => {
    const response = await api.get('/ess/payslips');
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/ess/documents');
    return response.data;
  },

  getHolidays: async () => {
    const response = await api.get('/ess/holidays');
    return response.data;
  }
};
