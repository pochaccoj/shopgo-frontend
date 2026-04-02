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
    if (error.response?.status === 401 && !original?._retry) {
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
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
