import api from './axios';
import type { UpdateRoleInput } from '../schemas/userSchema';
import { isMockEnabled, mockUsersApi } from './mock';

export const usersApi = {
  list: (q?: string) =>
    isMockEnabled ? mockUsersApi.list(q) : api.get('/users', { params: { q } }),
  get: (id: string) =>
    isMockEnabled ? mockUsersApi.get(id) : api.get(`/users/${id}`),
  updateRole: (id: string, body: UpdateRoleInput) =>
    isMockEnabled ? mockUsersApi.updateRole(id, body) : api.put(`/users/${id}/role`, body),
};
