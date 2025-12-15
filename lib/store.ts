import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// Lightweight cart item - only stores ID and quantity
export interface CartItemLight {
  productId: string;
  quantity: number;
}

// Full product data (for backward compatibility)
interface CartProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  volume: string;
  alcohol: number;
  image: string;
  description: string | null;
  ingredients: string[];
  serving_instructions: string | null;
  serving_size: string | null;
  available: boolean;
  weight: number;
}

// Legacy format (for migration)
interface LegacyCartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStore {
  items: CartItemLight[];
  addItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getItems: () => CartItemLight[];
}

export const useCart = create<CartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],

        addItem: (productId, quantity) => {
          set((state) => {
            const existingItemIndex = state.items.findIndex(item => item.productId === productId);

            if (existingItemIndex !== -1) {
              return {
                items: state.items.map((item, index) =>
                  index === existingItemIndex
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                )
              };
            }

            return {
              items: [...state.items, { productId, quantity }]
            };
          });
        },

        removeItem: (productId) => {
          set((state) => ({
            items: state.items.filter(item => item.productId !== productId)
          }));
        },

        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }

          set((state) => ({
            items: state.items.map(item =>
              item.productId === productId
                ? { ...item, quantity }
                : item
            )
          }));
        },

        clearCart: () => set({ items: [] }),

        getTotalItems: () => {
          return get().items.reduce((total, item) => total + item.quantity, 0);
        },

        getItems: () => {
          return get().items;
        }
      }),
      {
        name: 'linvisible-cart',
        version: 2, // Increment version to trigger migration
        migrate: (persistedState: any, version: number) => {
          // Migrate from old format (product object) to new format (productId only)
          if (version === 0 || version === 1) {
            try {
              const legacyState = persistedState as { items: LegacyCartItem[] };
              if (!legacyState.items || !Array.isArray(legacyState.items)) {
                return { items: [] };
              }
              return {
                items: legacyState.items
                  .filter(item => item?.product?.id && typeof item.quantity === 'number')
                  .map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity
                  }))
              };
            } catch {
              // If migration fails, start with empty cart
              return { items: [] };
            }
          }
          // Validate version 2 format
          const state = persistedState as { items: CartItemLight[] };
          if (!state.items || !Array.isArray(state.items)) {
            return { items: [] };
          }
          // Filter out any invalid items
          return {
            items: state.items.filter(
              item => item?.productId && typeof item.productId === 'string' && typeof item.quantity === 'number'
            )
          };
        }
      }
    )
  )
);