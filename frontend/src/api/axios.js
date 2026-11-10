import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage for mobile & cross-origin reliability
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('fixflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // In case localStorage is blocked or restricted in private browsing mode
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error handling and handle unauthorized sessions
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('fixflow_token');
        localStorage.removeItem('fixflow_user');
      } catch (e) {}
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const rawErrors = error.response?.data?.errors;
    const formattedErrorMessages =
      Array.isArray(rawErrors) && rawErrors.length > 0
        ? rawErrors.map((e) => e.message || e.msg || e).filter(Boolean).join('. ')
        : null;

    const errorPayload = {
      message:
        formattedErrorMessages ||
        error.response?.data?.message ||
        error.message ||
        'A network or server error occurred.',
      errors: Array.isArray(rawErrors) ? rawErrors : [],
      statusCode: error.response?.status || 500,
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
