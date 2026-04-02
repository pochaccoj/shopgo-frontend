import {
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { addToCart } from '../stores/cartStore';
import type { Product } from '../types';

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'id' in value && 'name' in value && 'price' in value && 'stock' in value;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        return;
      }

      try {
        const response = await productsApi.get(id);
        const payload = response.data as unknown;
        const extracted =
          payload && typeof payload === 'object' && 'data' in payload
            ? (payload as { data?: unknown }).data
            : payload;

        setProduct(isProduct(extracted) ? extracted : null);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Failed to load product';
        notifications.show({ color: 'red', title: 'Error', message });
      }
    };

    void loadProduct();
  }, [id]);

  if (!product) {
    return <Text>Loading product...</Text>;
  }

  const maxQuantity = Math.max(1, product.stock);

  return (
    <Card withBorder maw={760} mx="auto" p="xl">
      <Stack>
        <Group justify="space-between" align="flex-start">
          <Title order={2}>{product.name}</Title>
          {product.stock === 0 ? <Badge color="red">Out of stock</Badge> : <Badge color="green">In stock</Badge>}
        </Group>

        <Text>{product.description ?? 'No description'}</Text>
        <Text fw={700}>Price: ${product.price.toFixed(2)}</Text>
        <Text>Stock: {product.stock}</Text>
        <Text>Category: {product.category?.name ?? '-'}</Text>

        <NumberInput
          label="Quantity"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(value) => setQuantity(Number(value) || 1)}
        />

        <Group>
          <Button
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product, quantity);
              notifications.show({ color: 'green', title: 'Added', message: `${product.name} added to cart` });
            }}
          >
            Add to Cart
          </Button>
          <Button component={Link} to="/" variant="light">
            Back to Products
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
