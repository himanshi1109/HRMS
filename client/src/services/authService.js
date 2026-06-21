import api from './api';

export const authService = {
  login: async (email, password, tenantSlug) => {
    const response = await api.post('/auth/login', { email, password, tenantSlug });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email, tenantSlug) => {
    const response = await api.post('/auth/forgot-password', { email, tenantSlug });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
