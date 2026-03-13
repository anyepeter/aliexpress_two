"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Search,
  Store,
  Star,
  StarOff,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  GripVertical,
  Crown,
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
  const router = useRouter();
  const [sellers, setSellers] = useState(initialSellers);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewSellerId, setViewSellerId] = useState<string | null>(null);
  const [showPremiumPanel, setShowPremiumPanel] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Premium sellers list (sorted by premiumOrder)
  const premiumSellers = useMemo(
    () =>
      sellers
        .filter((s) => s.store?.isPremium && s.status === "ACTIVE")
        .sort((a, b) => (a.store?.premiumOrder ?? 0) - (b.store?.premiumOrder ?? 0)),
    [sellers]
  );

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

  const handleTogglePremium = async (storeId: string, isPremium: boolean) => {
    setActionLoading(storeId);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePremium", storeId, isPremium }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) =>
            s.store?.id === storeId
              ? { ...s, store: { ...s.store!, isPremium, premiumOrder: isPremium ? 999 : 0 } }
              : s
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSavePremiumOrder = async () => {
    setPremiumLoading(true);
    try {
      const order = premiumSellers.map((s, i) => ({
        storeId: s.store!.id,
        premiumOrder: i,
      }));
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorderPremium", order }),
      });
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => {
            const match = order.find((o) => o.storeId === s.store?.id);
            if (match) {
              return { ...s, store: { ...s.store!, premiumOrder: match.premiumOrder } };
            }
            return s;
          })
        );
        router.refresh();
      }
    } finally {
      setPremiumLoading(false);
    }
  };

  const movePremium = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= premiumSellers.length) return;
    setSellers((prev) => {
      const updated = [...prev];
      const premiumIds = premiumSellers.map((s) => s.id);
      const fromSellerId = premiumIds[fromIdx];
      const toSellerId = premiumIds[toIdx];

      // Swap premiumOrder values
      return updated.map((s) => {
        if (s.id === fromSellerId) {
          return { ...s, store: { ...s.store!, premiumOrder: toIdx } };
        }
        if (s.id === toSellerId) {
          return { ...s, store: { ...s.store!, premiumOrder: fromIdx } };
        }
        return s;
      });
    });
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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
          <p className="text-gray-500 mt-1">
            {sellers.length} seller{sellers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowPremiumPanel(!showPremiumPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
        >
          <Crown className="w-4 h-4" />
          Premium Sellers ({premiumSellers.length})
        </button>
      </div>

      {/* Premium Sellers Panel */}
      {showPremiumPanel && (
        <Card className="p-5 border-2 border-[#E53935]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#E53935]" />
              Premium Sellers Order
            </h2>
            <button
              onClick={handleSavePremiumOrder}
              disabled={premiumLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-50"
            >
              {premiumLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Order
            </button>
          </div>

          {premiumSellers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No premium sellers yet. Use the star icon below to add sellers to the premium strip.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">
                Drag or use arrows to reorder. This controls the order on the landing page Premium Verified Sellers strip.
              </p>
              {premiumSellers.map((seller, idx) => (
                <div
                  key={seller.id}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== idx) {
                      movePremium(dragIndex, idx);
                    }
                    setDragIndex(null);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    dragIndex === idx ? "bg-[#E53935]/10 border-[#E53935]" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab shrink-0" />
                  <span className="text-sm font-bold text-[#E53935] w-6">{idx + 1}</span>
                  {seller.store?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seller.store.logoUrl}
                      alt={seller.store.storeName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {seller.store?.storeName[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {seller.store?.storeName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {seller.firstName} {seller.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => movePremium(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => movePremium(idx, idx + 1)}
                      disabled={idx === premiumSellers.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTogglePremium(seller.store!.id, false)}
                      className="p-1 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
                      title="Remove from premium"
                    >
                      <StarOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

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

                        {/* Premium toggle (only for active, verified sellers) */}
                        {seller.store && seller.status === "ACTIVE" && seller.store.isVerified && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePremium(seller.store!.id, !seller.store!.isPremium);
                            }}
                            disabled={!!isLoading}
                            className={`p-1.5 rounded-lg transition-colors ${
                              seller.store.isPremium
                                ? "text-[#E53935] bg-[#E53935]/10 hover:bg-[#C62828]/20"
                                : "text-gray-400 hover:text-[#E53935] hover:bg-[#C62828]/10"
                            }`}
                            title={seller.store.isPremium ? "Remove from premium" : "Add to premium"}
                          >
                            {seller.store.isPremium ? (
                              <Star className="w-4 h-4 fill-current" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </button>
                        )}

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
