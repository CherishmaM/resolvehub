import api from './axios';

export const getCommentsApi = (issueId) => api.get(`/issues/${issueId}/comments`);
export const addCommentApi = (issueId, text) => api.post(`/issues/${issueId}/comments`, { text });
