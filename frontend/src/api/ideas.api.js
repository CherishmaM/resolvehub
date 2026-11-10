import api from './axios';

export const getIdeasApi = (params = {}) => api.get('/ideas', { params });
export const getIdeaStatsApi = () => api.get('/ideas/stats');
export const getIdeaByIdApi = (id) => api.get(`/ideas/${id}`);
export const createIdeaApi = (ideaData) => api.post('/ideas', ideaData);
export const updateIdeaApi = (id, updates) => api.patch(`/ideas/${id}`, updates);
export const deleteIdeaApi = (id) => api.delete(`/ideas/${id}`);
export const toggleUpvoteApi = (id) => api.patch(`/ideas/${id}/upvote`);
export const updateStageApi = (id, stage) => api.patch(`/ideas/${id}/stage`, { stage });
export const addIdeaCommentApi = (id, text) => api.post(`/ideas/${id}/comments`, { text });
export const deleteIdeaCommentApi = (id, commentId) =>
  api.delete(`/ideas/${id}/comments/${commentId}`);
export const convertIdeaToIssueApi = (id) => api.post(`/ideas/${id}/convert`);
