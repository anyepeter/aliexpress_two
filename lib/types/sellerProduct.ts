export interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
}

export interface DummyProductsResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface SellerProductForm {
  dummyProductId: number;
  title: string;
  description: string;
  images: string[];
  category: string;
  brand?: string;
  basePrice: number;
  marginPercent: number;
  sellingPrice: number;
  discountPct?: number;
  stock: number;
  tags?: string[];
  rating?: number;
  ratingCount?: number;
}

export interface SavedSellerProduct {
  id: string;
  storeId: string;
  dummyProductId: number;
  title: string;
  description: string | null;
  images: string[];
  category: string;
  brand: string | null;
  basePrice: number;
  marginPercent: number;
  sellingPrice: number;
  discountPct: number;
  stock: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder: number;
  tags: string[] | null;
  rating: number | null;
  ratingCount: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreAnalyticsData {
  id: string;
  storeId: string;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  updatedAt: string;
}
