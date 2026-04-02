/**
 * Mock service — activated when VITE_USE_MOCK=true
 * All data is in-memory; changes survive only within the same browser session.
 */

import { authStore, clearAuth as _clearAuth, setAccessToken as _setAccessToken } from '../stores/authStore';
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
let prodSeed = 7;
let orderSeed = 4;
let userSeed = 4;

const _categories: Category[] = [
  { id: 1, name: 'Beverages', slug: 'beverages' },
  { id: 2, name: 'Snacks', slug: 'snacks' },
  { id: 3, name: 'Electronics', slug: 'electronics' },
  { id: 4, name: 'Books', slug: 'books' },
];

const _products: Product[] = [
  {
    id: 'p-1',
    name: 'Cold Brew Coffee',
    description: 'Smooth, low-acid cold brew in a 350 ml ready-to-drink bottle.',
    price: 3.5,
    stock: 40,
    category_id: 1,
    created_at: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'p-2',
    name: 'Matcha Latte Sachet (10 pk)',
    description: 'Premium Japanese matcha blended with oat milk powder.',
    price: 12.9,
    stock: 25,
    category_id: 1,
    created_at: '2026-03-14T08:00:00.000Z',
  },
  {
    id: 'p-3',
    name: 'Sea Salt Chips 80g',
    description: 'Thinly sliced kettle-cooked crisps with a light sea-salt finish.',
    price: 2.1,
    stock: 70,
    category_id: 2,
    created_at: '2026-03-16T08:00:00.000Z',
  },
  {
    id: 'p-4',
    name: 'Dark Chocolate 70%',
    description: 'Single-origin cacao bar, 70% cacao solids, 80 g.',
    price: 4.5,
    stock: 60,
    category_id: 2,
    created_at: '2026-03-18T08:00:00.000Z',
  },
  {
    id: 'p-5',
    name: 'Wireless Earbuds Pro',
    description: '6-hour playtime, IPX4 water resistance, aptX codec.',
    price: 49.9,
    stock: 15,
    category_id: 3,
    created_at: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'p-6',
    name: 'USB-C Fast Charger 65W',
    description: 'GaN chip, compact design, charges laptop + phone simultaneously.',
    price: 29.9,
    stock: 30,
    category_id: 3,
    created_at: '2026-03-22T08:00:00.000Z',
  },
  {
    id: 'p-7',
    name: 'Clean Code (Paperback)',
    description: "Robert C. Martin's guide to writing readable, maintainable code.",
    price: 18.0,
    stock: 0,
    category_id: 4,
    created_at: '2026-03-25T08:00:00.000Z',
  },
];

const _users: User[] = [
  { id: 'u-1', name: 'Admin ShopGo', email: 'admin@shopgo.dev', role: 'admin' },
  { id: 'u-2', name: 'Alice Customer', email: 'alice@shopgo.dev', role: 'customer' },
  { id: 'u-3', name: 'Bob Customer', email: 'bob@shopgo.dev', role: 'customer' },
];

const _passwords: Record<string, string> = {
  'admin@shopgo.dev': 'password123',
  'alice@shopgo.dev': 'password123',
  'bob@shopgo.dev': 'password123',
};

const _orders: Order[] = [
  {
    id: 'o-1',
    user_id: 'u-2',
    status: 'pending',
    total_amount: 9.1,
    note: 'Leave at front door',
    items: [
      { product_id: 'p-1', name: 'Cold Brew Coffee', quantity: 1, unit_price: 3.5 },
      { product_id: 'p-3', name: 'Sea Salt Chips 80g', quantity: 2, unit_price: 2.1 },
      { product_id: 'p-4', name: 'Dark Chocolate 70%', quantity: 0, unit_price: 4.5 },
    ],
    created_at: '2026-04-01T09:00:00.000Z',
    updated_at: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'o-2',
    user_id: 'u-2',
    status: 'delivered',
    total_amount: 49.9,
    items: [
      { product_id: 'p-5', name: 'Wireless Earbuds Pro', quantity: 1, unit_price: 49.9 },
    ],
    created_at: '2026-03-28T14:00:00.000Z',
    updated_at: '2026-03-30T10:00:00.000Z',
  },
  {
    id: 'o-3',
    user_id: 'u-3',
    status: 'confirmed',
    total_amount: 47.9,
    items: [
      { product_id: 'p-6', name: 'USB-C Fast Charger 65W', quantity: 1, unit_price: 29.9 },
      { product_id: 'p-2', name: 'Matcha Latte Sachet (10 pk)', quantity: 1, unit_price: 12.9 },
      { product_id: 'p-3', name: 'Sea Salt Chips 80g', quantity: 2, unit_price: 2.55 },
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
      id: `u-${userSeed++}`,
      name: body.name,
      email: body.email,
      role: 'customer',
    };
    _users.push(user);
    _passwords[user.email.toLowerCase()] = body.password;
    return ok({ user, access_token: `mock-at-${user.id}`, refresh_token: `mock-rt-${user.id}` });
  },

  login(body: LoginInput) {
    const user = _users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user || _passwords[user.email.toLowerCase()] !== body.password) {
      fail('Invalid email or password', 401);
    }
    return ok({ user, access_token: `mock-at-${user.id}`, refresh_token: `mock-rt-${user.id}` });
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
      id: `p-${prodSeed++}`,
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
      id: `o-${orderSeed++}`,
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
