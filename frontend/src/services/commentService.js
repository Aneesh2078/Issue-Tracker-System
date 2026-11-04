import api from './api';

export const commentService = {
  async getCommentsByIssue(issueId) {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  async addComment(issueId, text) {
    const response = await api.post(`/issues/${issueId}/comments`, { text });
    return response.data;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

