import api from './axios';
import type { CategoryInput } from '../schemas/categorySchema';
import { isMockEnabled, mockCategoriesApi } from './mock';

export const categoriesApi = {
  list: () => (isMockEnabled ? mockCategoriesApi.list() : api.get('/categories')),
  create: (body: CategoryInput) =>
    isMockEnabled ? mockCategoriesApi.create(body) : api.post('/categories', body),
  update: (id: number, body: CategoryInput) =>
    isMockEnabled ? mockCategoriesApi.update(id, body) : api.put(`/categories/${id}`, body),
  remove: (id: number) =>
    isMockEnabled ? mockCategoriesApi.remove(id) : api.delete(`/categories/${id}`),
};
