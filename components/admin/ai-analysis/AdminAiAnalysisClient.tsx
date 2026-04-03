"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  DollarSign,
} from "lucide-react";

interface SubStore {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  isVerified: boolean;
  user: { firstName: string; lastName: string; email: string };
}

interface AiSubscription {
  id: string;
  storeId: string;
  status: string;
  price: number;
  startDate: string | null;
  endDate: string | null;
  approvedAt: string | null;
  createdAt: string;
  store: SubStore;
}

type Tab = "PENDING" | "ACTIVE" | "EXPIRED" | "all";

export default function AdminAiAnalysisClient() {
  const [allSubscriptions, setAllSubscriptions] = useState<AiSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-analysis?status=all");
      if (res.ok) setAllSubscriptions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subscriptions = activeTab === "all"
    ? allSubscriptions
    : allSubscriptions.filter((s) => s.status === activeTab);

  const handleAction = async (subId: string, action: "approve" | "reject" | "revoke") => {
    setProcessingId(subId);
    try {
      const res = await fetch("/api/admin/ai-analysis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId, action }),
      });
      if (res.ok) fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = allSubscriptions.filter((s) => s.status === "PENDING").length;
  const activeCount = allSubscriptions.filter((s) => s.status === "ACTIVE").length;
  const expiredCount = allSubscriptions.filter((s) => s.status === "EXPIRED").length;
  const totalRevenue = allSubscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.price, 0);

  const tabs: { label: string; value: Tab; count: number }[] = [
    { label: "Pending", value: "PENDING", count: pendingCount },
    { label: "Active", value: "ACTIVE", count: activeCount },
    { label: "Expired", value: "EXPIRED", count: expiredCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#0F2540]" />
          <h1 className="text-2xl font-bold text-gray-900">AI Analysis Plans</h1>
        </div>
        <p className="text-gray-500 mt-1">
          Manage seller AI market analysis subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Revenue</span>
            <DollarSign className="w-4 h-4 text-[#0F2540]" />
          </div>
          <p className="text-xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

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
            {tab.label} <span className="text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Brain className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No {activeTab === "all" ? "" : activeTab.toLowerCase()} subscriptions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const isProcessing = processingId === sub.id;
            const statusColors: Record<string, string> = {
              ACTIVE: "bg-green-50 text-green-700",
              PENDING: "bg-amber-50 text-amber-700",
              EXPIRED: "bg-gray-100 text-gray-500",
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[sub.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {sub.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="font-medium text-gray-900">${sub.price}</span>
                  <span>Requested: {new Date(sub.createdAt).toLocaleDateString()}</span>
                  {sub.approvedAt && <span>Approved: {new Date(sub.approvedAt).toLocaleDateString()}</span>}
                  {sub.endDate && (
                    <span>
                      Expires: {new Date(sub.endDate).toLocaleDateString()}
                      {" "}({Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left)
                    </span>
                  )}
                </div>

                {/* Actions */}
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
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}

                {sub.status === "ACTIVE" && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleAction(sub.id, "revoke")}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Revoke Access
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
