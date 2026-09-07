import axios from 'axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerpilot_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('careerpilot_token');
        localStorage.removeItem('careerpilot_user');
        window.dispatchEvent(new Event('careerpilot:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
