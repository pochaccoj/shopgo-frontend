import {
  Card,
  Group,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi, type ProductListParams } from '../api/productsApi';
import ProductCard from '../components/products/ProductCard';
import { addToCart } from '../stores/cartStore';
import type { Category, Product } from '../types';

interface ProductListResponse {
  items?: Product[];
  data?: Product[];
  total?: number;
  totalPages?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>('newest');

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: String(category.id), label: category.name })),
    [categories]
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list();
        const payload = response.data as { data?: Category[] } | Category[];
        setCategories(Array.isArray(payload) ? payload : payload.data ?? []);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Failed to load categories';
        notifications.show({ color: 'red', title: 'Error', message });
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params: ProductListParams = {
          page,
          limit: 12,
          q: query || undefined,
          category_id: categoryId ? Number(categoryId) : undefined,
          sort: sort as ProductListParams['sort'],
        };

        const response = await productsApi.list(params);
        const payload = response.data as ProductListResponse | Product[];

        if (Array.isArray(payload)) {
          setProducts(payload);
          setTotalPages(1);
        } else {
          const items = payload.items ?? payload.data ?? [];
          setProducts(items);

          if (typeof payload.totalPages === 'number') {
            setTotalPages(Math.max(1, payload.totalPages));
          } else if (typeof payload.total === 'number') {
            const limit = params.limit ?? 12;
            setTotalPages(Math.max(1, Math.ceil(payload.total / limit)));
          } else {
            setTotalPages(1);
          }
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Failed to load products';
        notifications.show({ color: 'red', title: 'Error', message });
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [page, query, categoryId, sort]);

  return (
    <Stack>
      <Title order={2}>Products</Title>

      <Card withBorder>
        <Group align="end" grow>
          <TextInput
            label="Search"
            placeholder="Search products..."
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setPage(1);
            }}
          />

          <Select
            label="Category"
            placeholder="All categories"
            data={categoryOptions}
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
            clearable
          />

          <Select
            label="Sort"
            data={[
              { value: 'newest', label: 'Newest' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
            ]}
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          />
        </Group>
      </Card>

      {products.length === 0 && !loading ? (
        <Text c="dimmed">No products found.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(item) => {
                addToCart(item, 1);
                notifications.show({ color: 'green', title: 'Added', message: `${item.name} added to cart` });
              }}
            />
          ))}
        </SimpleGrid>
      )}

      <Group justify="center">
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Stack>
  );
}
