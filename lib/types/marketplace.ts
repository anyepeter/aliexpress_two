export interface StoreInfo {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  isVerified: boolean;
  createdAt: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  country: string | null;
  city: string | null;
  socialLinks: Record<string, string> | null;
}

export interface MarketplaceProduct {
  id: string;             // SellerProduct.id or "dummy-{dummyProductId}"
  dummyProductId: number;
  title: string;
  thumbnail: string;
  images: string[];
  brand: string;
  category: string;
  sellingPrice: number;   // ONLY price buyers ever see — never expose basePrice
  rating: number;
  discountPercentage: number;
  stock: number;
  description: string;
  shortDescription?: string | null;
  keyFeatures?: string | null;
  store: StoreInfo | null; // null = MarketHub fallback (DummyJSON product)
  isPremium: boolean;      // true if store.isVerified
}

export interface CartItemWithStore {
  id: string;              // SellerProduct.id or "dummy-{dummyProductId}"
  dummyProductId: number;
  title: string;
  price: number;           // sellingPrice — what buyer pays
  discountPercentage: number;
  thumbnail: string;
  brand: string;
  category: string;
  quantity: number;
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  storeLogoUrl: string | null;
  isVerifiedStore: boolean;
}

export interface StoreCartGroup {
  storeId: string | null;
  storeName: string;
  storeSlug: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  items: CartItemWithStore[];
  subtotal: number;
}
