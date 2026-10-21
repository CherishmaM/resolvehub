import api from './axios';

export const getActivitiesApi = (issueId) => api.get(`/issues/${issueId}/activities`);
