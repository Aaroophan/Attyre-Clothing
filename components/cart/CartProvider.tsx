'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DELIVERY_FEE } from '@/lib/constants';
import type { AddCartItemInput, CartItem, CartTotals } from '@/types/cart';

const CART_STORAGE_KEY = 'attyre-cart-items';
interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  isReady: boolean;
  addItem: (item: AddCartItemInput) => void;
  updateItemQuantity: (cartItemKey: string, quantity: number) => void;
  removeItem: (cartItemKey: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, size?: string, color?: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getCartItemKey(item: Pick<CartItem, 'productId' | 'size' | 'color'>): string {
  return [item.productId, item.size ?? 'one-size', item.color ?? 'standard'].join('::');
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.productId === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.image === 'string' &&
    typeof item.unitPrice === 'number' &&
    Number.isFinite(item.unitPrice) &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    typeof item.stockLimit === 'number' &&
    Number.isFinite(item.stockLimit) &&
    typeof item.addedAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
}

function normalizeCartItems(items: CartItem[]): CartItem[] {
  return items
    .filter(isCartItem)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Math.min(Math.trunc(item.quantity), Math.max(0, Math.trunc(item.stockLimit)))),
      stockLimit: Math.max(0, Math.trunc(item.stockLimit)),
      unitPrice: Math.max(0, item.unitPrice),
    }))
    .filter((item) => item.quantity > 0 && item.stockLimit > 0);
}

function readCartFromStorage(): CartItem[] {
  if (typeof globalThis.localStorage === 'undefined') {
    return [];
  }

  try {
    const storedValue = globalThis.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return normalizeCartItems(parsedValue);
  } catch {
    return [];
  }
}

function writeCartToStorage(items: CartItem[]) {
  if (typeof globalThis.localStorage === 'undefined') {
    return;
  }

  globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function clampQuantity(quantity: number, stockLimit: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.min(Math.trunc(quantity), Math.max(1, Math.trunc(stockLimit)));
}

function calculateTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    itemCount,
  };
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readCartFromStorage());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeCartToStorage(items);
  }, [isReady, items]);

  const addItem = useCallback((input: AddCartItemInput) => {
    if (input.stockLimit <= 0 || input.quantity <= 0) {
      return;
    }

    setItems((currentItems) => {
      const now = new Date().toISOString();
      const nextItemKey = getCartItemKey(input);
      const existingItem = currentItems.find((item) => getCartItemKey(item) === nextItemKey);

      if (existingItem) {
        return currentItems.map((item) => {
          if (getCartItemKey(item) !== nextItemKey) {
            return item;
          }

          return {
            ...item,
            quantity: clampQuantity(item.quantity + input.quantity, input.stockLimit),
            unitPrice: input.unitPrice,
            stockLimit: input.stockLimit,
            updatedAt: now,
          };
        });
      }

      const nextItem: CartItem = {
        ...input,
        quantity: clampQuantity(input.quantity, input.stockLimit),
        addedAt: now,
        updatedAt: now,
      };

      return [...currentItems, nextItem];
    });
  }, []);

  const updateItemQuantity = useCallback((cartItemKey: string, quantity: number) => {
    setItems((currentItems) => currentItems.map((item) => {
      if (getCartItemKey(item) !== cartItemKey) {
        return item;
      }

      return {
        ...item,
        quantity: clampQuantity(quantity, item.stockLimit),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const removeItem = useCallback((cartItemKey: string) => {
    setItems((currentItems) => currentItems.filter((item) => getCartItemKey(item) !== cartItemKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: string, size?: string, color?: string) => {
    const matchingItem = items.find((item) => getCartItemKey(item) === getCartItemKey({ productId, size, color }));

    return matchingItem?.quantity ?? 0;
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totals: calculateTotals(items),
    isReady,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  }), [addItem, clearCart, getItemQuantity, isReady, items, removeItem, updateItemQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
}

export function getPublicCartItemKey(item: Pick<CartItem, 'productId' | 'size' | 'color'>): string {
  return getCartItemKey(item);
}
