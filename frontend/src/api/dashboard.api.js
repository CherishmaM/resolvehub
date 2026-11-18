import api from './axios';

export const getDashboardStatsApi = (params = {}) => api.get('/dashboard/stats', { params });
