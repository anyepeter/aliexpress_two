import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types/product";
import type { CartItemWithStore, StoreCartGroup } from "@/lib/types/marketplace";

// Re-export CartItemWithStore as CartItem for backward-compat imports
export type CartItem = CartItemWithStore;

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product) => void;
  addMarketplaceItem: (item: CartItemWithStore) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed helpers
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountedPrice: (item: CartItem) => number;
  getGroupedByStore: () => StoreCartGroup[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ── Legacy DummyJSON product add ──────────────────────────────────────
      addItem: (product: Product) => {
        const id = `dummy-${product.id}`;
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
                  : item
              ),
            };
          }
          const newItem: CartItem = {
            id,
            dummyProductId: product.id,
            title: product.title,
            price: product.price,
            discountPercentage: product.discountPercentage,
            thumbnail: product.thumbnail,
            brand: product.brand ?? "MarketHub",
            category: product.category,
            quantity: 1,
            storeId: null,
            storeName: null,
            storeSlug: null,
            storeLogoUrl: null,
            isVerifiedStore: false,
          };
          return { items: [...state.items, newItem] };
        });
      },

      // ── Marketplace seller product add ────────────────────────────────────
      addMarketplaceItem: (item: CartItemWithStore) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item }] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const bounded = Math.min(Math.max(1, quantity), 99);
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: bounded } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const discounted = get().getDiscountedPrice(item);
          return sum + discounted * item.quantity;
        }, 0),

      getDiscountedPrice: (item: CartItem) =>
        item.discountPercentage > 0
          ? item.price * (1 - item.discountPercentage / 100)
          : item.price,

      // ── Group cart items by store for drawer display ───────────────────────
      getGroupedByStore: (): StoreCartGroup[] => {
        const items = get().items;
        const map = new Map<string, StoreCartGroup>();

        for (const item of items) {
          const key = item.storeId ?? "official";
          if (!map.has(key)) {
            map.set(key, {
              storeId: item.storeId,
              storeName: item.storeName ?? "MarketHub Official Store",
              storeSlug: item.storeSlug,
              logoUrl: item.storeLogoUrl,
              isVerified: item.isVerifiedStore,
              items: [],
              subtotal: 0,
            });
          }
          const group = map.get(key)!;
          group.items.push(item);
          group.subtotal +=
            get().getDiscountedPrice(item) * item.quantity;
        }

        // Verified stores first, then official last
        return Array.from(map.values()).sort((a, b) => {
          if (a.storeId === null) return 1;
          if (b.storeId === null) return -1;
          return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        });
      },
    }),
    {
      name: "markethub-cart",
      partialize: (state) => ({ items: state.items }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Old items had id: number — upgrade to string with null store fields
          const old = persistedState as {
            items: Array<Record<string, unknown>>;
          };
          return {
            ...old,
            items: (old.items ?? []).map((item) => ({
              ...item,
              id: `dummy-${item.id}`,
              dummyProductId: typeof item.id === "number" ? item.id : 0,
              storeId: null,
              storeName: null,
              storeSlug: null,
              storeLogoUrl: null,
              isVerifiedStore: false,
            })),
          };
        }
        return persistedState;
      },
    }
  )
);
