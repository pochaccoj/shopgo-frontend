/**
 * Mock service — activated when VITE_USE_MOCK=true
 * All data is in-memory; changes survive only within the same browser session.
 */

import { authStore, clearAuth as _clearAuth, setAccessToken as _setAccessToken, setAuth as _setAuth } from '../stores/authStore';
import type { Category, Order, OrderItem, OrderStatus, Product, Role, User } from '../types';
import type { LoginInput, RegisterInput } from '../schemas/authSchema';
import type { CategoryInput } from '../schemas/categorySchema';
import type { PlaceOrderInput, UpdateOrderStatusInput } from '../schemas/orderSchema';
import type { ProductInput } from '../schemas/productSchema';
import type { UpdateRoleInput } from '../schemas/userSchema';
import type { ProductListParams } from './productsApi';

export const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function ok<T>(data: T) {
  return Promise.resolve({ data });
}

function fail(message: string, status = 400, code?: string): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw { response: { status, data: { code, message } } };
}

/* ─── seed data ───────────────────────────────────────────────────────────── */

let catSeed = 5;

const newId = () => crypto.randomUUID();

const _categories: Category[] = [
  { id: 1, name: 'Beverages', slug: 'beverages' },
  { id: 2, name: 'Snacks', slug: 'snacks' },
  { id: 3, name: 'Electronics', slug: 'electronics' },
  { id: 4, name: 'Books', slug: 'books' },
];

const _products: Product[] = [
  {
    id: '5e7b6b6b-7a57-47fd-9616-1498a6577a10',
    name: 'Cold Brew Coffee',
    description: 'Smooth, low-acid cold brew in a 350 ml ready-to-drink bottle.',
    price: 3.5,
    stock: 40,
    category_id: 1,
    created_at: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'ca6f4cd0-5adb-48d7-a53e-f95ece928007',
    name: 'Matcha Latte Sachet (10 pk)',
    description: 'Premium Japanese matcha blended with oat milk powder.',
    price: 12.9,
    stock: 25,
    category_id: 1,
    created_at: '2026-03-14T08:00:00.000Z',
  },
  {
    id: '34b4de4d-f616-498c-9664-6720ecfd8f45',
    name: 'Sea Salt Chips 80g',
    description: 'Thinly sliced kettle-cooked crisps with a light sea-salt finish.',
    price: 2.1,
    stock: 70,
    category_id: 2,
    created_at: '2026-03-16T08:00:00.000Z',
  },
  {
    id: '6169d295-cfd8-413a-a5f8-f7347ecf7ff8',
    name: 'Dark Chocolate 70%',
    description: 'Single-origin cacao bar, 70% cacao solids, 80 g.',
    price: 4.5,
    stock: 60,
    category_id: 2,
    created_at: '2026-03-18T08:00:00.000Z',
  },
  {
    id: 'e725fdb9-532c-4e67-a30e-876059f83c5a',
    name: 'Wireless Earbuds Pro',
    description: '6-hour playtime, IPX4 water resistance, aptX codec.',
    price: 49.9,
    stock: 15,
    category_id: 3,
    created_at: '2026-03-20T08:00:00.000Z',
  },
  {
    id: '2ec5d3a9-e349-431a-9fed-764ced56eafb',
    name: 'USB-C Fast Charger 65W',
    description: 'GaN chip, compact design, charges laptop + phone simultaneously.',
    price: 29.9,
    stock: 30,
    category_id: 3,
    created_at: '2026-03-22T08:00:00.000Z',
  },
  {
    id: 'f318326a-056d-44b2-b11d-bde706f30d57',
    name: 'Clean Code (Paperback)',
    description: "Robert C. Martin's guide to writing readable, maintainable code.",
    price: 18.0,
    stock: 0,
    category_id: 4,
    created_at: '2026-03-25T08:00:00.000Z',
  },
];

const _users: User[] = [
  { id: 'f4f52935-8d4f-4f3b-b45b-df6f6fd75d6a', name: 'Admin ShopGo', email: 'admin@shopgo.dev', role: 'admin' },
  {
    id: '0b4575eb-7127-4728-a673-18caa8fb02c2',
    name: 'Alice Customer',
    email: 'alice@shopgo.dev',
    role: 'customer',
  },
  { id: 'e3e6bcf3-0a6f-420d-b552-dde747cb6471', name: 'Bob Customer', email: 'bob@shopgo.dev', role: 'customer' },
];

const _passwords: Record<string, string> = {
  'admin@shopgo.dev': 'password123',
  'alice@shopgo.dev': 'password123',
  'bob@shopgo.dev': 'password123',
};

const _orders: Order[] = [
  {
    id: '80a14577-a6f0-4aa0-bf00-8d8fefecf9ca',
    user_id: '0b4575eb-7127-4728-a673-18caa8fb02c2',
    status: 'pending',
    total_amount: 9.1,
    note: 'Leave at front door',
    items: [
      {
        product_id: '5e7b6b6b-7a57-47fd-9616-1498a6577a10',
        name: 'Cold Brew Coffee',
        quantity: 1,
        unit_price: 3.5,
      },
      {
        product_id: '34b4de4d-f616-498c-9664-6720ecfd8f45',
        name: 'Sea Salt Chips 80g',
        quantity: 2,
        unit_price: 2.1,
      },
      {
        product_id: '6169d295-cfd8-413a-a5f8-f7347ecf7ff8',
        name: 'Dark Chocolate 70%',
        quantity: 0,
        unit_price: 4.5,
      },
    ],
    created_at: '2026-04-01T09:00:00.000Z',
    updated_at: '2026-04-01T09:00:00.000Z',
  },
  {
    id: '40fcb0d9-84d9-48bf-8a5e-5d89b44ebf6b',
    user_id: '0b4575eb-7127-4728-a673-18caa8fb02c2',
    status: 'delivered',
    total_amount: 49.9,
    items: [
      {
        product_id: 'e725fdb9-532c-4e67-a30e-876059f83c5a',
        name: 'Wireless Earbuds Pro',
        quantity: 1,
        unit_price: 49.9,
      },
    ],
    created_at: '2026-03-28T14:00:00.000Z',
    updated_at: '2026-03-30T10:00:00.000Z',
  },
  {
    id: '6782f304-fa4b-43cc-aeba-d2cbef35eb7f',
    user_id: 'e3e6bcf3-0a6f-420d-b552-dde747cb6471',
    status: 'confirmed',
    total_amount: 47.9,
    items: [
      {
        product_id: '2ec5d3a9-e349-431a-9fed-764ced56eafb',
        name: 'USB-C Fast Charger 65W',
        quantity: 1,
        unit_price: 29.9,
      },
      {
        product_id: 'ca6f4cd0-5adb-48d7-a53e-f95ece928007',
        name: 'Matcha Latte Sachet (10 pk)',
        quantity: 1,
        unit_price: 12.9,
      },
      {
        product_id: '34b4de4d-f616-498c-9664-6720ecfd8f45',
        name: 'Sea Salt Chips 80g',
        quantity: 2,
        unit_price: 2.55,
      },
    ],
    created_at: '2026-03-31T18:00:00.000Z',
    updated_at: '2026-04-01T07:00:00.000Z',
  },
];

/* ─── auth helpers ────────────────────────────────────────────────────────── */

function currentUser(): User | null {
  return authStore.get().user;
}

function withCategory(p: Product): Product {
  return { ...p, category: _categories.find((c) => c.id === p.category_id) };
}

/* ─── auth ────────────────────────────────────────────────────────────────── */

export const mockAuthApi = {
  register(body: RegisterInput) {
    if (_users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      fail('Email already in use', 409);
    }
    const user: User = {
      id: newId(),
      name: body.name,
      email: body.email,
      role: 'customer',
    };
    _users.push(user);
    _passwords[user.email.toLowerCase()] = body.password;
    const accessToken = `mock-at-${user.id}`;
    const refreshToken = `mock-rt-${user.id}`;
    _setAuth(user, accessToken, refreshToken);
    return ok({ user, access_token: accessToken, refresh_token: refreshToken });
  },

  login(body: LoginInput) {
    const user = _users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user || _passwords[user.email.toLowerCase()] !== body.password) {
      fail('Invalid email or password', 401);
    }
    const accessToken = `mock-at-${user.id}`;
    const refreshToken = `mock-rt-${user.id}`;
    _setAuth(user, accessToken, refreshToken);
    return ok({ access_token: accessToken, refresh_token: refreshToken });
  },

  refresh(refreshToken: string) {
    if (!refreshToken.startsWith('mock-rt-')) fail('Invalid refresh token', 401);
    const userId = refreshToken.replace('mock-rt-', '');
    return ok({ access_token: `mock-at-${userId}` });
  },

  me() {
    const user = currentUser();
    if (!user) fail('Unauthorized', 401);
    return ok({ user });
  },
};

/* ─── categories ──────────────────────────────────────────────────────────── */

export const mockCategoriesApi = {
  list() {
    return ok({ data: [..._categories] });
  },

  create(body: CategoryInput) {
    if (_categories.some((c) => c.slug === body.slug)) fail('Slug already taken', 409);
    const category: Category = { id: catSeed++, name: body.name, slug: body.slug };
    _categories.push(category);
    return ok({ data: category });
  },

  update(id: number, body: CategoryInput) {
    const idx = _categories.findIndex((c) => c.id === id);
    if (idx === -1) fail('Category not found', 404);
    _categories[idx] = { ..._categories[idx], ...body };
    return ok({ data: _categories[idx] });
  },

  remove(id: number) {
    if (_products.some((p) => p.category_id === id)) {
      fail('Cannot delete — products linked to this category', 409, '04003');
    }
    const idx = _categories.findIndex((c) => c.id === id);
    if (idx === -1) fail('Category not found', 404);
    _categories.splice(idx, 1);
    return ok({ message: 'Deleted' });
  },
};

/* ─── products ────────────────────────────────────────────────────────────── */

export const mockProductsApi = {
  list(params?: ProductListParams) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;

    let items = _products.map(withCategory);

    if (params?.q) {
      const q = params.q.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q),
      );
    }
    if (params?.category_id) {
      items = items.filter((p) => p.category_id === params.category_id);
    }
    if (params?.sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
    if (params?.sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
    if (params?.sort === 'newest') {
      items = [...items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paged = items.slice((page - 1) * limit, page * limit);

    return ok({ data: paged, total, totalPages });
  },

  get(id: string) {
    const p = _products.find((x) => x.id === id);
    if (!p) fail('Product not found', 404);
    return ok({ data: withCategory(p) });
  },

  create(body: ProductInput) {
    const cat = _categories.find((c) => c.id === body.category_id);
    if (!cat) fail('Category not found', 404);
    const product: Product = {
      id: newId(),
      ...body,
      category: cat,
      created_at: new Date().toISOString(),
    };
    _products.push(product);
    return ok({ data: product });
  },

  update(id: string, body: ProductInput) {
    const idx = _products.findIndex((p) => p.id === id);
    if (idx === -1) fail('Product not found', 404);
    const cat = _categories.find((c) => c.id === body.category_id);
    if (!cat) fail('Category not found', 404);
    _products[idx] = { ..._products[idx], ...body, category: cat };
    return ok({ data: withCategory(_products[idx]) });
  },

  remove(id: string) {
    const idx = _products.findIndex((p) => p.id === id);
    if (idx === -1) fail('Product not found', 404);
    _products.splice(idx, 1);
    return ok({ message: 'Deleted' });
  },
};

/* ─── orders ──────────────────────────────────────────────────────────────── */

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

export const mockOrdersApi = {
  place(body: PlaceOrderInput) {
    const user = currentUser();
    if (!user) fail('Unauthorized', 401);

    const items: OrderItem[] = body.items.map((item) => {
      const p = _products.find((x) => x.id === item.product_id);
      if (!p) fail(`Product ${item.product_id} not found`, 404);
      if (p.stock < item.quantity) fail('Insufficient stock', 400, '06002');
      p.stock -= item.quantity;
      return { product_id: p.id, name: p.name, quantity: item.quantity, unit_price: p.price };
    });

    const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const now = new Date().toISOString();
    const order: Order = {
      id: newId(),
      user_id: user.id,
      status: 'pending',
      total_amount: total,
      note: body.note,
      items,
      created_at: now,
      updated_at: now,
    };
    _orders.unshift(order);
    return ok({ data: order });
  },

  list(status?: OrderStatus) {
    const user = currentUser();
    if (!user) fail('Unauthorized', 401);
    let result = [..._orders];
    if (user.role !== 'admin') result = result.filter((o) => o.user_id === user.id);
    if (status) result = result.filter((o) => o.status === status);
    return ok({ data: result });
  },

  get(id: string) {
    const user = currentUser();
    if (!user) fail('Unauthorized', 401);
    const order = _orders.find((o) => o.id === id);
    if (!order) fail('Order not found', 404);
    if (user.role !== 'admin' && order.user_id !== user.id) fail('Forbidden', 403);
    return ok({ data: order });
  },

  cancel(id: string) {
    const user = currentUser();
    if (!user) fail('Unauthorized', 401);
    const order = _orders.find((o) => o.id === id);
    if (!order) fail('Order not found', 404);
    if (user.role !== 'admin' && order.user_id !== user.id) fail('Forbidden', 403);
    if (order.status !== 'pending') fail('Only pending orders can be cancelled', 400);
    (order.items ?? []).forEach((item) => {
      const p = _products.find((x) => x.id === item.product_id);
      if (p) p.stock += item.quantity;
    });
    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();
    return ok({ data: order });
  },

  updateStatus(id: string, body: UpdateOrderStatusInput) {
    const user = currentUser();
    if (!user || user.role !== 'admin') fail('Forbidden', 403);
    const order = _orders.find((o) => o.id === id);
    if (!order) fail('Order not found', 404);
    if (nextStatus[order.status] !== body.status) fail('Invalid status transition', 400);
    order.status = body.status as OrderStatus;
    order.updated_at = new Date().toISOString();
    return ok({ data: order });
  },
};

/* ─── users ───────────────────────────────────────────────────────────────── */

export const mockUsersApi = {
  list(q?: string) {
    const user = currentUser();
    if (!user || user.role !== 'admin') fail('Forbidden', 403);
    if (!q) return ok({ data: [..._users] });
    const lq = q.toLowerCase();
    return ok({
      data: _users.filter(
        (u) => u.name.toLowerCase().includes(lq) || u.email.toLowerCase().includes(lq),
      ),
    });
  },

  get(id: string) {
    const user = currentUser();
    if (!user || user.role !== 'admin') fail('Forbidden', 403);
    const found = _users.find((u) => u.id === id);
    if (!found) fail('User not found', 404);
    return ok({ data: found });
  },

  updateRole(id: string, body: UpdateRoleInput) {
    const user = currentUser();
    if (!user || user.role !== 'admin') fail('Forbidden', 403);
    const found = _users.find((u) => u.id === id);
    if (!found) fail('User not found', 404);
    found.role = body.role as Role;
    return ok({ data: found });
  },
};
