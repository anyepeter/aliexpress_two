"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  User,
  Mail,
  Phone,
  Store,
  MapPin,
  FileText,
  Shield,
  Calendar,
  Globe,
  Lock,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Wallet,
  Plus,
  Minus,
} from "lucide-react";

/* ── Types ── */

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  sellerRevenue: number;
  paymentMethod: string;
  createdAt: string;
  buyer: { firstName: string; lastName: string; email: string };
}

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  method: string;
  requestedAt: string;
  reviewedAt: string | null;
  adminNote: string | null;
}

interface SellerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  password: string;
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
    analytics: {
      totalViews: number;
      totalOrders: number;
      totalRevenue: number;
      totalProfit: number;
    } | null;
    _count: { sellerProducts: number };
    orders: OrderItem[];
    withdrawals: WithdrawalItem[];
  } | null;
  orderStats: {
    total: number;
    pending: number;
    shipping: number;
    completed: number;
    rejected: number;
  };
  withdrawalStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

type Tab = "info" | "store" | "orders" | "financials" | "withdrawals" | "documents";

interface Props {
  sellerId: string;
  open: boolean;
  onClose: () => void;
  onApprove?: (sellerId: string) => void;
  onReject?: (sellerId: string) => void;
  showActions?: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  PENDING_VERIFICATION: "bg-blue-50 text-blue-700",
  SUSPENDED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-50 text-red-700",
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING: "text-amber-600",
  CONTACTED_ADMIN: "text-blue-600",
  SHIPPING: "text-indigo-600",
  COMPLETED: "text-green-600",
  REJECTED: "text-red-500",
};

/* ── Helpers ── */

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="py-2">
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Tabs ── */

const TABS: { key: Tab; label: string }[] = [
  { key: "info", label: "Personal" },
  { key: "store", label: "Store" },
  { key: "orders", label: "Orders" },
  { key: "financials", label: "Revenue" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "documents", label: "Documents" },
];

/* ── Main Component ── */

export default function SellerDetailModal({
  sellerId,
  open,
  onClose,
  onApprove,
  onReject,
  showActions = true,
}: Props) {
  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("info");

  // Revenue adjustment
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!open || !sellerId) return;
    setLoading(true);
    setError(null);
    setTab("info");
    setAdjustAmount("");
    setAdjustReason("");
    setAdjustMsg(null);
    fetch(`/api/admin/seller-details?sellerId=${sellerId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load seller details");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, sellerId]);

  if (!open) return null;

  const store = data?.store;
  const analytics = store?.analytics;

  const handleAdjust = async (direction: "add" | "subtract") => {
    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0 || !store) return;
    setAdjusting(true);
    setAdjustMsg(null);
    try {
      const amount = direction === "add" ? num : -num;
      const res = await fetch("/api/admin/adjust-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id, amount }),
      });
      const result = await res.json();
      if (res.ok) {
        // Update local data
        setData((prev) => {
          if (!prev || !prev.store) return prev;
          return {
            ...prev,
            store: {
              ...prev.store!,
              analytics: prev.store!.analytics
                ? { ...prev.store!.analytics, totalRevenue: result.totalRevenue, totalProfit: result.totalProfit }
                : { totalViews: 0, totalOrders: 0, totalRevenue: result.totalRevenue, totalProfit: result.totalProfit },
            },
          };
        });
        setAdjustMsg({ type: "ok", text: `Revenue ${direction === "add" ? "increased" : "decreased"} by $${num.toFixed(2)}` });
        setAdjustAmount("");
        setAdjustReason("");
      } else {
        setAdjustMsg({ type: "err", text: result.error || "Failed to adjust" });
      }
    } catch {
      setAdjustMsg({ type: "err", text: "Network error" });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[calc(100vh-3rem)] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {data && !loading ? (
              <>
                {data.avatarUrl ? (
                  <Image src={data.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{data.firstName[0]}{data.lastName[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 truncate">{data.firstName} {data.lastName}</h2>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[data.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {data.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{store?.storeName ?? "No store"} · {data.email}</p>
                </div>
              </>
            ) : (
              <h2 className="text-base font-bold text-gray-900">Seller Details</h2>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        {data && !loading && (
          <div className="flex border-b border-gray-100 px-6 shrink-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Loading...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center py-20 text-red-500">
              <XCircle className="w-6 h-6 mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* ─── Personal Info Tab ─── */}
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

                  {/* Quick stats */}
                  {store && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Overview</p>
                      <div className="grid grid-cols-4 gap-3">
                        <StatBox label="Products" value={store._count.sellerProducts} />
                        <StatBox label="Total Orders" value={data.orderStats.total} />
                        <StatBox label="Revenue" value={`$${(analytics?.totalRevenue ?? 0).toFixed(2)}`} />
                        <StatBox label="Store Views" value={analytics?.totalViews ?? 0} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Store Tab ─── */}
              {tab === "store" && store && (
                <div className="space-y-6">
                  {(store.bannerUrl || store.logoUrl) && (
                    <div className="relative rounded-lg overflow-hidden bg-gray-50">
                      {store.bannerUrl && (
                        <Image src={store.bannerUrl} alt="" width={700} height={180} className="w-full h-36 object-cover" />
                      )}
                      {store.logoUrl && (
                        <div className={`${store.bannerUrl ? "absolute bottom-0 left-4 translate-y-1/2" : "mb-4"}`}>
                          <Image src={store.logoUrl} alt="" width={56} height={56} className="w-14 h-14 rounded-full border-4 border-white object-cover shadow" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`grid grid-cols-2 gap-x-8 gap-y-1 ${store.bannerUrl && store.logoUrl ? "mt-8" : ""}`}>
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

                  {store.description && (
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{store.description}</p>
                    </div>
                  )}

                  {store.adminNotes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Admin Notes</p>
                      <p className="text-sm text-gray-700">{store.adminNotes}</p>
                    </div>
                  )}

                  <a
                    href={`/store/${store.storeSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View public store page
                  </a>
                </div>
              )}
              {tab === "store" && !store && (
                <div className="text-center py-16 text-gray-400">
                  <Store className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No store created</p>
                </div>
              )}

              {/* ─── Orders Tab ─── */}
              {tab === "orders" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-5 gap-3">
                    <StatBox label="Total" value={data.orderStats.total} />
                    <StatBox label="Pending" value={data.orderStats.pending} />
                    <StatBox label="Shipping" value={data.orderStats.shipping} />
                    <StatBox label="Completed" value={data.orderStats.completed} />
                    <StatBox label="Rejected" value={data.orderStats.rejected} />
                  </div>

                  {(store?.orders?.length ?? 0) > 0 ? (
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Order</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Buyer</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase text-right">Amount</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {store!.orders.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{o.orderNumber}</td>
                              <td className="px-4 py-2.5 text-xs text-gray-600">{o.buyer.firstName} {o.buyer.lastName}</td>
                              <td className="px-4 py-2.5">
                                <span className={`text-xs font-medium ${ORDER_STATUS_STYLE[o.status] ?? "text-gray-500"}`}>
                                  {o.status.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-900 font-medium text-right">${o.totalAmount.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-xs text-gray-400 text-right">{formatDate(o.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Financials / Revenue Tab ─── */}
              {tab === "financials" && (
                <div className="space-y-6">
                  {/* Revenue stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <StatBox label="Total Revenue" value={`$${(analytics?.totalRevenue ?? 0).toFixed(2)}`} />
                    <StatBox label="Total Profit" value={`$${(analytics?.totalProfit ?? 0).toFixed(2)}`} />
                    <StatBox label="Withdrawn" value={`$${(data.withdrawalStats.approved).toFixed(2)}`} />
                    <StatBox label="Pending Payout" value={`$${(data.withdrawalStats.pending).toFixed(2)}`} />
                  </div>

                  {/* Adjust revenue */}
                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Adjust Revenue</p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Amount ($)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleAdjust("add")}
                          disabled={adjusting || !adjustAmount}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {adjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          Add Revenue
                        </button>
                        <button
                          onClick={() => handleAdjust("subtract")}
                          disabled={adjusting || !adjustAmount}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {adjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
                          Reduce Revenue
                        </button>
                      </div>

                      {adjustMsg && (
                        <p className={`text-xs mt-1 ${adjustMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                          {adjustMsg.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Withdrawals Tab ─── */}
              {tab === "withdrawals" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-4 gap-3">
                    <StatBox label="Total Requests" value={data.withdrawalStats.total} />
                    <StatBox label="Approved" value={`$${data.withdrawalStats.approved.toFixed(2)}`} />
                    <StatBox label="Pending" value={`$${data.withdrawalStats.pending.toFixed(2)}`} />
                    <StatBox label="Rejected" value={data.withdrawalStats.rejected} />
                  </div>

                  {(store?.withdrawals?.length ?? 0) > 0 ? (
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Amount</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Method</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Requested</th>
                            <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase">Reviewed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {store!.withdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5 text-xs font-medium text-gray-900">${w.amount.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-xs text-gray-600">{w.method === "BANK_TRANSFER" ? "Bank" : "Bitcoin"}</td>
                              <td className="px-4 py-2.5">
                                <span className={`text-xs font-medium ${
                                  w.status === "APPROVED" ? "text-green-600" : w.status === "PENDING" ? "text-amber-600" : "text-red-500"
                                }`}>
                                  {w.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-400">{formatDate(w.requestedAt)}</td>
                              <td className="px-4 py-2.5 text-xs text-gray-400">{w.reviewedAt ? formatDate(w.reviewedAt) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Wallet className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No withdrawal requests</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Documents Tab ─── */}
              {tab === "documents" && store && (
                <div className="space-y-5">
                  <DocumentCard url={store.idDocumentUrl} label="Government-Issued ID" />
                  <DocumentCard url={store.taxDocumentUrl} label="Tax / VAT Certificate" />
                </div>
              )}
              {tab === "documents" && !store && (
                <div className="text-center py-16 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No documents available</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — approve/reject for pending sellers */}
        {showActions && data && !loading && data.status === "PENDING_APPROVAL" && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
            <p className="text-xs text-gray-400">Review documents before approving</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onReject?.(data.id); onClose(); }}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => { onApprove?.(data.id); onClose(); }}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Approve Seller
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Document Card ── */

function DocumentCard({ url, label }: { url: string | null | undefined; label: string }) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <AlertTriangle className="w-5 h-5 text-gray-300" />
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {isPdf ? (
        <div className="p-8 flex flex-col items-center gap-2">
          <FileText className="w-10 h-10 text-gray-300" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-700 underline">
            View PDF
          </a>
        </div>
      ) : (
        <div className="p-2 bg-white">
          <Image src={url} alt={label} width={600} height={400} className="w-full h-auto max-h-[350px] object-contain rounded" />
        </div>
      )}
    </div>
  );
}
