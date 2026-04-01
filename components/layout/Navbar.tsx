"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Store,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Settings,
} from "lucide-react";
import CartIcon from "@/components/cart/CartIcon";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const NAV_CATEGORIES = [
  { name: "Beauty", slug: "beauty" },
  { name: "Fragrances", slug: "fragrances" },
  { name: "Furniture", slug: "furniture" },
  { name: "Groceries", slug: "groceries" },
  { name: "Home Decoration", slug: "home-decoration" },
  { name: "Kitchen Accessories", slug: "kitchen-accessories" },
  { name: "Laptops", slug: "laptops" },
  { name: "Men's Shirts", slug: "mens-shirts" },
  { name: "Men's Shoes", slug: "mens-shoes" },
  { name: "Men's Watches", slug: "mens-watches" },
  { name: "Mobile Accessories", slug: "mobile-accessories" },
  { name: "Motorcycle", slug: "motorcycle" },
  { name: "Skin Care", slug: "skin-care" },
  { name: "Smartphones", slug: "smartphones" },
  { name: "Sports Accessories", slug: "sports-accessories" },
  { name: "Sunglasses", slug: "sunglasses" },
  { name: "Tablets", slug: "tablets" },
  { name: "Tops", slug: "tops" },
  { name: "Vehicle", slug: "vehicle" },
  { name: "Women's Bags", slug: "womens-bags" },
  { name: "Women's Dresses", slug: "womens-dresses" },
  { name: "Women's Jewellery", slug: "womens-jewellery" },
  { name: "Women's Shoes", slug: "womens-shoes" },
  { name: "Women's Watches", slug: "womens-watches" },
];

function AliExpressLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#FF5722" />
        </linearGradient>
      </defs>
      <text
        x="4"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="bold"
        fontStyle="italic"
        fill="url(#logoGrad)"
        letterSpacing="-0.5"
      >
        AliExpress
      </text>
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { dbUser, isLoading: dbLoading } = useCurrentUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCatEnter = () => {
    if (catTimeoutRef.current) clearTimeout(catTimeoutRef.current);
    setCatOpen(true);
  };

  const handleCatLeave = () => {
    catTimeoutRef.current = setTimeout(() => setCatOpen(false), 150);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  const role = dbUser?.role;
  const isAdmin = role === "ADMIN";
  const isSeller = role === "SELLER";

  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isSeller
    ? "/seller/dashboard"
    : "/buyer/dashboard";

  const avatarUrl = clerkUser?.imageUrl ?? dbUser?.avatarUrl;
  const displayName =
    dbUser
      ? `${dbUser.firstName} ${dbUser.lastName}`.trim()
      : clerkUser?.firstName ?? clerkUser?.username ?? "Account";

  const accountSkeleton = (
    <div className="hidden md:flex items-center gap-2 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <div className="w-20 h-4 bg-gray-200 rounded" />
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        {/* ───── Main Row ───── */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-1">
            <AliExpressLogo className="h-9 w-auto hidden sm:block" />
            <AliExpressLogo className="h-7 w-auto sm:hidden" />
          </Link>

          {/* All Categories + Search Bar — Desktop (same line) */}
          <div className="hidden md:flex flex-1 items-stretch h-10">
            {/* All Categories Button */}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={handleCatEnter}
              onMouseLeave={handleCatLeave}
            >
              <button className="flex items-center gap-2 h-full px-4 bg-[#1A1A1A] text-white text-sm font-medium rounded-l-lg hover:bg-[#333] transition-colors">
                <Menu className="w-4 h-4" />
                <span className="hidden lg:inline">All Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    catOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ─── Tesla-style Mega Dropdown ─── */}
              <div
                className={`absolute left-0 top-full w-[600px] bg-white rounded-b-2xl shadow-2xl border border-gray-100 z-50 transition-all duration-200 origin-top ${
                  catOpen
                    ? "opacity-100 scale-y-100 pointer-events-auto"
                    : "opacity-0 scale-y-95 pointer-events-none"
                }`}
              >
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                    {NAV_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="group flex items-center gap-2 py-2.5 px-3 -mx-3 rounded-lg text-sm text-gray-600 hover:text-[#E53935] hover:bg-red-50/60 transition-all duration-150"
                        onClick={() => setCatOpen(false)}
                      >
                        <span className="flex-1">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 text-[#E53935]" />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#E53935] hover:underline"
                      onClick={() => setCatOpen(false)}
                    >
                      Browse All Products
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-stretch border-2 border-l-0 border-gray-200 rounded-r-lg overflow-hidden focus-within:border-[#E53935] transition-colors"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for products, brands, categories..."
                className="flex-1 px-4 text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-5 bg-[#E53935] text-white text-sm font-semibold hover:bg-[#C62828] transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Right Icon Group */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Products link */}
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs font-medium">Products</span>
            </Link>

            {/* Stores link */}
            <Link
              href="/stores"
              className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors"
            >
              <Store className="w-5 h-5" />
              <span className="text-xs font-medium">Stores</span>
            </Link>

            {/* Wishlist */}
            <button className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-xs font-medium">Wishlist</span>
            </button>

            {/* Cart */}
            <CartIcon />

            {/* Account — desktop */}
            <div className="relative hidden md:block">
              {(!isLoaded || (isSignedIn && dbLoading)) && accountSkeleton}

              {/* Not signed in */}
              {isLoaded && !isSignedIn && (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-xs font-medium">Account</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                          <p className="text-xs text-gray-400">Welcome to AliExpress</p>
                          <p className="text-sm font-semibold text-[#1A1A1A]">
                            Sign in to your account
                          </p>
                        </div>
                        <Link
                          href="/auth/login"
                          className="flex items-center px-4 py-2.5 text-sm font-semibold text-[#E53935] hover:bg-gray-50 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E53935] transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          Create Account
                        </Link>
                        <Link
                          href="/auth/register/seller"
                          className="flex items-center px-4 py-2.5 text-sm text-[#E53935] hover:bg-red-50 font-medium transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          Start Selling
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Signed in */}
              {isLoaded && isSignedIn && !dbLoading && (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#E53935]/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
                      {displayName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{dbUser?.email}</p>
                          {dbUser?.role && (
                            <span className="inline-block mt-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                              {dbUser.role}
                            </span>
                          )}
                        </div>

                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E53935] transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {isAdmin ? "Admin Panel" : isSeller ? "Seller Dashboard" : "My Dashboard"}
                        </Link>

                        {!isSeller && !isAdmin && (
                          <Link
                            href="/auth/register/seller"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E53935] hover:bg-red-50 transition-colors"
                            onClick={() => setAccountOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Start Selling
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#E53935] hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ───── Mobile Search ───── */}
        <div className="md:hidden px-4 pb-3">
          <form
            onSubmit={handleSearch}
            className="flex items-stretch border-2 border-[#E53935] rounded-lg overflow-hidden h-9"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-3 text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-[#E53935] px-4 text-white hover:bg-[#C62828] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ───── Mobile Drawer ───── */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-1 max-h-[calc(100vh-120px)] overflow-y-auto">
              {isLoaded && isSignedIn ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 rounded-lg">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center text-white font-bold">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{dbUser?.email}</p>
                    </div>
                  </div>

                  {[
                    { label: "Products", href: "/shop" },
                    { label: "Stores", href: "/stores" },
                    ...(isSeller || isAdmin
                      ? [{ label: "Dashboard", href: dashboardHref }]
                      : [{ label: "Start Selling", href: "/auth/register/seller" }]),
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-sm font-medium text-gray-700 hover:text-[#E53935] hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-left text-sm font-medium text-red-500 hover:bg-red-50 py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {[
                    { label: "Products", href: "/shop" },
                    { label: "Stores", href: "/stores" },
                    { label: "Sign In", href: "/auth/login" },
                    { label: "Create Account", href: "/auth/register" },
                    { label: "Start Selling", href: "/auth/register/seller" },
                    { label: "Wishlist", href: "#" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-sm font-medium text-gray-700 hover:text-[#E53935] hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  Categories
                </p>
                {NAV_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    className="block text-sm text-gray-600 hover:text-[#E53935] py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Overlay for mega menu ─── */}
      {catOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px] transition-opacity duration-200"
          onMouseEnter={handleCatLeave}
        />
      )}
    </>
  );
}
