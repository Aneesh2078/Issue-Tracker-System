import api from './api';

export const issueService = {
  async getIssues(params = {}) {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  async getIssueById(id) {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  async createIssue(issueData) {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  async updateIssue(id, issueData) {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
  },

  async deleteIssue(id) {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },

  async assignIssue(id, assignedTo) {
    const response = await api.put(`/issues/${id}/assign`, { assignedTo });
    return response.data;
  },

  async updateIssueStatus(id, status) {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  }
};

