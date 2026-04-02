"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Search,
  Store,
  Archive,
  RotateCcw,
  Loader2,
  Trash2,
  X,
  AlertTriangle,
  Star,
} from "lucide-react";


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
  averageRating: number | null;
  totalReviews: number;
  ratingOverride: number | null;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SellerItem | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async (sellerId: string) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", sellerId }),
      });
      if (res.ok) {
        setSellers((prev) => prev.filter((s) => s.id !== sellerId));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
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
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
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
            {filtered.map((seller, index) => {
              const isLoading = actionLoading === seller.id || actionLoading === seller.store?.id;
              const config = statusConfig[seller.status] ?? statusConfig.ACTIVE;

              return (
                <div
                  key={seller.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/sellers/${seller.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {seller.firstName} {seller.lastName}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                        {seller.store?.isVerified && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {seller.store?.storeName ?? "No store"}
                        {seller.store && (
                          <>
                            <span className="text-gray-300 mx-1">·</span>
                            <span className="text-gray-400">{seller.store.productCount} products</span>
                            <span className="text-gray-300 mx-1">·</span>
                            <span className="text-gray-400">{seller.store.totalOrders} orders</span>
                            <span className="text-gray-300 mx-1">·</span>
                            <span className="text-gray-400">${seller.store.totalRevenue.toFixed(2)}</span>
                            <span className="text-gray-300 mx-1">·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Star className={`w-3 h-3 ${(seller.store.ratingOverride ?? seller.store.averageRating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                              <span className="text-gray-500 font-medium">{(seller.store.ratingOverride ?? seller.store.averageRating ?? 0).toFixed(1)}</span>
                              <span className="text-gray-400">({seller.store.totalReviews})</span>
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Archive / Activate */}
                      {seller.status === "ACTIVE" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(seller.id, "archive");
                          }}
                          disabled={!!isLoading}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                          title="Deactivate seller"
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
                          className="p-1.5 rounded-lg text-gray-300 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                          title="Reactivate seller"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(seller);
                        }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete seller"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Delete {deleteTarget.firstName} {deleteTarget.lastName}?
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    This will permanently delete this seller account and remove all associated data including:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-500">
                    <li>· Their store ({deleteTarget.store?.storeName ?? "N/A"})</li>
                    <li>· All listed products ({deleteTarget.store?.productCount ?? 0})</li>
                    <li>· All orders ({deleteTarget.store?.totalOrders ?? 0})</li>
                    <li>· Withdrawal history and loan records</li>
                    <li>· All messages and conversations</li>
                  </ul>
                  <p className="text-sm text-red-500 font-medium mt-3">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting..." : "Delete Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
