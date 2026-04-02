import api from './axios';
import type { RegisterInput, LoginInput } from '../schemas/authSchema';
import { isMockEnabled, mockAuthApi } from './mock';

export const authApi = {
  register: (body: RegisterInput) =>
    isMockEnabled ? mockAuthApi.register(body) : api.post('/auth/register', body),
  login: (body: LoginInput) =>
    isMockEnabled ? mockAuthApi.login(body) : api.post('/auth/login', body),
  refresh: (refreshToken: string) =>
    isMockEnabled
      ? mockAuthApi.refresh(refreshToken)
      : api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => (isMockEnabled ? mockAuthApi.me() : api.get('/auth/me')),
};
