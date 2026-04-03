import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi } from '../api/productsApi';
import { usersApi } from '../api/usersApi';
import CategoryForm from '../components/categories/CategoryForm';
import ProductForm from '../components/products/ProductForm';
import UserRoleSelect from '../components/users/UserRoleSelect';
import type { Category, Product, User } from '../types';

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [userRoleModalOpen, setUserRoleModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [userQuery, setUserQuery] = useState('');

  const extractList = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
      return payload as T[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const data = payload as { data?: unknown; items?: unknown };
    if (Array.isArray(data.items)) {
      return data.items as T[];
    }
    if (Array.isArray(data.data)) {
      return data.data as T[];
    }

    return [];
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.list();
      setCategories(extractList<Category>(response.data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load categories';
      notifications.show({ color: 'red', title: 'Error', message });
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.list({ page: 1, limit: 100 });
      setProducts(extractList<Product>(response.data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load products';
      notifications.show({ color: 'red', title: 'Error', message });
    }
  };

  const loadUsers = async (q?: string) => {
    try {
      const response = await usersApi.list(q);
      setUsers(extractList<User>(response.data));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to load users';
      notifications.show({ color: 'red', title: 'Error', message });
    }
  };

  useEffect(() => {
    void loadCategories();
    void loadProducts();
    void loadUsers();
  }, []);

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoriesApi.remove(id);
      notifications.show({ color: 'green', title: 'Success', message: 'Category deleted' });
      await loadCategories();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { code?: string; message?: string } } }).response?.data?.code;
      const apiMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      const message = code === '04003' ? 'Cannot delete this category because products are linked to it' : apiMessage ?? 'Failed to delete category';
      notifications.show({ color: 'red', title: 'Error', message });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productsApi.remove(id);
      notifications.show({ color: 'green', title: 'Success', message: 'Product deleted' });
      await loadProducts();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Failed to delete product';
      notifications.show({ color: 'red', title: 'Error', message });
    }
  };

  return (
    <Stack>
      <Title order={2}>Admin Panel</Title>

      <Tabs defaultValue="categories">
        <Tabs.List>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="products">Products</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="categories" pt="md">
          <Card withBorder shadow="xs" radius="md" p={0} bg="white">
            <Stack gap={0}>
              <Group justify="space-between" p="md">
                <Text fw={600}>Manage categories</Text>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryModalOpen(true);
                  }}
                >
                  Add Category
                </Button>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Slug</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {categories.map((category) => (
                    <Table.Tr key={category.id}>
                      <Table.Td>{category.name}</Table.Td>
                      <Table.Td>{category.slug}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryModalOpen(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon color="red" variant="light" onClick={() => void handleDeleteCategory(category.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="products" pt="md">
          <Card withBorder shadow="xs" radius="md" p={0} bg="white">
            <Stack gap={0}>
              <Group justify="space-between" p="md">
                <Text fw={600}>Manage products</Text>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                >
                  Add Product
                </Button>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Stock</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {products.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>{product.name}</Table.Td>
                      <Table.Td>${product.price.toFixed(2)}</Table.Td>
                      <Table.Td>{product.stock}</Table.Td>
                      <Table.Td>{product.category?.name ?? '-'}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductModalOpen(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon color="red" variant="light" onClick={() => void handleDeleteProduct(product.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <Card withBorder shadow="xs" radius="md" p={0} bg="white">
            <Stack gap={0}>
              <Group align="end" p="md">
                <TextInput
                  label="Search users"
                  placeholder="name or email"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.currentTarget.value)}
                />
                <Button onClick={() => void loadUsers(userQuery || undefined)}>Search</Button>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>{user.name}</Table.Td>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>{user.role}</Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          onClick={() => {
                            setEditingUser(user);
                            setUserRoleModalOpen(true);
                          }}
                        >
                          Change Role
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          initialValues={editingCategory ?? undefined}
          submitLabel={editingCategory ? 'Update Category' : 'Create Category'}
          onSubmit={async (values) => {
            try {
              if (editingCategory) {
                await categoriesApi.update(editingCategory.id, values);
              } else {
                await categoriesApi.create(values);
              }

              notifications.show({ color: 'green', title: 'Success', message: 'Category saved' });
              setCategoryModalOpen(false);
              await loadCategories();
            } catch (err: unknown) {
              const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Failed to save category';
              notifications.show({ color: 'red', title: 'Error', message });
              throw err;
            }
          }}
        />
      </Modal>

      <Modal
        opened={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          initialValues={editingProduct ?? undefined}
          categories={categories}
          submitLabel={editingProduct ? 'Update Product' : 'Create Product'}
          onSubmit={async (values) => {
            try {
              if (editingProduct) {
                await productsApi.update(editingProduct.id, values);
              } else {
                await productsApi.create(values);
              }

              notifications.show({ color: 'green', title: 'Success', message: 'Product saved' });
              setProductModalOpen(false);
              await loadProducts();
            } catch (err: unknown) {
              const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Failed to save product';
              notifications.show({ color: 'red', title: 'Error', message });
              throw err;
            }
          }}
        />
      </Modal>

      <Modal
        opened={userRoleModalOpen}
        onClose={() => setUserRoleModalOpen(false)}
        title={editingUser ? `Change role: ${editingUser.name}` : 'Change role'}
      >
        {editingUser ? (
          <UserRoleSelect
            currentRole={editingUser.role}
            onSubmit={async (values) => {
              try {
                await usersApi.updateRole(editingUser.id, values);
                notifications.show({ color: 'green', title: 'Success', message: 'Role updated' });
                setUserRoleModalOpen(false);
                await loadUsers(userQuery || undefined);
              } catch (err: unknown) {
                const message =
                  (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                  'Failed to update role';
                notifications.show({ color: 'red', title: 'Error', message });
                throw err;
              }
            }}
          />
        ) : (
          <Text c="dimmed">No user selected</Text>
        )}
      </Modal>
    </Stack>
  );
}
