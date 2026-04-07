"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Smartphone,
  Shirt,
  Home,
  Gem,
  Sparkles,
  Glasses,
  ShoppingBag as BagIcon,
  UtensilsCrossed,
  Dumbbell,
  Flame,
  PawPrint,
  Baby,
  Car,
  PenTool,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import CartIcon from "@/components/cart/CartIcon";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

// Subcategory thumbnail images (category-slug → sub-slug → image)
const SUB_IMAGES: Record<string, Record<string, string>> = {
  electronics: {
    "phone-accessories": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=120&h=120&fit=crop",
    "chargers-cables": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=120&h=120&fit=crop",
    earbuds: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=120&h=120&fit=crop",
    "screen-protectors": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&h=120&fit=crop",
    "smart-gadgets": "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=120&h=120&fit=crop",
  },
  "womens-apparel": {
    dresses: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop",
    "tops-blouses": "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=120&h=120&fit=crop",
    skirts: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=120&h=120&fit=crop",
    shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=120&h=120&fit=crop",
    activewear: "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=120&h=120&fit=crop",
  },
  "mens-apparel": {
    "t-shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop",
    shirts: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=120&h=120&fit=crop",
    pants: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&h=120&fit=crop",
    hoodies: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=120&h=120&fit=crop",
    shoes: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=120&h=120&fit=crop",
  },
  "home-living": {
    "pillows-bedding": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=120&h=120&fit=crop",
    curtains: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&h=120&fit=crop",
    lighting: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=120&h=120&fit=crop",
    storage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop",
    decor: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=120&h=120&fit=crop",
  },
  jewelry: {
    rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120&h=120&fit=crop",
    necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=120&h=120&fit=crop",
    bracelets: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=120&h=120&fit=crop",
    earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=120&h=120&fit=crop",
    watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=120&h=120&fit=crop",
  },
  "beauty-skincare": {
    "face-care": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop",
    "lip-products": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=120&h=120&fit=crop",
    "eye-makeup": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=120&h=120&fit=crop",
    "tools-brushes": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&h=120&fit=crop",
    fragrances: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=120&fit=crop",
  },
  "fashion-accessories": {
    sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop",
    "hats-caps": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=120&h=120&fit=crop",
    scarves: "https://images.unsplash.com/photo-1601924921557-45e8e0220d44?w=120&h=120&fit=crop",
    belts: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    "hair-accessories": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&h=120&fit=crop",
  },
  "bags-wallets": {
    handbags: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&h=120&fit=crop",
    backpacks: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    "crossbody-bags": "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=120&h=120&fit=crop",
    wallets: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=120&h=120&fit=crop",
    "travel-bags": "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=120&h=120&fit=crop",
  },
  kitchen: {
    utensils: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop",
    storage: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=120&h=120&fit=crop",
    gadgets: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=120&h=120&fit=crop",
    drinkware: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&fit=crop",
    bakeware: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=120&h=120&fit=crop",
  },
  "sports-fitness": {
    yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&h=120&fit=crop",
    "gym-equipment": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&h=120&fit=crop",
    sportswear: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&h=120&fit=crop",
    "water-bottles": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&h=120&fit=crop",
    outdoor: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=120&h=120&fit=crop",
  },
  "tiktok-trending": {
    "led-lights": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop",
    "aesthetic-room": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=120&h=120&fit=crop",
    "mini-gadgets": "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=120&h=120&fit=crop",
    "phone-accessories": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=120&h=120&fit=crop",
    "fun-items": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop",
  },
  "pet-supplies": {
    "dog-toys": "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=120&h=120&fit=crop",
    "cat-toys": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=120&h=120&fit=crop",
    "pet-beds": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=120&h=120&fit=crop",
    feeders: "https://images.unsplash.com/photo-1583337130417-13104dec14c6?w=120&h=120&fit=crop",
    grooming: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=120&h=120&fit=crop",
  },
  "baby-kids": {
    toys: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=120&h=120&fit=crop",
    clothing: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=120&h=120&fit=crop",
    "bottles-feeding": "https://images.unsplash.com/photo-1584839404267-0ede0d14c633?w=120&h=120&fit=crop",
    carriers: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&h=120&fit=crop",
    safety: "https://images.unsplash.com/photo-1584839404267-0ede0d14c633?w=120&h=120&fit=crop",
  },
  "auto-accessories": {
    "phone-mounts": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=120&h=120&fit=crop",
    "seat-covers": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=120&h=120&fit=crop",
    "led-strips": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop",
    organizers: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=120&h=120&fit=crop",
    "dash-cams": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=120&h=120&fit=crop",
  },
  "stationery-office": {
    notebooks: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=120&h=120&fit=crop",
    pens: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=120&h=120&fit=crop",
    "desk-organizers": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=120&h=120&fit=crop",
    "art-supplies": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&fit=crop",
    planners: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=120&h=120&fit=crop",
  },
  "hardware-tools": {
    "hand-tools": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=120&h=120&fit=crop",
    "led-bulbs": "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=120&h=120&fit=crop",
    "tape-adhesives": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=120&h=120&fit=crop",
    measuring: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=120&h=120&fit=crop",
    "power-accessories": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=120&h=120&fit=crop",
  },
};

const NAV_CATEGORIES: {
  name: string;
  slug: string;
  icon: LucideIcon;
  subs: { name: string; slug: string }[];
}[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: Smartphone,
    subs: [
      { name: "Phone accessories", slug: "phone-accessories" },
      { name: "wheels & Flight Joysticks", slug: "wheels-joysticks" },
      { name: "Handheld Game Players", slug: "handheld-game" },
      { name: "Camera Cages", slug: "camera-cages" },
      { name: "Smart Gadgets", slug: "smart-gadgets" },
    ],
  },
  {
    name: "Women's Apparel",
    slug: "womens-apparel",
    icon: Shirt,
    subs: [
      { name: "Dresses", slug: "dresses" },
      { name: "Tops & Blouses", slug: "tops-blouses" },
      { name: "Skirts", slug: "skirts" },
      { name: "Shoes", slug: "shoes" },
      { name: "Activewear", slug: "activewear" },
    ],
  },
  {
    name: "Men's Apparel",
    slug: "mens-apparel",
    icon: Shirt,
    subs: [
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Shirts", slug: "shirts" },
      { name: "Pants", slug: "pants" },
      { name: "jackets", slug: "jackets" },
      { name: "Shoes", slug: "shoes" },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    icon: Home,
    subs: [
      { name: "Pillows & Bedding", slug: "pillows-bedding" },
      { name: "Curtains", slug: "curtains" },
      { name: "Lighting", slug: "lighting" },
      { name: "Storage", slug: "storage" },
      { name: "Decor", slug: "decor" },
    ],
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    icon: Gem,
    subs: [
      { name: "Rings", slug: "rings" },
      { name: "Earrings and Necklaces", slug: "earrings-necklaces" },
      { name: "Bracelets", slug: "bracelets" },
      { name: "Watches", slug: "watches" },
    ],
  },
  {
    name: "Beauty & Skincare",
    slug: "beauty-skincare",
    icon: Sparkles,
    subs: [
      { name: "Face Care", slug: "face-care" },
      { name: "Lip Products", slug: "lip-products" },
      { name: "Eye Makeup", slug: "eye-makeup" },
      { name: "Tools & Brushes", slug: "tools-brushes" },
      { name: "Fragrances", slug: "fragrances" },
    ],
  },
  {
    name: "Fashion Accessories",
    slug: "fashion-accessories",
    icon: Glasses,
    subs: [
      { name: "Sunglasses", slug: "sunglasses" },
      { name: "Hats & Caps", slug: "hats-caps" },
      { name: "Scarves", slug: "scarves" },
      { name: "Belts", slug: "belts" },
      { name: "Hair Accessories", slug: "hair-accessories" },
    ],
  },
  {
    name: "Bags & Wallets",
    slug: "bags-wallets",
    icon: BagIcon,
    subs: [
      { name: "Handbags", slug: "handbags" },
      { name: "Backpacks", slug: "backpacks" },
      { name: "Crossbody Bags", slug: "crossbody-bags" },
      { name: "Wallets", slug: "wallets" },
      { name: "Travel Bags", slug: "travel-bags" },
    ],
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    icon: UtensilsCrossed,
    subs: [
      { name: "Utensils", slug: "utensils" },
      { name: "Storage", slug: "storage" },
      { name: "Gadgets", slug: "gadgets" },
      { name: "Drinkware", slug: "drinkware" },
      { name: "Bakeware", slug: "bakeware" },
    ],
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    icon: Dumbbell,
    subs: [
      { name: "Yoga", slug: "yoga" },
      { name: "Gym Equipment", slug: "gym-equipment" },
      { name: "Sportswear", slug: "sportswear" },
      { name: "Water Bottles", slug: "water-bottles" },
      { name: "Outdoor", slug: "outdoor" },
    ],
  },
  {
    name: "TikTok Trending",
    slug: "tiktok-trending",
    icon: Flame,
    subs: [
      { name: "LED Lights", slug: "led-lights" },
      { name: "Aesthetic Room", slug: "aesthetic-room" },
      { name: "Mini Gadgets", slug: "mini-gadgets" },
      { name: "Phone Accessories", slug: "phone-accessories" },
      { name: "Fun Items", slug: "fun-items" },
    ],
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    icon: PawPrint,
    subs: [
      { name: "Dog Toys", slug: "dog-toys" },
      { name: "Cat Toys", slug: "cat-toys" },
      { name: "Pet Beds", slug: "pet-beds" },
      { name: "Feeders", slug: "feeders" },
      { name: "Grooming", slug: "grooming" },
    ],
  },
  {
    name: "Baby & Kids",
    slug: "baby-kids",
    icon: Baby,
    subs: [
      { name: "Toys", slug: "toys" },
      { name: "Clothing", slug: "clothing" },
      { name: "Bottles & Feeding", slug: "bottles-feeding" },
      { name: "Carriers", slug: "carriers" },
      { name: "Safety", slug: "safety" },
    ],
  },
  {
    name: "Auto Accessories",
    slug: "auto-accessories",
    icon: Car,
    subs: [
      { name: "Phone Mounts", slug: "phone-mounts" },
      { name: "Seat Covers", slug: "seat-covers" },
      { name: "LED Strips", slug: "led-strips" },
      { name: "Organizers", slug: "organizers" },
      { name: "Dash Cams", slug: "dash-cams" },
    ],
  },
  {
    name: "Stationery & Office",
    slug: "stationery-office",
    icon: PenTool,
    subs: [
      { name: "Notebooks", slug: "notebooks" },
      { name: "Pens", slug: "pens" },
      { name: "Desk Organizers", slug: "desk-organizers" },
      { name: "Art Supplies", slug: "art-supplies" },
      { name: "Planners", slug: "planners" },
    ],
  },
  {
    name: "Hardware & Tools",
    slug: "hardware-tools",
    icon: Wrench,
    subs: [
      { name: "Hand Tools", slug: "hand-tools" },
      { name: "LED Bulbs", slug: "led-bulbs" },
      { name: "Tape & Adhesives", slug: "tape-adhesives" },
      { name: "Measuring", slug: "measuring" },
      { name: "Power Accessories", slug: "power-accessories" },
    ],
  },
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
  const [activeCatSlug, setActiveCatSlug] = useState<string>(NAV_CATEGORIES[0]?.slug ?? "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    if (catOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [catOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatOpen(false);
    };
    if (catOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [catOpen]);

  const toggleCatDropdown = () => {
    setCatOpen((prev) => !prev);
    if (!catOpen) setActiveCatSlug(NAV_CATEGORIES[0]?.slug ?? "");
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
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={toggleCatDropdown}
                className="flex items-center gap-2 h-full px-4 bg-[#1A1A1A] text-white text-sm font-medium rounded-l-lg hover:bg-[#333] transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden lg:inline">All Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    catOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ─── AliExpress-style Full-Width Dropdown (Click to open) ─── */}
              {catOpen && (
                <div className="fixed left-0 top-auto w-screen bg-white shadow-2xl border-t border-gray-100 z-50">
                  <div className="max-w-[1400px] mx-auto flex" style={{ minHeight: "480px" }}>
                    {/* Left panel — Category list with icons */}
                    <div className="w-[260px] bg-[#FAFAFA] border-r border-gray-100 overflow-y-auto flex-shrink-0">
                      {NAV_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCatSlug === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            className={`w-full flex items-center gap-3 px-5 py-[11px] text-[13px] transition-all duration-100 text-left border-l-[3px] ${
                              isActive
                                ? "bg-white text-[#1A1A1A] font-semibold border-l-[#E53935]"
                                : "text-gray-600 hover:bg-white/80 border-l-transparent"
                            }`}
                            onClick={() => setActiveCatSlug(cat.slug)}
                          >
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${
                              isActive ? "text-[#E53935]" : "text-gray-400"
                            }`} />
                            <span className="flex-1 leading-snug">{cat.name}</span>
                            <ChevronRight className={`w-3.5 h-3.5 ${
                              isActive ? "text-gray-400" : "text-gray-200"
                            }`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Right panel — Recommended images + Subcategory text links */}
                    <div className="flex-1 overflow-y-auto py-6 px-8">
                      {(() => {
                        const activeCat = NAV_CATEGORIES.find((c) => c.slug === activeCatSlug);
                        if (!activeCat) return null;
                        const catImages = SUB_IMAGES[activeCatSlug] ?? {};

                        return (
                          <div>
                            {/* Recommended — subcategory image cards */}
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                              Recommended
                            </h4>
                            <div className="flex gap-5 flex-wrap mb-6 pb-6 border-b border-gray-100">
                              {activeCat.subs.map((sub) => {
                                const imgUrl = catImages[sub.slug];
                                return (
                                  <Link
                                    key={sub.slug}
                                    href={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}`}
                                    className="flex-shrink-0 group/rec text-center"
                                    onClick={() => setCatOpen(false)}
                                  >
                                    <div className="w-[100px] h-[100px] rounded-xl bg-gray-50 border border-gray-100 overflow-hidden mb-2 group-hover/rec:border-[#E53935]/40 group-hover/rec:shadow-md transition-all">
                                      {imgUrl ? (
                                        <Image
                                          src={imgUrl}
                                          alt={sub.name}
                                          width={100}
                                          height={100}
                                          className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-200"
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                          <ShoppingBag className="w-8 h-8" />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[12px] text-gray-600 group-hover/rec:text-[#E53935] font-medium transition-colors w-[100px] leading-tight">
                                      {sub.name}
                                    </p>
                                  </Link>
                                );
                              })}
                            </div>

                            {/* Subcategory text columns */}
                            <div className="grid grid-cols-5 gap-x-8 gap-y-5">
                              {activeCat.subs.map((sub) => (
                                <div key={sub.slug}>
                                  <Link
                                    href={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}`}
                                    className="text-[13px] font-bold text-gray-900 hover:text-[#E53935] transition-colors block mb-2"
                                    onClick={() => setCatOpen(false)}
                                  >
                                    {sub.name}
                                  </Link>
                                  <div className="space-y-1.5">
                                    <Link
                                      href={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}`}
                                      className="block text-[13px] text-gray-500 hover:text-[#E53935] transition-colors"
                                      onClick={() => setCatOpen(false)}
                                    >
                                      All {sub.name}
                                    </Link>
                                    <Link
                                      href={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}&sort=newest`}
                                      className="block text-[13px] text-gray-500 hover:text-[#E53935] transition-colors"
                                      onClick={() => setCatOpen(false)}
                                    >
                                      New Arrivals
                                    </Link>
                                    <Link
                                      href={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}&sort=rating`}
                                      className="block text-[13px] text-gray-500 hover:text-[#E53935] transition-colors"
                                      onClick={() => setCatOpen(false)}
                                    >
                                      Top Rated
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
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
                {NAV_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.slug}>
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-[#E53935] py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        {cat.name}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Overlay for mega menu ─── */}
      {catOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px] transition-opacity duration-200"
          onClick={() => setCatOpen(false)}
        />
      )}
    </>
  );
}
