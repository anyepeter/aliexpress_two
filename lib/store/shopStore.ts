import { create } from "zustand";

export interface ShopFilters {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  searchQuery: string;
  inStockOnly: boolean;
  brands: string[];
  verifiedOnly: boolean;
}

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";
export type ItemsPerPage = 20 | 40 | 60;
export type ViewMode = "grid" | "list";

export const DEFAULT_FILTERS: ShopFilters = {
  category: null,
  minPrice: 0,
  maxPrice: 10000,
  minRating: 0,
  searchQuery: "",
  inStockOnly: false,
  brands: [],
  verifiedOnly: false,
};

interface ShopState {
  filters: ShopFilters;
  sortBy: SortOption;
  currentPage: number;
  itemsPerPage: ItemsPerPage;
  viewMode: ViewMode;

  setFilter: <K extends keyof ShopFilters>(
    key: K,
    value: ShopFilters[K]
  ) => void;
  toggleBrand: (brand: string) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;
  setItemsPerPage: (count: ItemsPerPage) => void;
  initFromParams: (params: Record<string, string>) => void;
}

export const useShopStore = create<ShopState>((set) => ({
  filters: { ...DEFAULT_FILTERS },
  sortBy: "relevance",
  currentPage: 1,
  itemsPerPage: 20,
  viewMode: "grid",

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    })),

  toggleBrand: (brand) =>
    set((state) => {
      const next = state.filters.brands.includes(brand)
        ? state.filters.brands.filter((b) => b !== brand)
        : [...state.filters.brands, brand];
      return { filters: { ...state.filters, brands: next }, currentPage: 1 };
    }),

  setSort: (sort) => set({ sortBy: sort, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  setViewMode: (mode) => set({ viewMode: mode }),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS }, currentPage: 1 }),

  setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),

  initFromParams: (params) =>
    set(() => {
      const filters: ShopFilters = { ...DEFAULT_FILTERS };
      if (params.category) filters.category = params.category;
      if (params.q) filters.searchQuery = params.q;
      if (params.min) filters.minPrice = parseFloat(params.min) || 0;
      if (params.max) filters.maxPrice = parseFloat(params.max) || 10000;
      if (params.rating) filters.minRating = parseFloat(params.rating) || 0;
      if (params.stock === "1") filters.inStockOnly = true;
      if (params.verified === "1") filters.verifiedOnly = true;

      const VALID_SORTS: SortOption[] = [
        "relevance",
        "price-asc",
        "price-desc",
        "rating",
        "newest",
      ];
      const sortBy = VALID_SORTS.includes(params.sort as SortOption)
        ? (params.sort as SortOption)
        : "relevance";

      return {
        filters,
        sortBy,
        currentPage: parseInt(params.page) || 1,
      };
    }),
}));
