import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { placeOrderSchema } from '../schemas/orderSchema';
import { cartStore, clearCart, removeFromCart, updateCartQuantity } from '../stores/cartStore';

export default function CartPage() {
  const cartItems = useStore(cartStore);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
        note: note || undefined,
      };

      const validated = await placeOrderSchema.validate(payload, { abortEarly: false });
      setLoading(true);
      await ordersApi.place(validated);
      clearCart();
      notifications.show({ color: 'green', title: 'Success', message: 'Order placed successfully' });
      navigate('/orders');
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string; code?: string } } }).response?.data;
      const message = errorData?.code === '06002' ? 'Not enough stock for one or more items' : errorData?.message ?? 'Something went wrong';
      notifications.show({ color: 'red', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={2}>Your Cart</Title>

      {cartItems.length === 0 ? (
        <Card withBorder>
          <Text c="dimmed">Your cart is empty.</Text>
        </Card>
      ) : (
        <Card withBorder shadow="xs" p={0} radius="md">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Subtotal</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cartItems.map((item) => (
                <Table.Tr key={item.product.id}>
                  <Table.Td>{item.product.name}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(value) => updateCartQuantity(item.product.id, Number(value) || 1)}
                      maw={120}
                    />
                  </Table.Td>
                  <Table.Td>${item.product.price.toFixed(2)}</Table.Td>
                  <Table.Td>${(item.product.price * item.quantity).toFixed(2)}</Table.Td>
                  <Table.Td>
                    <ActionIcon color="red" variant="light" onClick={() => removeFromCart(item.product.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Divider />

          <Stack p="lg">
            <Textarea
              label="Order note (optional)"
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
            />

            <Group justify="space-between" align="center">
              <Text fw={700}>Order total: ${total.toFixed(2)}</Text>
              <Button onClick={handlePlaceOrder} loading={loading}>
                Place Order
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
