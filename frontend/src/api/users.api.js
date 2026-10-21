import api from './axios';

export const getUsersApi = () => api.get('/users');
export const updateUserRoleApi = (id, role) => api.patch(`/users/${id}/role`, { role });
