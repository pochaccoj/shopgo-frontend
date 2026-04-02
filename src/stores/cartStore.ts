import { atom } from 'nanostores';
import type { CartItem, Product } from '../types';

export const cartStore = atom<CartItem[]>([]);

export function addToCart(product: Product, quantity = 1) {
  const items = cartStore.get();
  const existing = items.find((item) => item.product.id === product.id);

  if (existing) {
    cartStore.set(
      items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    );
  } else {
    cartStore.set([...items, { product, quantity }]);
  }
}

export function updateCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  cartStore.set(
    cartStore.get().map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    )
  );
}

export function removeFromCart(productId: string) {
  cartStore.set(cartStore.get().filter((item) => item.product.id !== productId));
}

export function clearCart() {
  cartStore.set([]);
}
