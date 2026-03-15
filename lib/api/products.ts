import { prisma } from "@/lib/prisma";
import type { Product, ProductsResponse, Category } from "@/lib/types/product";

export async function getProducts(
  limit = 20,
  skip = 0,
  category?: string
): Promise<ProductsResponse> {
  try {
    const where = category ? { category } : {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(dbToProduct),
      total,
      skip,
      limit,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, skip: 0, limit };
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const cats = await prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return cats.map((c) => ({
      slug: c.category,
      name: c.category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      url: `/shop?category=${c.category}`,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getFlashDeals(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: { rating: "desc" },
    });
    return products.map(dbToProduct);
  } catch (error) {
    console.error("Error fetching flash deals:", error);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      take: 20,
      skip: 8,
      orderBy: { rating: "desc" },
    });
    return products.map(dbToProduct);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/** Fetch every available product for client-side shop filtering */
export async function getAllShopProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return products.map(dbToProduct);
  } catch (error) {
    console.error("Error fetching all shop products:", error);
    return [];
  }
}

/** Convert a Prisma Product to the legacy Product type */
function dbToProduct(p: {
  id: number;
  title: string;
  description: string;
  shortDescription: string | null;
  keyFeatures: string | null;
  price: number;
  discountPercentage: number | null;
  rating: number | null;
  stock: number | null;
  brand: string | null;
  category: string;
  thumbnail: string | null;
  images: string[];
  tags: string[];
  sku: string | null;
  weight: number | null;
  warrantyInformation: string | null;
  shippingInformation: string | null;
  availabilityStatus: string | null;
  returnPolicy: string | null;
  minimumOrderQuantity: number | null;
  reviews: unknown;
  meta: unknown;
}): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    discountPercentage: p.discountPercentage ?? 0,
    rating: p.rating ?? 0,
    stock: p.stock ?? 0,
    brand: p.brand ?? undefined,
    category: p.category,
    thumbnail: p.thumbnail ?? "",
    images: p.images ?? [],
    tags: p.tags ?? [],
    sku: p.sku ?? undefined,
    weight: p.weight ?? undefined,
    warrantyInformation: p.warrantyInformation ?? undefined,
    shippingInformation: p.shippingInformation ?? undefined,
    availabilityStatus: p.availabilityStatus ?? undefined,
    returnPolicy: p.returnPolicy ?? undefined,
    minimumOrderQuantity: p.minimumOrderQuantity ?? undefined,
    reviews: (p.reviews as Product["reviews"]) ?? undefined,
    meta: (p.meta as Product["meta"]) ?? undefined,
  };
}
