import { Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import OrderCard from '../components/orders/OrderCard';
import type { Order, OrderStatus } from '../types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await ordersApi.list(status ?? undefined);
        const payload = response.data as { data?: Order[]; items?: Order[] } | Order[];
        if (Array.isArray(payload)) {
          setOrders(payload);
        } else {
          setOrders(payload.items ?? payload.data ?? []);
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Failed to load orders';
        notifications.show({ color: 'red', title: 'Error', message });
      }
    };

    void loadOrders();
  }, [status]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Orders</Title>
        <Select
          placeholder="Filter by status"
          value={status}
          clearable
          onChange={(value) => setStatus((value as OrderStatus | null) ?? null)}
          data={[
            { value: 'pending', label: 'pending' },
            { value: 'confirmed', label: 'confirmed' },
            { value: 'shipped', label: 'shipped' },
            { value: 'delivered', label: 'delivered' },
            { value: 'cancelled', label: 'cancelled' },
          ]}
        />
      </Group>

      {orders.length === 0 ? (
        <Card withBorder>
          <Text c="dimmed">No orders found.</Text>
        </Card>
      ) : (
        <Stack>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
