"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LocalCartItem = {
  key: string;
  productId: string;
  productVariantId?: string | null;
  slug: string;
  title: string;
  thumbnailUrl: string;
  unitPrice: number;
  unitDiscountPrice: number | null;
  orderPayableAmount?: number | null;
  quantity: number;
};

type CartState = {
  items: LocalCartItem[];
  checkoutItems: LocalCartItem[] | null;
  isOpen: boolean;
  needsSync: boolean;
  hasHydrated: boolean;
  markHydrated: () => void;
  addItem: (item: Omit<LocalCartItem, "key" | "quantity">) => void;
  startDirectCheckout: (item: Omit<LocalCartItem, "key" | "quantity">) => void;
  clearCheckoutItems: () => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  markSynced: () => void;
};

function makeItemKey(productId: string, productVariantId?: string | null) {
  return `${productId}:${productVariantId ?? "base"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      checkoutItems: null,
      isOpen: false,
      needsSync: false,
      hasHydrated: false,
      markHydrated: () => set({ hasHydrated: true }),
      addItem: (item) =>
        set((state) => {
          const key = makeItemKey(item.productId, item.productVariantId);
          const existing = state.items.find((cartItem) => cartItem.key === key);

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.key === key
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem,
              ),
              isOpen: true,
              needsSync: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                key,
                quantity: 1,
              },
            ],
            isOpen: true,
            needsSync: true,
          };
        }),
      startDirectCheckout: (item) =>
        set(() => ({
          checkoutItems: [
            {
              ...item,
              key: makeItemKey(item.productId, item.productVariantId),
              quantity: 1,
            },
          ],
          isOpen: false,
        })),
      clearCheckoutItems: () => set({ checkoutItems: null }),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
          needsSync: true,
        })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.key !== key)
              : state.items.map((item) =>
                  item.key === key ? { ...item, quantity } : item,
                ),
          needsSync: true,
        })),
      clearCart: () => set({ items: [], needsSync: true }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      markSynced: () => set({ needsSync: false }),
    }),
    {
      name: "local-cart-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        checkoutItems: state.checkoutItems,
        needsSync: state.needsSync,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export function getCartTotals(items: LocalCartItem[]) {
  return items.reduce(
    (acc, item) => {
      const unit = item.unitDiscountPrice ?? item.unitPrice;
      acc.quantity += item.quantity;
      acc.total += unit * item.quantity;
      return acc;
    },
    { quantity: 0, total: 0 },
  );
}
