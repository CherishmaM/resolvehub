import api from './axios';

export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const logoutApi = () => api.post('/auth/logout');
export const getMeApi = () => api.get('/auth/me');
export const updateProfileApi = (profileData) => api.patch('/auth/profile', profileData);

