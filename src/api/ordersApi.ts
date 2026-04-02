import api from './axios';
import type { PlaceOrderInput, UpdateOrderStatusInput } from '../schemas/orderSchema';
import type { OrderStatus } from '../types';
import { isMockEnabled, mockOrdersApi } from './mock';

export const ordersApi = {
  place: (body: PlaceOrderInput) =>
    isMockEnabled ? mockOrdersApi.place(body) : api.post('/orders', body),
  list: (status?: OrderStatus) =>
    isMockEnabled ? mockOrdersApi.list(status) : api.get('/orders', { params: { status } }),
  get: (id: string) =>
    isMockEnabled ? mockOrdersApi.get(id) : api.get(`/orders/${id}`),
  cancel: (id: string) =>
    isMockEnabled ? mockOrdersApi.cancel(id) : api.post(`/orders/${id}/cancel`),
  updateStatus: (id: string, body: UpdateOrderStatusInput) =>
    isMockEnabled
      ? mockOrdersApi.updateStatus(id, body)
      : api.patch(`/orders/${id}/status`, body),
};
