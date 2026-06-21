import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../utils/constants';

export const getAccessToken = () => {
  return sessionStorage.getItem('accessToken') || '';
};

export const setAccessToken = (token) => {
  if (token) {
    sessionStorage.setItem('accessToken', token);
  } else {
    sessionStorage.removeItem('accessToken');
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh & error toasts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip toast if it is a request that handles its own errors or is a silent check
    const silent = originalRequest.headers?._silent || false;

    // Check if unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue the requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        try {
          // Trigger refresh API using raw Axios to avoid interceptor loop
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken: storedRefreshToken },
            {
              headers: {
                Authorization: `Bearer ${getAccessToken()}`,
              },
            }
          );
          
          if (response.data?.success && response.data?.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            setAccessToken(newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            processQueue(null, newAccessToken);
            isRefreshing = false;
            
            // Retry the original request
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Clear session and redirect to login
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setAccessToken('');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        // Redirect to login if no refresh token
        setAccessToken('');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle standard API errors and show toast notifications
    if (!silent) {
      const errMsg = error.response?.data?.message || error.message || 'An error occurred';
      // Don't show toast for expired token 401 requests since they will be retried
      if (error.response?.status !== 401) {
        toast.error(errMsg);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
