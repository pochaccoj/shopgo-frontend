import axios from 'axios';
import { authStore, clearAuth, setAccessToken } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const { accessToken } = authStore.get();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = (error.response?.data as { code?: string } | undefined)?.code;
    const shouldTryRefresh =
      !original?._retry &&
      (status === 401 || (status === 400 && (code === '01001' || code === '01002')));

    if (shouldTryRefresh && !String(original?.url ?? '').includes('/auth/refresh')) {
      original._retry = true;
      try {
        const { refreshToken } = authStore.get();
        if (!refreshToken) {
          clearAuth();
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        setAccessToken(data.access_token);
        if (original.headers) {
          original.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(original);
      } catch {
        clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
