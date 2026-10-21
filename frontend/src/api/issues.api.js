import api from './axios';

export const getIssuesApi = (params = {}) => api.get('/issues', { params });
export const getIssueByIdApi = (id) => api.get(`/issues/${id}`);
export const createIssueApi = (issueData) => api.post('/issues', issueData);
export const updateIssueApi = (id, updates) => api.patch(`/issues/${id}`, updates);
export const updateIssueStatusApi = (id, status) => api.patch(`/issues/${id}/status`, { status });
export const assignIssueApi = (id, assignedTo) => api.patch(`/issues/${id}/assign`, { assignedTo });
export const deleteIssueApi = (id) => api.delete(`/issues/${id}`);
