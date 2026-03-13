"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingBag,
  ShoppingCart,
  Check,
  ChevronRight as Arrow,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

// ── Types ──────────────────────────────────────────────────────────

export interface DealProduct {
  id: string;
  dummyProductId: number;
  title: string;
  thumbnail: string;
  price: number;
  oldPrice: number | null;
  discountPercentage: number;
  badge: string | null;
  href: string;
  // Extra fields for cart
  brand: string;
  category: string;
  description: string;
  stock: number;
  rating: number;
  images: string[];
}

export interface DealSectionData {
  title: string;
  subtitle: string | null;
  products: DealProduct[];
}

// ── Demo data using REAL DummyJSON products ─────────────────────
// These use actual DummyJSON IDs + real thumbnails, prices, and discount %

const demoDollarExpress: DealProduct[] = [
  {
    id: "demo-de-1",
    dummyProductId: 46,
    title: "Plant Pot",
    thumbnail: "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/thumbnail.webp",
    price: 0.93,
    oldPrice: 14.99,
    discountPercentage: 0,
    badge: "New shoppers only",
    href: "/products/dummy-46",
    brand: "Home Decor",
    category: "home-decoration",
    description: "Beautiful plant pot for home decoration",
    stock: 100,
    rating: 4.5,
    images: [],
  },
  {
    id: "demo-de-2",
    dummyProductId: 59,
    title: "Glass",
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/thumbnail.webp",
    price: 1.53,
    oldPrice: 4.99,
    discountPercentage: 0,
    badge: "New shoppers only",
    href: "/products/dummy-59",
    brand: "Kitchen",
    category: "kitchen-accessories",
    description: "Premium glass for kitchen use",
    stock: 200,
    rating: 4.2,
    images: [],
  },
  {
    id: "demo-de-3",
    dummyProductId: 47,
    title: "Table Lamp",
    thumbnail: "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp",
    price: 1.33,
    oldPrice: 49.99,
    discountPercentage: 0,
    badge: "New shoppers only",
    href: "/products/dummy-47",
    brand: "Home Decor",
    category: "home-decoration",
    description: "Elegant table lamp with warm lighting",
    stock: 50,
    rating: 4.7,
    images: [],
  },
  {
    id: "demo-de-4",
    dummyProductId: 100,
    title: "Apple Airpods",
    thumbnail: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp",
    price: 0.99,
    oldPrice: 129.99,
    discountPercentage: 0,
    badge: "New shoppers only",
    href: "/products/dummy-100",
    brand: "Apple",
    category: "mobile-accessories",
    description: "Apple AirPods wireless earbuds",
    stock: 80,
    rating: 4.8,
    images: [],
  },
];

// SuperDeals use real DummyJSON prices with their actual discount percentages
const demoSuperDeals: DealProduct[] = [
  {
    id: "demo-sd-1",
    dummyProductId: 123,
    title: "iPhone 13 Pro",
    thumbnail: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp",
    price: 1099.99,
    oldPrice: 1199.99,
    discountPercentage: 12.7,
    badge: null,
    href: "/products/dummy-123",
    brand: "Apple",
    category: "smartphones",
    description: "iPhone 13 Pro with A15 Bionic chip",
    stock: 25,
    rating: 4.7,
    images: [],
  },
  {
    id: "demo-sd-2",
    dummyProductId: 107,
    title: "Beats Flex Wireless Earphones",
    thumbnail: "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp",
    price: 49.99,
    oldPrice: 69.99,
    discountPercentage: 8.83,
    badge: null,
    href: "/products/dummy-107",
    brand: "Beats",
    category: "mobile-accessories",
    description: "Beats Flex all-day wireless earphones",
    stock: 120,
    rating: 4.4,
    images: [],
  },
  {
    id: "demo-sd-3",
    dummyProductId: 104,
    title: "Apple iPhone Charger",
    thumbnail: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp",
    price: 19.99,
    oldPrice: 29.99,
    discountPercentage: 16.85,
    badge: null,
    href: "/products/dummy-104",
    brand: "Apple",
    category: "mobile-accessories",
    description: "Apple 20W USB-C power adapter",
    stock: 300,
    rating: 4.6,
    images: [],
  },
  {
    id: "demo-sd-4",
    dummyProductId: 93,
    title: "Brown Leather Belt Watch",
    thumbnail: "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    price: 89.99,
    oldPrice: 119.99,
    discountPercentage: 16.87,
    badge: null,
    href: "/products/dummy-93",
    brand: "Fashion",
    category: "mens-watches",
    description: "Classic brown leather belt watch",
    stock: 60,
    rating: 4.3,
    images: [],
  },
];

// ── Countdown hook ──────────────────────────────────────────────

function useCountdown(hours: number) {
  const endRef = useRef(Date.now() + hours * 3_600_000);
  const [display, setDisplay] = useState("00:00:00");

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endRef.current - Date.now());
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
      setDisplay(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return display;
}

// ── Add to Cart button ──────────────────────────────────────────

function AddToCartButton({ product }: { product: DealProduct }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const cartItems = useCartStore((s) => s.items);

  const cartId = `dummy-${product.dummyProductId}`;
  const inCart = cartItems.some((i) => i.id === cartId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.dummyProductId,
      title: product.title,
      price: product.price,
      discountPercentage: product.discountPercentage,
      thumbnail: product.thumbnail,
      brand: product.brand,
      category: product.category,
      description: product.description,
      stock: product.stock,
      rating: product.rating,
      images: product.images,
    });
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`mt-1.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
        added
          ? "bg-green-600 text-white"
          : inCart
          ? "bg-[#E53935] text-white hover:bg-[#C62828]"
          : "bg-[#E53935] text-white hover:bg-[#C62828]"
      }`}
    >
      {added ? (
        <>
          <Check className="w-3 h-3" /> Added!
        </>
      ) : inCart ? (
        <>
          <ShoppingCart className="w-3 h-3" /> Add More
        </>
      ) : (
        <>
          <ShoppingCart className="w-3 h-3" /> Add to Cart
        </>
      )}
    </button>
  );
}

// ── Scrollable product row with arrows ──────────────────────────

function ProductRow({
  products,
  showDiscount,
}: {
  products: DealProduct[];
  showDiscount?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-[35%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow opacity-0 group-hover/row:opacity-100"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 top-[35%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow opacity-0 group-hover/row:opacity-100"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
      >
        {products.map((product) => {
          const discountedPrice =
            product.discountPercentage > 0
              ? product.price * (1 - product.discountPercentage / 100)
              : null;

          return (
            <div key={product.id} className="flex-shrink-0 w-[155px] group/card">
              {/* Clickable image + info — links to product page */}
              <Link href={product.href}>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                    sizes="155px"
                  />
                </div>

                <p className="text-xs text-gray-700 line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem]">
                  {product.title}
                </p>

                {/* Price row */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-[#1A1A1A]">
                    ${discountedPrice ? discountedPrice.toFixed(2) : product.price.toFixed(2)}
                  </span>
                  {(product.oldPrice || discountedPrice) && (
                    <span className="text-[11px] text-gray-400 line-through">
                      ${(product.oldPrice ?? product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Badge: discount % for SuperDeals, text badge for Dollar Express */}
                {showDiscount && product.discountPercentage > 0 ? (
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-red-100 text-red-600">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                ) : product.badge ? (
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      product.badge.startsWith("-")
                        ? "bg-red-100 text-red-600"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {product.badge}
                  </span>
                ) : null}
              </Link>

              {/* Add to Cart — visible on hover only */}
              <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                <AddToCartButton product={product} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

interface TodaysDealsProps {
  dollarExpress?: DealSectionData | null;
  superDeals?: DealSectionData | null;
}

export default function TodaysDeals({
  dollarExpress,
  superDeals,
}: TodaysDealsProps) {
  const countdown = useCountdown(10);

  const deProducts = dollarExpress?.products?.length
    ? dollarExpress.products
    : demoDollarExpress;
  const sdProducts = superDeals?.products?.length
    ? superDeals.products
    : demoSuperDeals;

  const deSubtitle = dollarExpress?.subtitle ?? "3 from $0.99";
  const sdTitle = superDeals?.title ?? "SuperDeals";

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-black text-center text-[#1A1A1A] mb-6"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Today&apos;s deals
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Dollar Express ── */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#1A1A1A]">
                Dollar Express
              </h3>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200 transition-colors"
              >
                <ShoppingBag className="w-3 h-3" />
                {deSubtitle}
                <Arrow className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <ProductRow products={deProducts} />
        </div>

        {/* ── SuperDeals ── */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#1A1A1A]">
              {sdTitle}
            </h3>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-full px-3 py-1.5 hover:bg-red-100 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Ends in: {countdown}
              <Arrow className="w-3 h-3" />
            </Link>
          </div>
          <ProductRow products={sdProducts} showDiscount />
        </div>
      </div>
    </section>
  );
}
