import api from './api';

export const employeeService = {
  getEmployees: async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  updateEmployeePersonal: async (id, data) => {
    const response = await api.put(`/employees/${id}/personal`, data);
    return response.data;
  },

  updateEmployeeSensitive: async (id, data) => {
    const response = await api.put(`/employees/${id}/sensitive`, data);
    return response.data;
  },

  getOrgChart: async () => {
    const response = await api.get('/employees/org-chart');
    return response.data;
  },

  getDirectory: async (params) => {
    const response = await api.get('/employees/directory', { params });
    return response.data;
  },

  uploadDocument: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/employees/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (id, docId) => {
    const response = await api.delete(`/employees/${id}/documents/${docId}`);
    return response.data;
  },

  confirmEmployee: async (id) => {
    const response = await api.post(`/employees/${id}/confirm`);
    return response.data;
  },

  transferEmployee: async (id, data) => {
    const response = await api.post(`/employees/${id}/transfer`, data);
    return response.data;
  },

  promoteEmployee: async (id, data) => {
    const response = await api.post(`/employees/${id}/promote`, data);
    return response.data;
  },

  exitEmployee: async (id, data) => {
    const response = await api.post(`/employees/${id}/exit`, data);
    return response.data;
  },

  getTimeline: async (id) => {
    const response = await api.get(`/employees/${id}/timeline`);
    return response.data;
  },

  resetEmployeePassword: async (id, newPassword) => {
    const response = await api.post(`/employees/${id}/reset-password`, { newPassword });
    return response.data;
  }
};
