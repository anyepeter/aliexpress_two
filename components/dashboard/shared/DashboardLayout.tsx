"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  BarChart2,
  Settings,
  Users,
  Store,
  Heart,
  ShieldCheck,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  UserCircle,
  Eye,
  Star,
  Megaphone,
} from "lucide-react";
import { useUnreadCount } from "@/lib/hooks/useUnreadCount";

type Role = "ADMIN" | "SELLER" | "BUYER";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Sellers", href: "/admin/sellers", icon: Store },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    // { label: "Today's Deals", href: "/admin/deals", icon: ShoppingBag },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Loans", href: "/admin/loans", icon: CreditCard },
    { label: "Visitors", href: "/admin/visitors", icon: Eye },
    { label: "Premium", href: "/admin/premium", icon: Star },
    { label: "Advertisements", href: "/admin/advertisements", icon: Megaphone },
    { label: "AI Analysis", href: "/admin/ai-analysis", icon: BarChart2 },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  ],
  SELLER: [
    { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "My Store", href: "/seller/store", icon: Store },
    { label: "Add Products", href: "/seller/products", icon: Package },
    { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
    { label: "Reviews", href: "/seller/reviews", icon: Star },
    { label: "Payments", href: "/seller/payments", icon: CreditCard },
    { label: "Loans", href: "/seller/loans", icon: CreditCard },
    { label: "Advertisements", href: "/seller/advertisements", icon: Megaphone },
    { label: "AI Analysis", href: "/seller/ai-analysis", icon: BarChart2 },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    // { label: "Store Settings", href: "/seller/settings", icon: Settings },
    // { label: "Analytics", href: "/seller/analytics", icon: BarChart2 },
  ],
  BUYER: [
    { label: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
    { label: "My Orders", href: "/buyer/orders", icon: ShoppingBag },
    { label: "Wishlist", href: "/buyer/wishlist", icon: Heart },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Account Settings", href: "/buyer/settings", icon: Settings },
  ],
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  SELLER: "bg-amber-100 text-amber-700",
  BUYER: "bg-blue-100 text-blue-700",
};

interface DashboardLayoutProps {
  role: Role;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    avatarUrl?: string | null;
    store?: { storeName: string; logoUrl?: string | null } | null;
  };
  children: React.ReactNode;
}

export default function DashboardLayout({ role, user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = NAV_BY_ROLE[role];
  const { unreadCount } = useUnreadCount();
  const displayName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const handleSignOut = async () => {
    await signOut(() => router.push("/"));
  };

  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-[#E53935] text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <ShieldCheck className="w-6 h-6 text-white" />
        <span className="font-bold text-lg">
          Ali<span className="text-white/80">Express</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href === "/messages" && pathname.startsWith("/messages"));
          const isMessages = label === "Messages";
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                  ? "bg-white text-[#E53935]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-white text-[#E53935] text-[10px] font-bold rounded-full px-1.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[role]}`}
            >
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden">{Sidebar}</div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E53935] lg:hidden" />
            <span className="font-bold text-[#E53935] lg:hidden">AliExpress</span>
          </div>

          <div className="flex-1" />

          {/* Bell */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user.firstName}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={`/${role.toLowerCase()}/profile`}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Back to store
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile close sidebar if open */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
