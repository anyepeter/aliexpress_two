"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  XCircle,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Star,
  Trash2,
  Plus,
  Search,
  MessageSquare,
  Clock,
} from "lucide-react";

// ── Types (same as SellerDetailModal) ──

type Tab = "info" | "store" | "orders" | "financials" | "withdrawals" | "documents" | "reviews";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  baseCost: number;
  profit: number;
  createdAt: string;
  buyer: { firstName: string; lastName: string };
  itemCount: number;
}

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  method: string;
  requestedAt: string;
}

interface SellerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
  store: {
    id: string;
    storeName: string;
    storeSlug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    businessType: string | null;
    businessRegNo: string | null;
    idDocumentUrl: string | null;
    taxDocumentUrl: string | null;
    country: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    websiteUrl: string | null;
    socialLinks: unknown;
    isVerified: boolean;
    isPremium: boolean;
    adminNotes: string | null;
    approvedAt: string | null;
    approvedBy: string | null;
    createdAt: string;
    averageRating: number | null;
    totalReviews: number;
    ratingOverride: number | null;
    analytics: {
      totalViews: number;
      totalOrders: number;
      totalRevenue: number;
      totalProfit: number;
      revenueAdjustment: number;
    } | null;
    _count: { sellerProducts: number };
    orders: OrderItem[];
    withdrawals: WithdrawalItem[];
  } | null;
  orderStats: { total: number; pending: number; completed: number; rejected: number };
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  SUSPENDED: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700",
};

const TABS: { key: Tab; label: string }[] = [
  { key: "info", label: "Personal" },
  { key: "store", label: "Store" },
  { key: "orders", label: "Orders" },
  { key: "reviews", label: "Reviews" },
  { key: "financials", label: "Revenue" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "documents", label: "Documents" },
];

// ── Review types ──
interface StoreReviewItem {
  id: string;
  buyerId: string;
  orderId: string;
  itemRating: number;
  communicationRating: number;
  shippingRating: number;
  overallRating: number;
  comment: string | null;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  createdAt: string;
  buyer: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
}

interface BuyerOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-2 border-b border-gray-50">
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function RatingOverrideSection({ storeId, currentOverride, averageRating, onUpdated }: {
  storeId: string; currentOverride: number | null; averageRating: number | null; onUpdated: (v: number | null) => void;
}) {
  const [value, setValue] = useState(currentOverride?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const handleSave = async (override: number | null) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/store-rating", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId, ratingOverride: override }) });
      if (res.ok) { onUpdated(override); if (override === null) setValue(""); }
    } finally { setSaving(false); }
  };
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Store Rating Override</p>
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 mb-1">
            Organic avg: <strong>{averageRating?.toFixed(1) ?? "No reviews"}</strong>
            {currentOverride !== null && <span className="text-amber-600 ml-2">Overridden to: {currentOverride.toFixed(1)}</span>}
          </p>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="5" step="0.1" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 4.5" className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
            <button onClick={() => handleSave(parseFloat(value))} disabled={saving || !value || isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 5} className="px-3 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-50">{saving ? "..." : "Set"}</button>
            {currentOverride !== null && <button onClick={() => handleSave(null)} disabled={saving} className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">Remove Override</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDetailPage({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<StoreReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerResults, setBuyerResults] = useState<BuyerOption[]>([]);
  const [buyerSearching, setBuyerSearching] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerOption | null>(null);
  const [newItemRating, setNewItemRating] = useState(0);
  const [newCommsRating, setNewCommsRating] = useState(0);
  const [newShipRating, setNewShipRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/seller-details?sellerId=${sellerId}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const store = data?.store;
  const analytics = store?.analytics;

  const handleAdjust = async (direction: "add" | "subtract") => {
    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0 || !store) return;
    setAdjusting(true); setAdjustMsg(null);
    try {
      const amount = direction === "add" ? num : -num;
      const res = await fetch("/api/admin/adjust-revenue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId: store.id, amount }) });
      const result = await res.json();
      if (res.ok) {
        setData((prev) => prev ? { ...prev, store: { ...prev.store!, analytics: prev.store!.analytics ? { ...prev.store!.analytics, revenueAdjustment: result.revenueAdjustment } : { totalViews: 0, totalOrders: 0, totalRevenue: 0, totalProfit: 0, revenueAdjustment: result.revenueAdjustment } } } : prev);
        setAdjustMsg({ type: "ok", text: `Revenue ${direction === "add" ? "increased" : "decreased"} by $${num.toFixed(2)}` });
        setAdjustAmount(""); setAdjustReason("");
      } else { setAdjustMsg({ type: "err", text: result.error || "Failed" }); }
    } catch { setAdjustMsg({ type: "err", text: "Network error" }); } finally { setAdjusting(false); }
  };

  // Load reviews when Reviews tab is selected
  const loadReviews = async () => {
    if (!store) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/admin/store-reviews?storeId=${store.id}`);
      if (res.ok) setReviews(await res.json());
    } finally { setReviewsLoading(false); }
  };

  useEffect(() => {
    if (tab === "reviews" && store && reviews.length === 0) loadReviews();
  }, [tab, store]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all buyers when add review form opens
  useEffect(() => {
    if (!showAddReview || buyerResults.length > 0) return;
    setBuyerSearching(true);
    fetch(`/api/messages/conversations/search-users?all=true&roles=BUYER,SELLER`)
      .then((r) => r.ok ? r.json() : [])
      .then(setBuyerResults)
      .finally(() => setBuyerSearching(false));
  }, [showAddReview]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredBuyers = buyerSearch
    ? buyerResults.filter((b) => `${b.firstName} ${b.lastName} ${b.email}`.toLowerCase().includes(buyerSearch.toLowerCase()))
    : buyerResults;

  const submitAdminReview = async () => {
    if (!selectedBuyer || !store || newItemRating === 0 || newCommsRating === 0 || newShipRating === 0) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/admin/store-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          buyerId: selectedBuyer.id,
          itemRating: newItemRating,
          communicationRating: newCommsRating,
          shippingRating: newShipRating,
          comment: newComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowAddReview(false);
        setSelectedBuyer(null);
        setNewItemRating(0); setNewCommsRating(0); setNewShipRating(0);
        setNewComment(""); setBuyerSearch(""); setBuyerResults([]);
        loadReviews();
      }
    } finally { setSubmittingReview(false); }
  };

  const deleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId);
    try {
      const res = await fetch(`/api/admin/store-reviews?reviewId=${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } finally { setDeletingReview(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /><span className="ml-2 text-gray-400">Loading seller details...</span></div>;
  if (error) return <div className="flex flex-col items-center py-32 text-red-500"><XCircle className="w-8 h-8 mb-2" /><p>{error}</p></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/sellers")} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {data.avatarUrl ? (
            <Image src={data.avatarUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
              <span className="text-white font-bold">{data.firstName[0]}{data.lastName[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{data.firstName} {data.lastName}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[data.status] ?? "bg-gray-100 text-gray-600"}`}>{data.status.replace(/_/g, " ")}</span>
            </div>
            <p className="text-sm text-gray-400">{store?.storeName ?? "No store"} · {data.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* ── Personal Info ── */}
        {tab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <Field label="First Name" value={data.firstName} />
              <Field label="Last Name" value={data.lastName} />
              <Field label="Email" value={data.email} />
              <Field label="Phone" value={data.phone} />
              <Field label="Password" value={data.password} />
              <Field label="Role" value={data.role} />
              <Field label="Status" value={data.status.replace(/_/g, " ")} />
              <Field label="Registered" value={formatDate(data.createdAt)} />
            </div>

            {store && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Overview</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <StatBox label="Products" value={store._count.sellerProducts} />
                  <StatBox label="Total Orders" value={data.orderStats.total} />
                  <StatBox label="Revenue" value={`$${((analytics?.totalRevenue ?? 0) + (analytics?.revenueAdjustment ?? 0)).toFixed(2)}`} />
                  <StatBox label="Store Views" value={analytics?.totalViews ?? 0} />
                  <StatBox label="Rating" value={store.ratingOverride ?? store.averageRating ?? "—"} />
                  <StatBox label="Reviews" value={store.totalReviews} />
                </div>
              </div>
            )}

            {store && (
              <RatingOverrideSection storeId={store.id} currentOverride={store.ratingOverride} averageRating={store.averageRating} onUpdated={(v) => setData((prev) => prev ? { ...prev, store: { ...prev.store!, ratingOverride: v } } : prev)} />
            )}
          </div>
        )}

        {/* ── Store Tab ── */}
        {tab === "store" && store && (
          <div className="space-y-6">
            {(store.bannerUrl || store.logoUrl) && (
              <div className="relative rounded-lg overflow-hidden bg-gray-50">
                {store.bannerUrl && <Image src={store.bannerUrl} alt="" width={800} height={200} className="w-full h-44 object-cover" />}
                {store.logoUrl && (
                  <div className={`${store.bannerUrl ? "absolute bottom-0 left-4 translate-y-1/2" : "mb-4"}`}>
                    <Image src={store.logoUrl} alt="" width={64} height={64} className="w-16 h-16 rounded-full border-4 border-white object-cover shadow" />
                  </div>
                )}
              </div>
            )}
            <div className={`grid grid-cols-2 gap-x-8 gap-y-1 ${store.bannerUrl && store.logoUrl ? "mt-10" : ""}`}>
              <Field label="Store Name" value={store.storeName} />
              <Field label="Slug" value={`/store/${store.storeSlug}`} />
              <Field label="Country" value={store.country} />
              <Field label="City" value={store.city} />
              <Field label="State" value={store.state} />
              <Field label="Postal Code" value={store.postalCode} />
              <Field label="Business Type" value={store.businessType} />
              <Field label="Reg. Number" value={store.businessRegNo} />
              <Field label="Website" value={store.websiteUrl} />
              <Field label="Verified" value={store.isVerified ? "Yes" : "No"} />
              <Field label="Premium" value={store.isPremium ? "Yes" : "No"} />
              <Field label="Store Created" value={formatDate(store.createdAt)} />
            </div>
            {store.description && <div><p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p><p className="text-sm text-gray-600 leading-relaxed">{store.description}</p></div>}
            {store.adminNotes && <div className="bg-gray-50 rounded-lg p-4"><p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Admin Notes</p><p className="text-sm text-gray-700">{store.adminNotes}</p></div>}
            <a href={`/store/${store.storeSlug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-[#E53935] font-medium hover:underline"><ExternalLink className="w-4 h-4" />View Public Store Page</a>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && store && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBox label="Total" value={data.orderStats.total} />
              <StatBox label="Pending" value={data.orderStats.pending} />
              <StatBox label="Completed" value={data.orderStats.completed} />
              <StatBox label="Rejected" value={data.orderStats.rejected} />
            </div>
            {store.orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {store.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{o.orderNumber}</p>
                      <p className="text-[11px] text-gray-400">{o.buyer.firstName} {o.buyer.lastName} · {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${o.totalAmount.toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400">{o.status} · {formatDate(o.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Revenue Tab ── */}
        {tab === "financials" && store && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Total Revenue" value={`$${((analytics?.totalRevenue ?? 0) + (analytics?.revenueAdjustment ?? 0)).toFixed(2)}`} />
              <StatBox label="Total Profit" value={`$${(analytics?.totalProfit ?? 0).toFixed(2)}`} />
              <StatBox label="Revenue Adjustment" value={`$${(analytics?.revenueAdjustment ?? 0).toFixed(2)}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Adjust Revenue</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Amount (USD)" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20" />
                <div className="flex gap-2">
                  <button onClick={() => handleAdjust("add")} disabled={adjusting || !adjustAmount} className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {adjusting ? "..." : "+ Add"}
                  </button>
                  <button onClick={() => handleAdjust("subtract")} disabled={adjusting || !adjustAmount} className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                    {adjusting ? "..." : "- Subtract"}
                  </button>
                </div>
                {adjustMsg && <p className={`text-xs ${adjustMsg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{adjustMsg.text}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Withdrawals Tab ── */}
        {tab === "withdrawals" && store && (
          <div>
            {store.withdrawals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No withdrawal requests</p>
            ) : (
              <div className="space-y-2">
                {store.withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">${w.amount.toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400">{w.method.replace(/_/g, " ")} · {formatDate(w.requestedAt)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${w.status === "APPROVED" ? "bg-green-50 text-green-700" : w.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Documents Tab ── */}
        {tab === "documents" && store && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">ID Document</p>
              {store.idDocumentUrl ? (
                <a href={store.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Image src={store.idDocumentUrl} alt="ID Document" width={400} height={250} className="rounded-lg border border-gray-200 max-h-60 object-contain" />
                </a>
              ) : <p className="text-sm text-gray-400">Not provided</p>}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Tax / VAT Certificate</p>
              {store.taxDocumentUrl ? (
                <a href={store.taxDocumentUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Image src={store.taxDocumentUrl} alt="Tax Document" width={400} height={250} className="rounded-lg border border-gray-200 max-h-60 object-contain" />
                </a>
              ) : <p className="text-sm text-gray-400">Not provided</p>}
            </div>
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {tab === "reviews" && store && (
          <div className="space-y-6">
            {/* Add Review Button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} for this store
                </p>
              </div>
              <button
                onClick={() => setShowAddReview(!showAddReview)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Create Review as Buyer</h3>

                {/* Buyer Dropdown */}
                {!selectedBuyer ? (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Select a Buyer</label>
                    {/* Filter input */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={buyerSearch}
                        onChange={(e) => setBuyerSearch(e.target.value)}
                        placeholder="Filter buyers..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                      />
                    </div>
                    {/* Buyer list */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                      {buyerSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          <span className="ml-2 text-sm text-gray-400">Loading buyers...</span>
                        </div>
                      ) : filteredBuyers.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No buyers found</p>
                      ) : (
                        filteredBuyers.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => { setSelectedBuyer(b); setBuyerSearch(""); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                          >
                            {b.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={b.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                {b.firstName[0]}{b.lastName[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{b.firstName} {b.lastName}</p>
                              <p className="text-[11px] text-gray-400 truncate">{b.email}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-200">
                    {selectedBuyer.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedBuyer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                        {selectedBuyer.firstName[0]}{selectedBuyer.lastName[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedBuyer.firstName} {selectedBuyer.lastName}</p>
                      <p className="text-[11px] text-gray-400">{selectedBuyer.email}</p>
                    </div>
                    <button onClick={() => setSelectedBuyer(null)} className="text-xs text-gray-400 hover:text-red-500">Change</button>
                  </div>
                )}

                {/* Star Ratings */}
                {selectedBuyer && (
                  <>
                    <div className="space-y-3">
                      {[
                        { label: "Item as Described", value: newItemRating, set: setNewItemRating },
                        { label: "Communication", value: newCommsRating, set: setNewCommsRating },
                        { label: "Shipping Speed", value: newShipRating, set: setNewShipRating },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{row.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} type="button" onClick={() => row.set(s)} className="p-0.5">
                                <Star className={`w-5 h-5 transition-colors ${s <= row.value ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      maxLength={500}
                      placeholder="Review comment (optional)..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setShowAddReview(false); setSelectedBuyer(null); setNewItemRating(0); setNewCommsRating(0); setNewShipRating(0); setNewComment(""); }}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitAdminReview}
                        disabled={submittingReview || newItemRating === 0 || newCommsRating === 0 || newShipRating === 0}
                        className="flex items-center gap-1.5 px-5 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-50"
                      >
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Submit Review
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10">
                <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No reviews yet for this store</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        {review.buyer.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={review.buyer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {review.buyer.firstName[0]}{review.buyer.lastName[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.buyer.firstName} {review.buyer.lastName}</p>
                          <p className="text-[10px] text-gray-400">{review.buyer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= Math.round(review.overallRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700">{review.overallRating.toFixed(1)}</span>
                        </div>
                        <button
                          onClick={() => deleteReview(review.id)}
                          disabled={deletingReview === review.id}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete review"
                        >
                          {deletingReview === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 text-[10px] text-gray-400 mb-2 ml-[42px]">
                      <span>Item: <strong className="text-gray-600">{review.itemRating}/5</strong></span>
                      <span>Communication: <strong className="text-gray-600">{review.communicationRating}/5</strong></span>
                      <span>Shipping: <strong className="text-gray-600">{review.shippingRating}/5</strong></span>
                      <span className="ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-gray-700 ml-[42px] bg-white rounded-lg p-2.5 border border-gray-100">
                        &quot;{review.comment}&quot;
                      </p>
                    )}

                    {review.sellerReply && (
                      <div className="ml-[42px] mt-2 bg-[#E53935]/5 border border-[#E53935]/10 rounded-lg p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3 text-[#E53935]" />
                          <span className="text-[10px] font-bold text-[#E53935]">Seller Reply</span>
                        </div>
                        <p className="text-xs text-gray-600">{review.sellerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
