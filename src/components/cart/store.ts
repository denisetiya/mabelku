import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  mainImage: string | null;
  stock: number;
  quantity: number;
}

export const cart = persistentAtom<CartItem[]>('mabelku_cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const cartOpen = atom(false);

export function addToCart(product: Omit<CartItem, 'quantity'>, quantity: number = 1) {
  const items = cart.get();
  const existing = items.find((i) => i.id === product.id);

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, product.stock);
    cart.set(
      items.map((i) =>
        i.id === product.id ? { ...i, quantity: newQty } : i,
      ),
    );
  } else {
    const qty = Math.min(quantity, product.stock);
    cart.set([...items, { ...product, quantity: qty }]);
  }
}

export function updateQuantity(id: string, quantity: number) {
  const items = cart.get();
  cart.set(
    items.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i,
    ),
  );
}

export function removeFromCart(id: string) {
  const items = cart.get();
  cart.set(items.filter((i) => i.id !== id));
}

export function clearCart() {
  cart.set([]);
}

export function getCartCount(): number {
  return cart.get().reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartSubtotal(): number {
  return cart.get().reduce((sum, i) => {
    const price = i.discountPrice && i.discountPrice > 0 ? i.discountPrice : i.price;
    return sum + price * i.quantity;
  }, 0);
}

export function createCartStore() {
  const updateBadge = () => {
    const count = getCartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(count);
      el.classList.toggle('opacity-0', count === 0);
      el.classList.toggle('scale-0', count === 0);
    });
  };

  cart.subscribe(updateBadge);
  updateBadge();
}
