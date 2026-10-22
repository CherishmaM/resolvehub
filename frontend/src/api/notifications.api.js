import api from './axios';

export const getNotificationsApi = (params = {}) =>
  api.get('/notifications', { params });

export const markNotificationReadApi = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsReadApi = () =>
  api.patch('/notifications/mark-all-read');
