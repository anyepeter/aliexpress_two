"use client";

import { useState, useMemo } from "react";
import {
  Star,
  Search,
  Store,
  Crown,
  CheckCircle2,
  Loader2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";

interface SellerStore {
  id: string;
  storeName: string;
  isPremium: boolean;
  premiumOrder: number;
  isVerified: boolean;
}

interface SellerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  store: SellerStore | null;
}

interface Props {
  initialSellers: SellerData[];
}

export default function AdminPremiumClient({ initialSellers }: Props) {
  const [sellers, setSellers] = useState<SellerData[]>(initialSellers);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [tab, setTab] = useState<"manage" | "premium">("manage");

  const premiumSellers = useMemo(
    () =>
      sellers
        .filter((s) => s.store?.isPremium)
        .sort((a, b) => (a.store?.premiumOrder ?? 0) - (b.store?.premiumOrder ?? 0)),
    [sellers]
  );

  const filteredSellers = useMemo(() => {
    if (!search) return sellers;
    const q = search.toLowerCase();
    return sellers.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.store?.storeName.toLowerCase().includes(q)
    );
  }, [sellers, search]);

  const handleTogglePremium = async (storeId: string, isPremium: boolean) => {
    setLoadingAction(storeId);
    try {
      const res = await fetch("/api/admin/premium", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleSellerPremium", storeId, isPremium }),
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
    } catch {
      alert("Failed to update premium status");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReorder = async (storeId: string, direction: "up" | "down") => {
    const list = [...premiumSellers];
    const idx = list.findIndex((s) => s.store?.id === storeId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];

    const order = list.map((s, i) => ({ storeId: s.store!.id, premiumOrder: i }));

    // Optimistic local update
    setSellers((prev) => {
      const updated = [...prev];
      for (const o of order) {
        const seller = updated.find((s) => s.store?.id === o.storeId);
        if (seller?.store) seller.store.premiumOrder = o.premiumOrder;
      }
      return [...updated];
    });

    setSavingOrder(true);
    try {
      await fetch("/api/admin/premium", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorderPremium", order }),
      });
    } catch {
      alert("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const stats = {
    total: sellers.length,
    premium: premiumSellers.length,
    withStore: sellers.filter((s) => s.store).length,
    verified: sellers.filter((s) => s.store?.isVerified).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          Premium Management
        </h1>
        <p className="text-gray-500 mt-1">
          Promote sellers to premium status. Premium sellers get highlighted across the platform.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Total Sellers</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
          <span className="text-xs font-medium text-amber-700">Premium Sellers</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{stats.premium}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">With Store</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.withStore}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Verified</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.verified}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("manage")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "manage" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Sellers ({stats.total})
        </button>
        <button
          onClick={() => setTab("premium")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === "premium" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          Premium ({stats.premium})
        </button>
      </div>

      {/* ── Premium list tab ── */}
      {tab === "premium" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Premium Sellers Order
            </h2>
            {savingOrder && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
          </div>

          {premiumSellers.length === 0 ? (
            <div className="py-16 text-center">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No premium sellers yet.</p>
              <p className="text-gray-400 text-xs mt-1">
                Go to &quot;All Sellers&quot; tab to promote sellers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {premiumSellers.map((seller, index) => (
                <div
                  key={seller.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleReorder(seller.store!.id, "up")}
                      disabled={index === 0}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(seller.store!.id, "down")}
                      disabled={index === premiumSellers.length - 1}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                  <span className="text-sm font-bold text-amber-500 w-6 text-center">
                    #{index + 1}
                  </span>

                  {seller.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seller.avatarUrl}
                      alt={`${seller.firstName} ${seller.lastName}`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-amber-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 ring-2 ring-amber-200">
                      <span className="text-sm font-bold text-white">
                        {seller.firstName[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      {seller.firstName} {seller.lastName}
                      <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <Store className="w-3 h-3" />
                      {seller.store?.storeName ?? "No store"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePremium(seller.store!.id, false)}
                    disabled={loadingAction === seller.store?.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {loadingAction === seller.store?.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Star className="w-3 h-3" />
                    )}
                    Remove Premium
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── All sellers tab ── */}
      {tab === "manage" && (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Sellers Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Seller</span>
              <span>Store</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredSellers.length === 0 ? (
              <div className="py-16 text-center">
                <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No sellers found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredSellers.map((seller) => {
                  const isPremium = seller.store?.isPremium ?? false;
                  const isLoading = loadingAction === seller.store?.id;

                  return (
                    <div
                      key={seller.id}
                      className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_120px] gap-3 md:gap-4 px-5 py-4 items-center transition-colors ${
                        isPremium ? "bg-amber-50/40" : "hover:bg-gray-50/50"
                      }`}
                    >
                      {/* Seller info */}
                      <div className="flex items-center gap-3">
                        {seller.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={seller.avatarUrl}
                            alt={`${seller.firstName} ${seller.lastName}`}
                            className={`w-10 h-10 rounded-full object-cover flex-shrink-0 ${
                              isPremium ? "ring-2 ring-amber-300" : ""
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isPremium
                                ? "bg-gradient-to-br from-amber-400 to-amber-500 ring-2 ring-amber-200"
                                : "bg-gradient-to-br from-gray-200 to-gray-300"
                            }`}
                          >
                            <span className={`text-sm font-bold ${isPremium ? "text-white" : "text-gray-600"}`}>
                              {seller.firstName[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                            {seller.firstName} {seller.lastName}
                            {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{seller.email}</p>
                        </div>
                      </div>

                      {/* Store */}
                      <div className="text-sm text-gray-600 flex items-center gap-1.5">
                        {seller.store ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{seller.store.storeName}</span>
                            {seller.store.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">No store</span>
                        )}
                      </div>

                      {/* Premium Status */}
                      <div>
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            <Star className="w-3 h-3 fill-amber-500" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                            Standard
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <div>
                        {seller.store ? (
                          <button
                            onClick={() => handleTogglePremium(seller.store!.id, !isPremium)}
                            disabled={isLoading}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${
                              isPremium
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star className={`w-3 h-3 ${isPremium ? "" : "fill-amber-500"}`} />
                            )}
                            {isPremium ? "Remove" : "Make Premium"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No store</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-center text-xs text-gray-400">
            Showing {filteredSellers.length} of {sellers.length} sellers
          </div>
        </>
      )}
    </div>
  );
}
