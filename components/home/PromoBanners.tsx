import Link from "next/link";
import Image from "next/image";
import { Diamond, BarChart3, Landmark, ShoppingCart } from "lucide-react";

// ── Stats shown on the business banner ──────────────────────────

const stats = [
  { value: "5M+", label: "Factory direct supply" },
  { value: "20M+", label: "Value dropshipping items" },
  { value: "10", label: "Local warehouses worldwide" },
  { value: "24H", label: "Personalized sourcing service" },
];

// ── Product cards for Bulk Saver Hub (real DummyJSON products) ──

const bulkSaverProducts = [
  {
    id: 64,
    title: "Knife",
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/thumbnail.webp",
    price: 0.99,
    oldPrice: 14.99,
  },
  {
    id: 74,
    title: "Spoon",
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/spoon/thumbnail.webp",
    price: 0.96,
    oldPrice: null,
  },
  {
    id: 57,
    title: "Fine Mesh Strainer",
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/fine-mesh-strainer/thumbnail.webp",
    price: 0.99,
    oldPrice: 9.99,
  },
];

// ── Product cards for Buy Again ─────────────────────────────────

const buyAgainProducts = [
  {
    id: 6,
    title: "Calvin Klein CK One",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp",
    price: 0.99,
    oldPrice: 49.99,
    badge: "Popular picks",
  },
  {
    id: 48,
    title: "Bamboo Spatula",
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp",
    price: 0.99,
    oldPrice: 7.99,
    badge: "Popular picks",
  },
  {
    id: 1,
    title: "Essence Mascara Lash Princess",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    price: 4.63,
    oldPrice: null,
    badge: "Popular picks",
  },
];

// ── Small product card ──────────────────────────────────────────

function MiniProductCard({
  product,
}: {
  product: {
    id: number;
    title: string;
    thumbnail: string;
    price: number;
    oldPrice: number | null;
    badge?: string;
  };
}) {
  return (
    <Link href={`/products/dummy-${product.id}`} className="flex-1 min-w-0 group/mini">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover group-hover/mini:scale-105 transition-transform duration-300"
          sizes="180px"
        />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-extrabold text-[#1A1A1A]">
          ${product.price.toFixed(2)}
        </span>
        {product.oldPrice && (
          <span className="text-[11px] text-gray-400 line-through">
            ${product.oldPrice.toFixed(2)}
          </span>
        )}
      </div>
      {product.badge && (
        <span className="text-[10px] text-gray-500 mt-0.5 block">
          {product.badge}
        </span>
      )}
    </Link>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      {/* ── Full container with background image ── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background image */}
        <Image
          src="https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"
          alt="Business background"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

        {/* All content sits on top */}
        <div className="relative z-10 px-6 md:px-10 py-8 space-y-6">
          {/* ── Top: Business info + stats ── */}
          <div className="flex items-center justify-between">
            {/* Left: Title + features + CTA */}
            <div className="flex-shrink-0 max-w-md">
              <h3
                className="text-2xl md:text-3xl font-black text-white leading-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                AliExpress{" "}
                <span className="text-[#E53935]">Business</span>
              </h3>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                  <Diamond className="w-3 h-3 text-[#E53935]" /> Tax exemptions
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-[#E53935]" /> Express Payments
                </span>
                <span className="flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-[#E53935]" /> Financial Support
                </span>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center mt-4 px-6 py-2 bg-white text-[#1A1A1A] text-sm font-semibold rounded-sm hover:bg-gray-100 transition-colors"
              >
                Shop now
              </Link>
            </div>

            {/* Right: Stats grid */}
            <div className="hidden md:grid grid-cols-2 gap-x-10 gap-y-4">
              {stats.map((stat) => (
                <div key={stat.value} className="border-l-2 border-white/20 pl-4">
                  <p className="text-2xl font-extrabold text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom: Two product cards inside the banner ── */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Bulk Saver Hub */}
            <div className="flex-1 rounded-2xl p-5 bg-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#1A1A1A]">
                  Bulk Saver Hub
                </h3>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#E53935] transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  View all →
                </Link>
              </div>
              <div className="flex gap-3">
                {bulkSaverProducts.map((p) => (
                  <MiniProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>

            {/* Buy Again */}
            <div className="flex-1 rounded-2xl p-5 bg-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#1A1A1A]">
                  Buy again
                </h3>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#E53935] transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="flex gap-3">
                {buyAgainProducts.map((p) => (
                  <MiniProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
