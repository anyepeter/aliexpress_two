"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Search,
  Store,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Package,
  DollarSign,
  ShoppingBag,
  MapPin,
  Eye,
} from "lucide-react";
import Link from "next/link";
import SellerDetailModal from "./SellerDetailModal";

interface SellerStore {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  isVerified: boolean;
  isPremium: boolean;
  premiumOrder: number;
  country: string;
  city: string;
  productCount: number;
  totalRevenue: number;
  totalOrders: number;
  createdAt: string;
}

interface SellerItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  store: SellerStore | null;
}

interface Props {
  sellers: SellerItem[];
}

type FilterTab = "ALL" | "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";

export default function AdminSellersClient({ sellers: initialSellers }: Props) {
  const [sellers, setSellers] = useState(initialSellers);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewSellerId, setViewSellerId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      if (filter !== "ALL" && s.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.store?.storeName ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sellers, filter, search]);

  const handleAction = async (sellerId: string, action: "archive" | "activate") => {
    setActionLoading(sellerId);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sellerId }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) =>
            s.id === sellerId
              ? {
                  ...s,
                  status: action === "archive" ? "SUSPENDED" : "ACTIVE",
                  store: s.store
                    ? { ...s.store, isPremium: action === "archive" ? false : s.store.isPremium }
                    : null,
                }
              : s
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    ACTIVE: { label: "Active", bg: "bg-green-50", text: "text-green-700" },
    SUSPENDED: { label: "Archived", bg: "bg-gray-100", text: "text-gray-600" },
    PENDING_APPROVAL: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700" },
    PENDING_VERIFICATION: { label: "Unverified", bg: "bg-blue-50", text: "text-blue-700" },
    REJECTED: { label: "Rejected", bg: "bg-red-50", text: "text-red-700" },
  };

  const counts = {
    ALL: sellers.length,
    ACTIVE: sellers.filter((s) => s.status === "ACTIVE").length,
    SUSPENDED: sellers.filter((s) => s.status === "SUSPENDED").length,
    PENDING_APPROVAL: sellers.filter((s) => s.status === "PENDING_APPROVAL").length,
    REJECTED: sellers.filter((s) => s.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
        <p className="text-gray-500 mt-1">
          {sellers.length} seller{sellers.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or store..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["ALL", "ACTIVE", "SUSPENDED", "PENDING_APPROVAL", "REJECTED"] as FilterTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "ALL" ? "All" : f === "PENDING_APPROVAL" ? "Pending" : f.charAt(0) + f.slice(1).toLowerCase()}{" "}
              <span className="text-gray-400">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sellers List */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No sellers found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((seller) => {
              const isExpanded = expandedId === seller.id;
              const isLoading = actionLoading === seller.id || actionLoading === seller.store?.id;
              const config = statusConfig[seller.status] ?? statusConfig.ACTIVE;

              return (
                <div key={seller.id}>
                  <div
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : seller.id)}
                  >
                    <div className="flex items-center gap-3">
                      {seller.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={seller.avatarUrl}
                          alt={`${seller.firstName} ${seller.lastName}`}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-sm">
                            {seller.firstName[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {seller.firstName} {seller.lastName}
                          </p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>
                          {seller.store?.isPremium && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E53935]/10 text-[#E53935]">
                              Premium #{(seller.store.premiumOrder ?? 0) + 1}
                            </span>
                          )}
                          {seller.store?.isVerified && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {seller.store?.storeName ?? "No store"}
                          {seller.store && (
                            <span className="text-gray-400">
                              {" "}&bull; {seller.store.productCount} products
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* View full details */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewSellerId(seller.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#E53935] hover:bg-[#C62828]/10 transition-colors"
                          title="View full details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Archive / Activate */}
                        {seller.status === "ACTIVE" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(seller.id, "archive");
                            }}
                            disabled={!!isLoading}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Archive seller"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                          </button>
                        )}
                        {seller.status === "SUSPENDED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(seller.id, "activate");
                            }}
                            disabled={!!isLoading}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
                            title="Reactivate seller"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                        )}

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Seller Info</p>
                          <p className="text-sm text-gray-900">{seller.firstName} {seller.lastName}</p>
                          <p className="text-sm text-gray-600">{seller.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Joined {new Date(seller.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>
                        </div>
                        {seller.store && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Store Info</p>
                            <p className="text-sm text-gray-900 font-medium">{seller.store.storeName}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {seller.store.city}, {seller.store.country}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {seller.store.productCount} products
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {seller.store.totalOrders} orders
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${seller.store.totalRevenue.toFixed(2)}
                              </span>
                            </div>
                            <Link
                              href={`/store/${seller.store.storeSlug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-[#E53935] font-medium hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Store Page
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <SellerDetailModal
        sellerId={viewSellerId ?? ""}
        open={!!viewSellerId}
        onClose={() => setViewSellerId(null)}
        showActions={false}
      />
    </div>
  );
}
