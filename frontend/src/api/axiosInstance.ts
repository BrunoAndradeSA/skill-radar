import axios from 'axios';
import { useUserStore } from '../store/useUserStore';
import { transformKeysToCamel, transformKeysToSnake } from '../utils/api/case-transform';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && typeof config.data === 'object') {
      config.data = transformKeysToSnake(config.data);
    }

    if (config.params) {
      config.params = transformKeysToSnake(config.params);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

function isDefaultResponse(body: unknown): body is { data: unknown } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'data' in body &&
    'code' in body &&
    'description' in body
  );
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if (isDefaultResponse(response.data)) {
        response.data = response.data.data;
      }
      response.data = transformKeysToCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url: string = originalRequest.url || '';
      const isLoginFlow = url === '/auth/login' || url === '/auth/refresh' || url === '/auth/token';
      const store = useUserStore.getState();

      if (isLoginFlow) {
        store.logout();
        return Promise.reject(new Error('Sessão expirada'));
      }

      if (!store.refreshToken) {
        const hadToken = !!store.token;
        store.logout();
        if (hadToken && !window.location.pathname.startsWith('/login')) {
          sessionStorage.setItem('session_expired', '1');
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Sessão expirada'));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post('/auth/refresh', {
          refresh_token: store.refreshToken,
        }, {
          baseURL: axiosInstance.defaults.baseURL,
          headers: { 'Content-Type': 'application/json' },
        });

        const { accessToken, refreshToken } = response.data as {
          accessToken: string;
          refreshToken: string;
        };

        useUserStore.getState().setTokens(accessToken, refreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().logout();
        if (!window.location.pathname.startsWith('/login')) {
          sessionStorage.setItem('session_expired', '1');
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Sessão expirada'));
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data) {
      const body = transformKeysToCamel(error.response.data) as Record<string, unknown>;
      const message = (body.description as string) || error.message;
      return Promise.reject(new Error(message));
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Servidor indisponível. Tente novamente mais tarde.'));
    }
    return Promise.reject(error);
  },
);
