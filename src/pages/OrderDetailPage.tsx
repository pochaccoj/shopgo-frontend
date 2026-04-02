import {
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { updateOrderStatusSchema } from '../schemas/orderSchema';
import { authStore } from '../stores/authStore';
import type { Order } from '../types';

const nextStatusMap: Record<string, Array<'confirmed' | 'shipped' | 'delivered'>> = {
  pending: ['confirmed'],
  confirmed: ['shipped'],
  shipped: ['delivered'],
};

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'id' in value && 'status' in value && 'total_amount' in value && 'created_at' in value;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore(authStore);

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const nextStatuses = useMemo(() => {
    if (!order) {
      return [];
    }

    return nextStatusMap[order.status] ?? [];
  }, [order]);

  const loadOrder = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await ordersApi.get(id);
      const payload = response.data as unknown;
      const extracted =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data?: unknown }).data
          : payload;
      const resolved: Order | null = isOrder(extracted) ? extracted : null;

      setOrder(resolved);
      if (resolved) {
        setSelectedStatus(nextStatusMap[resolved.status]?.[0] ?? null);
      }
    } catch (err: unknown) {
      const responseStatus = (err as { response?: { status?: number; data?: { message?: string } } }).response?.status;
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load order';
      notifications.show({ color: 'red', title: 'Error', message });
      if (responseStatus === 403) {
        navigate('/orders');
      }
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  if (!order) {
    return <Text>Loading order...</Text>;
  }

  const isAdmin = user?.role === 'admin';

  const handleCancelOrder = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      await ordersApi.cancel(id);
      notifications.show({ color: 'green', title: 'Success', message: 'Order cancelled' });
      setCancelModalOpen(false);
      await loadOrder();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to cancel order';
      notifications.show({ color: 'red', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus) {
      return;
    }

    try {
      const body = await updateOrderStatusSchema.validate({ status: selectedStatus });
      setLoading(true);
      await ordersApi.updateStatus(id, body);
      notifications.show({ color: 'green', title: 'Success', message: 'Order status updated' });
      await loadOrder();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        (err instanceof Error ? err.message : 'Failed to update status');
      notifications.show({ color: 'red', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={2}>Order Detail</Title>

      <Card withBorder>
        <Stack>
          <Group justify="space-between">
            <Text fw={600}>Order ID: {order.id}</Text>
            <OrderStatusBadge status={order.status} />
          </Group>
          <Text>Date: {new Date(order.created_at).toLocaleString()}</Text>
          <Text>Note: {order.note || '-'}</Text>
          <Text fw={700}>Total: ${order.total_amount.toFixed(2)}</Text>
        </Stack>
      </Card>

      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Product</Table.Th>
            <Table.Th>Quantity</Table.Th>
            <Table.Th>Unit Price</Table.Th>
            <Table.Th>Subtotal</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(order.items ?? []).map((item) => (
            <Table.Tr key={`${item.product_id}-${item.name ?? 'item'}`}>
              <Table.Td>{item.name ?? item.product_id}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
              <Table.Td>${item.unit_price.toFixed(2)}</Table.Td>
              <Table.Td>${(item.quantity * item.unit_price).toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {!isAdmin && order.status === 'pending' && (
        <Button color="red" variant="light" onClick={() => setCancelModalOpen(true)}>
          Cancel Order
        </Button>
      )}

      {isAdmin && nextStatuses.length > 0 && (
        <Card withBorder>
          <Stack>
            <Select
              label="Next status"
              data={nextStatuses.map((value) => ({ value, label: value }))}
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowDeselect={false}
            />
            <Button onClick={handleUpdateStatus} loading={loading}>
              Update Status
            </Button>
          </Stack>
        </Card>
      )}

      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm cancellation"
      >
        <Stack>
          <Text>Are you sure you want to cancel this order?</Text>
          <Button color="red" onClick={handleCancelOrder} loading={loading}>
            Yes, cancel order
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
