export type Role = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: number;
  category?: Category;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name?: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id?: string;
  status: OrderStatus;
  total_amount: number;
  note?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
