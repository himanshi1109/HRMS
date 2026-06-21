import api from './api';

export const workflowService = {
  getMyApprovals: async (params) => {
    const response = await api.get('/workflow-requests/my-approvals', { params });
    return response.data;
  },

  getWorkflowRequest: async (id) => {
    const response = await api.get(`/workflow-requests/${id}`);
    return response.data;
  },

  approve: async (id, comment) => {
    const response = await api.put(`/workflow-requests/${id}/approve`, { comment });
    return response.data;
  },

  reject: async (id, comment) => {
    const response = await api.put(`/workflow-requests/${id}/reject`, { comment });
    return response.data;
  },

  cancel: async (id, comment) => {
    const response = await api.put(`/workflow-requests/${id}/cancel`, { comment });
    return response.data;
  },

  delegate: async (id, delegateToUserId, comment) => {
    const response = await api.put(`/workflow-requests/${id}/delegate`, { delegateToUserId, comment });
    return response.data;
  }
};
