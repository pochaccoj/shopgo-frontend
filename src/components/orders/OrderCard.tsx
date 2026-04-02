import { Card, Group, Stack, Text } from '@mantine/core';
import OrderStatusBadge from './OrderStatusBadge';
import type { Order } from '../../types';

interface Props {
  order: Order;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: Props) {
  return (
    <Card withBorder shadow="sm" p="md" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Text fw={600}>Order {order.id}</Text>
          <Text size="sm" c="dimmed">
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </Stack>

        <Group>
          <Text fw={700}>${order.total_amount.toFixed(2)}</Text>
          <OrderStatusBadge status={order.status} />
        </Group>
      </Group>
    </Card>
  );
}
