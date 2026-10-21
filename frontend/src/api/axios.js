import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = {
      message:
        error.response?.data?.message ||
        error.message ||
        'A network or server error occurred.',
      errors: error.response?.data?.errors || [],
      statusCode: error.response?.status || 500,
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
