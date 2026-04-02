"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Clock,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Wallet,
  ArrowUpRight,
  Bitcoin,
  Building2,
} from "lucide-react";

interface BalanceInfo {
  totalEarnings: number;
  withdrawn: number;
  pendingAmount: number;
  availableBalance: number;
}

interface WithdrawalRecord {
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
  createdAt: string;
  updatedAt: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  profit: number;
  sellerRevenue: number;
  totalAmount: number;
  completedAt: string | null;
}

interface Props {
  balance: BalanceInfo;
  withdrawals: WithdrawalRecord[];
  recentOrders: OrderRecord[];
  isActive: boolean;
}

export default function SellerPaymentsClient({
  balance: initialBalance,
  withdrawals: initialWithdrawals,
  recentOrders,
  isActive,
}: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<"withdrawals" | "earnings">("withdrawals");

  // Form fields
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"BANK_TRANSFER" | "BITCOIN">("BANK_TRANSFER");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [sellerNote, setSellerNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method,
          ...(method === "BANK_TRANSFER"
            ? { bankName, accountNumber, accountHolderName }
            : { walletAddress }),
          sellerNote: sellerNote || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit withdrawal");
        return;
      }

      setSuccess("Withdrawal request submitted! Waiting for approval.");
      setShowForm(false);
      setAmount("");
      setMethod("BANK_TRANSFER");
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");
      setWalletAddress("");
      setSellerNote("");

      // Update local state
      const newWithdrawal: WithdrawalRecord = {
        ...data.withdrawal,
        requestedAt: data.withdrawal.requestedAt ?? new Date().toISOString(),
        reviewedAt: null,
        createdAt: data.withdrawal.createdAt ?? new Date().toISOString(),
        updatedAt: data.withdrawal.updatedAt ?? new Date().toISOString(),
      };
      setWithdrawals((prev) => [newWithdrawal, ...prev]);
      setBalance((prev) => ({
        ...prev,
        pendingAmount: prev.pendingAmount + parseFloat(amount),
        availableBalance: prev.availableBalance - parseFloat(amount),
      }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Manage your earnings and withdrawals</p>
        </div>
        {isActive && balance.availableBalance > 0 && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
          >
            <ArrowDownCircle className="w-4 h-4" />
            Request Withdrawal
          </button>
        )}
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Earnings</span>
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${balance.totalEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">From approved orders</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Available Balance</span>
            <div className="p-2 rounded-lg bg-blue-50">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${balance.availableBalance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ready to withdraw</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending</span>
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${balance.pendingAmount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Withdrawn</span>
            <div className="p-2 rounded-lg bg-purple-50">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${balance.withdrawn.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Successfully withdrawn</p>
        </Card>
      </div>

      {/* Withdrawal Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Request Withdrawal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Method
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("BANK_TRANSFER")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    method === "BANK_TRANSFER"
                      ? "bg-[#E53935] text-white border-[#E53935]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("BITCOIN")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    method === "BITCOIN"
                      ? "bg-[#F7931A] text-white border-[#F7931A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Bitcoin className="w-4 h-4" />
                  Bitcoin (BTC)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance.availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Max: ${balance.availableBalance.toFixed(2)}
                </p>
              </div>

              {method === "BANK_TRANSFER" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                      placeholder="e.g. First National Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                      placeholder="Account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                      placeholder="Full name on account"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BTC Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F7931A]/20 focus:border-[#F7931A]"
                    placeholder="e.g. bc1qxy2kgdygjrsqtzq2n0yrf..."
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optional)
              </label>
              <textarea
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                placeholder="Any additional notes for customer support..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("withdrawals")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "withdrawals"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Withdrawal History
        </button>
        <button
          onClick={() => setTab("earnings")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "earnings"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Earnings History
        </button>
      </div>

      {/* Withdrawal History */}
      {tab === "withdrawals" && (
        <Card className="overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No withdrawals yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your withdrawal history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {withdrawals.map((w) => {
                const config =
                  statusConfig[w.status as keyof typeof statusConfig] ??
                  statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <div key={w.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${config.bg} shrink-0 mt-0.5`}
                        >
                          <StatusIcon className={`w-4 h-4 ${config.text}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${w.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {w.method === "BITCOIN" ? (
                              <>
                                <Bitcoin className="w-3 h-3 inline mr-1 text-[#F7931A]" />
                                BTC &bull; {w.walletAddress?.slice(0, 6)}...{w.walletAddress?.slice(-4)}
                              </>
                            ) : (
                              <>
                                {w.bankName} &bull; ****
                                {w.accountNumber?.slice(-4)}
                              </>
                            )}
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
                          {w.sellerNote && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              &quot;{w.sellerNote}&quot;
                            </p>
                          )}
                          {w.adminNote && (
                            <p className="text-xs text-blue-600 mt-1">
                              Support: {w.adminNote}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Earnings History */}
      {tab === "earnings" && (
        <Card className="overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No earnings yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Earnings from approved orders will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Order</span>
                <span className="text-right">Sale Amount</span>
                <span className="text-right">Your Profit</span>
                <span className="text-right">Date</span>
              </div>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="grid grid-cols-4 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{o.orderNumber}</span>
                  <span className="text-right text-gray-600">
                    ${o.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-right font-semibold text-green-600">
                    +${o.profit.toFixed(2)}
                  </span>
                  <span className="text-right text-gray-400 text-xs">
                    {o.completedAt
                      ? new Date(o.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
