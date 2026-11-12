import api from './axios';

export const getProjectsApi = () => api.get('/projects');

export const getProjectByIdApi = (id) => api.get(`/projects/${id}`);

export const createProjectApi = (projectData) => api.post('/projects', projectData);

export const updateProjectApi = (id, updates) => api.patch(`/projects/${id}`, updates);

export const deleteProjectApi = (id) => api.delete(`/projects/${id}`);

export const addProjectMemberApi = (id, memberData) => api.post(`/projects/${id}/members`, memberData);

export const updateProjectMemberRoleApi = (id, userId, role) =>
  api.patch(`/projects/${id}/members/${userId}`, { role });

export const removeProjectMemberApi = (id, userId) =>
  api.delete(`/projects/${id}/members/${userId}`);

export const getProjectStatsApi = (id) => api.get(`/projects/${id}/stats`);
