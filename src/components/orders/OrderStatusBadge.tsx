import { Badge } from '@mantine/core';
import type { OrderStatus } from '../../types';

interface Props {
  status: OrderStatus;
}

const statusMap: Record<OrderStatus, { color: string; label: string }> = {
  pending: { color: 'yellow', label: 'Pending' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  shipped: { color: 'cyan', label: 'Shipped' },
  delivered: { color: 'green', label: 'Delivered' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

export default function OrderStatusBadge({ status }: Props) {
  const config = statusMap[status];
  return <Badge color={config.color}>{config.label}</Badge>;
}
