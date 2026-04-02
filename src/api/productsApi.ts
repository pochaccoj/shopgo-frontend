import api from './axios';
import type { ProductInput } from '../schemas/productSchema';
import { isMockEnabled, mockProductsApi } from './mock';

export interface ProductListParams {
  page?: number;
  limit?: number;
  q?: string;
  category_id?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    isMockEnabled ? mockProductsApi.list(params) : api.get('/products', { params }),
  get: (id: string) =>
    isMockEnabled ? mockProductsApi.get(id) : api.get(`/products/${id}`),
  create: (body: ProductInput) =>
    isMockEnabled ? mockProductsApi.create(body) : api.post('/products', body),
  update: (id: string, body: ProductInput) =>
    isMockEnabled ? mockProductsApi.update(id, body) : api.put(`/products/${id}`, body),
  remove: (id: string) =>
    isMockEnabled ? mockProductsApi.remove(id) : api.delete(`/products/${id}`),
};
