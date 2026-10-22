import api from './axios';

export const getUsersApi = () => api.get('/users');
export const createUserApi = (userData) => api.post('/users', userData);
export const updateUserRoleApi = (id, role) => api.patch(`/users/${id}/role`, { role });
export const deleteUserApi = (id) => api.delete(`/users/${id}`);
