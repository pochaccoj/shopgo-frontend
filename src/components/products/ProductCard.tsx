import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} component={Link} to={`/products/${product.id}`} td="none">
            {product.name}
          </Text>
          {product.stock === 0 ? <Badge color="red">Out of stock</Badge> : <Badge color="green">In stock</Badge>}
        </Group>

        <Text c="dimmed" lineClamp={2}>
          {product.description ?? 'No description'}
        </Text>

        <Text fw={700}>${product.price.toFixed(2)}</Text>

        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          variant={product.stock === 0 ? 'light' : 'filled'}
        >
          Add to Cart
        </Button>
      </Stack>
    </Card>
  );
}
