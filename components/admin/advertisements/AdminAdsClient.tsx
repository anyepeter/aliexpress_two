"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  Star,
  Zap,
  Crown,
} from "lucide-react";

interface AdPlan {
  id: string;
  tier: string;
  name: string;
  price: number;
  durationDays: number;
  minVisitorsDay: number;
  maxVisitorsDay: number;
  description: string | null;
  features: string[];
  isActive: boolean;
}

interface SubStore {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  isVerified: boolean;
  user: { firstName: string; lastName: string; email: string };
}

interface AdSubscription {
  id: string;
  storeId: string;
  planId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  adminNote: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  plan: AdPlan;
  store: SubStore;
}

type Tab = "PENDING" | "ACTIVE" | "EXPIRED" | "all";

const TIER_ICONS: Record<string, typeof Star> = { BASIC: Star, STANDARD: Zap, PREMIUM: Crown };

export default function AdminAdsClient() {
  const [plans, setPlans] = useState<AdPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        fetch("/api/admin/ad-plans").then((r) => r.json()),
        fetch(`/api/admin/ad-subscriptions?status=${activeTab}`).then((r) => r.json()),
      ]);
      setPlans(p);
      setSubscriptions(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const [cancelConfirm, setCancelConfirm] = useState<{ id: string; storeName: string; planName: string } | null>(null);

  const handleAction = async (subId: string, action: "approve" | "reject" | "cancel") => {
    setProcessingId(subId);
    try {
      const res = await fetch("/api/admin/ad-subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId, action }),
      });
      if (res.ok) fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdatePlan = async (planId: string, data: Partial<AdPlan>) => {
    setSavingPlan(planId);
    try {
      await fetch("/api/admin/ad-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, ...data }),
      });
      const res = await fetch("/api/admin/ad-plans");
      if (res.ok) setPlans(await res.json());
    } finally {
      setSavingPlan(null);
    }
  };

  const tabs: { label: string; value: Tab }[] = [
    { label: "Pending", value: "PENDING" },
    { label: "Active", value: "ACTIVE" },
    { label: "Expired", value: "EXPIRED" },
    { label: "All", value: "all" },
  ];

  const pendingCount = subscriptions.filter((s) => s.status === "PENDING").length;
  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-500 mt-1">
            {activeCount} active · {pendingCount} pending
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Plan Settings
          {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Plan Settings */}
      {showSettings && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Edit Plans</h2>
          <div className="space-y-4">
            {plans.map((plan) => {
              const Icon = TIER_ICONS[plan.tier] ?? Star;
              return (
                <PlanEditor
                  key={plan.id}
                  plan={plan}
                  icon={Icon}
                  saving={savingPlan === plan.id}
                  onSave={(data) => handleUpdatePlan(plan.id, data)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Store className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No {activeTab === "all" ? "" : activeTab.toLowerCase()} subscriptions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const isProcessing = processingId === sub.id;
            const daysLeft = sub.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
            const statusColors: Record<string, string> = {
              ACTIVE: "bg-green-50 text-green-700",
              PENDING: "bg-amber-50 text-amber-700",
              EXPIRED: "bg-gray-100 text-gray-500",
              REJECTED: "bg-red-50 text-red-700",
            };

            return (
              <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {sub.store.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sub.store.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold">
                        {sub.store.storeName[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{sub.store.storeName}</p>
                      <p className="text-xs text-gray-400">
                        {sub.store.user.firstName} {sub.store.user.lastName} · {sub.store.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[sub.status] ?? "bg-gray-100"}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="font-medium text-gray-900">{sub.plan.name} Plan</span>
                  <span>${sub.plan.price.toLocaleString()}</span>
                  <span><Eye className="w-3 h-3 inline mr-0.5" />{sub.plan.minVisitorsDay.toLocaleString()}–{sub.plan.maxVisitorsDay.toLocaleString()}/day</span>
                  {daysLeft !== null && <span>{daysLeft} days left</span>}
                  <span>Requested: {new Date(sub.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions for PENDING */}
                {sub.status === "PENDING" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAction(sub.id, "approve")}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(sub.id, "reject")}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Cancel for ACTIVE */}
                {sub.status === "ACTIVE" && (
                  <div className="mt-3">
                    <button
                      onClick={() => setCancelConfirm({ id: sub.id, storeName: sub.store.storeName, planName: sub.plan.name })}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Cancel Plan
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCancelConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Cancel Ad Plan?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cancel <strong>{cancelConfirm.storeName}</strong>&apos;s {cancelConfirm.planName} plan? Their products will be removed from the sponsored section immediately.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={() => {
                  handleAction(cancelConfirm.id, "cancel");
                  setCancelConfirm(null);
                }}
                disabled={processingId === cancelConfirm.id}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId === cancelConfirm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Yes, Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Plan Editor Component ──

function PlanEditor({
  plan,
  icon: Icon,
  saving,
  onSave,
}: {
  plan: AdPlan;
  icon: typeof Star;
  saving: boolean;
  onSave: (data: Partial<AdPlan>) => void;
}) {
  const [price, setPrice] = useState(plan.price);
  const [minV, setMinV] = useState(plan.minVisitorsDay);
  const [maxV, setMaxV] = useState(plan.maxVisitorsDay);
  const [duration, setDuration] = useState(plan.durationDays);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-bold text-gray-900">{plan.name}</span>
        <span className="text-[10px] text-gray-400">{plan.tier}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase block mb-1">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase block mb-1">Min Visitors/Day</label>
          <input type="number" value={minV} onChange={(e) => setMinV(parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase block mb-1">Max Visitors/Day</label>
          <input type="number" value={maxV} onChange={(e) => setMaxV(parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 uppercase block mb-1">Duration (days)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <button
        onClick={() => onSave({ price, minVisitorsDay: minV, maxVisitorsDay: maxV, durationDays: duration })}
        disabled={saving}
        className="mt-3 px-4 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
