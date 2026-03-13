import type { Product, ProductsResponse, Category } from "@/lib/types/product";

const BASE_URL = "https://dummyjson.com";

export async function getProducts(
  limit = 20,
  skip = 0,
  category?: string
): Promise<ProductsResponse> {
  try {
    const url = category
      ? `${BASE_URL}/products/category/${category}?limit=${limit}&skip=${skip}`
      : `${BASE_URL}/products?limit=${limit}&skip=${skip}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<ProductsResponse>;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, skip: 0, limit };
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE_URL}/products/categories`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json() as Promise<Category[]>;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getFlashDeals(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=8&skip=0`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error("Failed to fetch flash deals");
    const data = (await res.json()) as ProductsResponse;
    return data.products;
  } catch (error) {
    console.error("Error fetching flash deals:", error);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/products?limit=20&skip=8`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch featured products");
    const data = (await res.json()) as ProductsResponse;
    return data.products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/** Fetch every available product for client-side shop filtering */
export async function getAllShopProducts(): Promise<Product[]> {
  try {
    // DummyJSON supports limit=0 to get all products
    const res = await fetch(`${BASE_URL}/products?limit=0`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch all products");
    const data = (await res.json()) as ProductsResponse;
    // If limit=0 returned nothing, fallback to two paginated requests
    if (data.products.length === 0) {
      const [a, b] = await Promise.all([
        fetch(`${BASE_URL}/products?limit=100&skip=0`).then((r) =>
          r.json() as Promise<ProductsResponse>
        ),
        fetch(`${BASE_URL}/products?limit=100&skip=100`).then((r) =>
          r.json() as Promise<ProductsResponse>
        ),
      ]);
      return [...a.products, ...b.products];
    }
    return data.products;
  } catch (error) {
    console.error("Error fetching all shop products:", error);
    return [];
  }
}
