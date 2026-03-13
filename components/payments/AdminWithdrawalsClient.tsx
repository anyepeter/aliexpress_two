"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Bitcoin,
  Building2,
} from "lucide-react";

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  method: "BANK_TRANSFER" | "BITCOIN";
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  walletAddress: string | null;
  sellerNote: string | null;
  adminNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  store: {
    id: string;
    storeName: string;
    seller: {
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    };
  };
}

interface Stats {
  pendingCount: number;
  totalApproved: number;
  rejectedCount: number;
  totalCount: number;
}

interface Props {
  withdrawals: WithdrawalItem[];
  stats: Stats;
}

export default function AdminWithdrawalsClient({
  withdrawals: initialWithdrawals,
  stats,
}: Props) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    setActionError(null);

    try {
      const res = await fetch(`/api/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: adminNotes[id] || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Action failed");
        return;
      }

      // Update local state
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status: action === "approve" ? "APPROVED" : "REJECTED",
                adminNote: adminNotes[id] || null,
                reviewedAt: new Date().toISOString(),
              }
            : w
        )
      );
      setExpandedId(null);
      setAdminNotes((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch {
      setActionError("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = withdrawals.filter((w) => {
    if (filter !== "ALL" && w.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        w.store.storeName.toLowerCase().includes(q) ||
        w.store.seller.firstName.toLowerCase().includes(q) ||
        w.store.seller.lastName.toLowerCase().includes(q) ||
        w.store.seller.email.toLowerCase().includes(q) ||
        (w.accountHolderName?.toLowerCase().includes(q) ?? false) ||
        (w.walletAddress?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: "Pending",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    APPROVED: {
      icon: CheckCircle2,
      label: "Approved",
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    REJECTED: {
      icon: XCircle,
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-500 mt-1">
          Review and manage seller withdrawal requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Requests</span>
            <div className="p-2 rounded-lg bg-blue-50">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending</span>
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Paid Out</span>
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${stats.totalApproved.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Rejected</span>
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
        </Card>
      </div>

      {/* Error */}
      {actionError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store, seller, or account..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No withdrawal requests</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter !== "ALL"
                ? `No ${filter.toLowerCase()} requests found`
                : "Withdrawal requests from sellers will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((w) => {
              const config =
                statusConfig[w.status as keyof typeof statusConfig] ??
                statusConfig.PENDING;
              const StatusIcon = config.icon;
              const isExpanded = expandedId === w.id;
              const isLoading = actionLoading === w.id;

              return (
                <div key={w.id}>
                  <div
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : w.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {w.store.seller.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={w.store.seller.avatarUrl}
                            alt={`${w.store.seller.firstName} ${w.store.seller.lastName}`}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">
                              {w.store.seller.firstName[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${w.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {w.store.seller.firstName} {w.store.seller.lastName}
                            <span className="text-gray-400"> &bull; </span>
                            {w.store.storeName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(w.requestedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                        >
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {config.label}
                        </span>
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
                          {w.method === "BITCOIN" ? (
                            <>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <Bitcoin className="w-3 h-3 text-[#F7931A]" />
                                Bitcoin Payment
                              </p>
                              <p className="text-sm text-gray-900 font-mono break-all">
                                {w.walletAddress}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                Bank Details
                              </p>
                              <p className="text-sm text-gray-900">
                                {w.bankName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Account: {w.accountNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Holder: {w.accountHolderName}
                              </p>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Seller Info
                          </p>
                          <p className="text-sm text-gray-900">
                            {w.store.seller.firstName} {w.store.seller.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {w.store.seller.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            Store: {w.store.storeName}
                          </p>
                        </div>
                      </div>

                      {w.sellerNote && (
                        <div className="py-2">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Seller Note
                          </p>
                          <p className="text-sm text-gray-700 italic">
                            &quot;{w.sellerNote}&quot;
                          </p>
                        </div>
                      )}

                      {w.adminNote && w.status !== "PENDING" && (
                        <div className="py-2">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Admin Note
                          </p>
                          <p className="text-sm text-blue-700">
                            {w.adminNote}
                          </p>
                        </div>
                      )}

                      {w.reviewedAt && (
                        <p className="text-xs text-gray-400 py-1">
                          Reviewed on{" "}
                          {new Date(w.reviewedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}

                      {/* Actions for PENDING withdrawals */}
                      {w.status === "PENDING" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Admin Note (optional)
                            </label>
                            <input
                              type="text"
                              value={adminNotes[w.id] ?? ""}
                              onChange={(e) =>
                                setAdminNotes((prev) => ({
                                  ...prev,
                                  [w.id]: e.target.value,
                                }))
                              }
                              placeholder="Add a note about this decision..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(w.id, "approve");
                              }}
                              disabled={isLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(w.id, "reject");
                              }}
                              disabled={isLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
