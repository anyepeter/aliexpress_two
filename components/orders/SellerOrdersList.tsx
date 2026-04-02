"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  User,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MessageAdminButton from "@/components/messages/MessageAdminButton";
import PayWithLoanModal from "@/components/seller/loans/PayWithLoanModal";
import { formatCurrency } from "@/lib/utils/format";
import type { LoanRequest } from "@/lib/types/loans";

type OrderStatus = "PENDING" | "CONTACTED_ADMIN" | "SHIPPING" | "COMPLETED" | "REJECTED";

interface OrderItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  basePrice: number;
  discountPct: number;
  quantity: number;
  total: number;
}

interface SerializedOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  totalAmount: number;
  baseCost: number;
  profit: number;
  sellerRevenue: number;
  createdAt: string;
  contactedAt: string | null;
  shippingAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  adminNote: string | null;
  items: OrderItem[];
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    label: string;
    street: string;
    city: string;
    state: string | null;
    country: string;
  };
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  CONTACTED_ADMIN: { label: "Contacted Support", color: "text-blue-700", bg: "bg-blue-50", icon: PhoneCall },
  SHIPPING: { label: "Shipping", color: "text-indigo-700", bg: "bg-indigo-50", icon: Truck },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
};

export default function SellerOrdersList({ orders: initialOrders }: { orders: SerializedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [contactingId, setContactingId] = useState<string | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanRequest | null>(null);
  const [payModal, setPayModal] = useState<{ orderId: string; orderNumber: string; baseCost: number } | null>(null);

  // Fetch active loan
  useEffect(() => {
    fetch("/api/seller/loans")
      .then((r) => r.ok ? r.json() : [])
      .then((loans: LoanRequest[]) => {
        const active = loans.find((l) => l.status === "APPROVED");
        setActiveLoan(active ?? null);
      })
      .catch(() => { });
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const pendingBaseCost = orders
    .filter((o) => o.status === "PENDING" || o.status === "CONTACTED_ADMIN")
    .reduce((sum, o) => sum + o.baseCost, 0);

  const approvedRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.sellerRevenue, 0);

  const approvedProfit = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.profit, 0);

  const handleContactAdmin = async (orderId: string) => {
    setContactingId(orderId);
    try {
      const res = await fetch("/api/orders/seller", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "CONTACTED_ADMIN" as OrderStatus, contactedAt: new Date().toISOString() }
              : o
          )
        );
      }
    } catch {
      // silent
    } finally {
      setContactingId(null);
    }
  };

  const handlePayWithLoan = async () => {
    if (!payModal || !activeLoan) return;
    const res = await fetch(`/api/seller/loans/${activeLoan.id}/pay-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: payModal.orderId }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payModal.orderId
            ? { ...o, status: "CONTACTED_ADMIN" as OrderStatus, contactedAt: new Date().toISOString() }
            : o
        )
      );
      setActiveLoan((prev) =>
        prev ? { ...prev, balanceRemaining: data.newBalance, totalRepaid: prev.totalRepaid + payModal.baseCost } : null
      );
    }
    setPayModal(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage incoming orders from buyers
        </p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Orders</span>
            <div className="p-2 rounded-lg bg-blue-50">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending to Pay</span>
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">${pendingBaseCost.toFixed(2)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Amount to pay</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revenue</span>
            <div className="p-2 rounded-lg bg-green-50">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">${approvedRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">From completed orders</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Profit</span>
            <div className="p-2 rounded-lg bg-emerald-50">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${approvedProfit.toFixed(2)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Your margin earnings</p>
        </Card>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "PENDING", "CONTACTED_ADMIN", "SHIPPING", "COMPLETED", "REJECTED"] as const).map((s) => {
          const isActive = filter === s;
          const count = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
          const label = s === "all" ? "All" : STATUS_CONFIG[s].label;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${isActive
                ? "bg-[#E53935] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-1">No orders found</h3>
          <p className="text-sm text-gray-400">
            {filter === "all" ? "No orders have been placed yet." : `No ${STATUS_CONFIG[filter as OrderStatus].label.toLowerCase()} orders.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            const config = STATUS_CONFIG[order.status];
            const StatusIcon = config.icon;

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.buyer.firstName} {order.buyer.lastName} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1A1A1A]">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Items
                      </p>
                      <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3">
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[11px] text-gray-400">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </p>
                                {item.discountPct > 0 && (
                                  <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                    -{item.discountPct.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-300">
                                Base: ${item.basePrice.toFixed(2)}/unit
                              </p>
                            </div>
                            <span className="text-xs font-bold text-gray-700">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buyer + Delivery + Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                          <User className="w-3.5 h-3.5" /> Buyer
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {order.buyer.firstName} {order.buyer.lastName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{order.buyer.email}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Delivery
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.address.city}
                          {order.address.state ? `, ${order.address.state}` : ""}, {order.address.country}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Payment
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin"}
                        </p>
                      </div>
                    </div>

                    {/* Pricing breakdown */}
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Pricing Breakdown
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Buyer paid (selling price)</span>
                          <span className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Cost to pay (base price)</span>
                          <span className="font-bold text-red-600">-${order.baseCost.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-1.5 flex justify-between text-xs">
                          <span className="text-gray-700 font-semibold">Your profit (margin)</span>
                          <span className="font-bold text-emerald-600">${order.profit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin note */}
                    {order.adminNote && (
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 mb-1">Support Note</p>
                        <p className="text-xs text-gray-600">{order.adminNote}</p>
                      </div>
                    )}

                    {/* Shipping status */}
                    {order.status === "SHIPPING" && (
                      <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-3 text-center space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <Truck className="w-5 h-5 text-indigo-600" />
                          <p className="text-sm font-bold text-indigo-700">Order is being shipped</p>
                        </div>
                        {order.shippingAt && (
                          <p className="text-xs text-indigo-500">
                            Shipped on {new Date(order.shippingAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Completed revenue */}
                    {order.status === "COMPLETED" && order.sellerRevenue > 0 && (
                      <div className="bg-green-50 rounded-lg border border-green-100 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <p className="text-sm font-bold text-green-700">
                            Order completed — Payment verified
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <p className="text-[11px] text-green-600">Revenue</p>
                            <p className="text-lg font-bold text-green-700">${order.sellerRevenue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-green-600">Your Profit</p>
                            <p className="text-lg font-bold text-emerald-600">${order.profit.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-green-600">
                          Completed on {new Date(order.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Payment options — only for PENDING orders */}
                    {order.status === "PENDING" && (
                      <div className="space-y-3">
                        <div className="bg-amber-50 rounded-lg border border-amber-100 p-3 text-center">
                          <p className="text-xs text-amber-700">
                            You need to pay <span className="font-bold">${order.baseCost.toFixed(2)}</span> to fund this order.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Pay with Loan */}
                          {activeLoan && activeLoan.balanceRemaining >= order.baseCost ? (
                            <div className="border border-green-200 rounded-xl p-4 bg-green-50/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-800">Pay with Loan</span>
                              </div>
                              <p className="text-xs text-green-700 mb-1">Balance: {formatCurrency(activeLoan.balanceRemaining)}</p>
                              <p className="text-xs text-green-700 mb-1">Cost: {formatCurrency(order.baseCost)}</p>
                              <p className="text-xs text-green-700 font-medium mb-3">After: {formatCurrency(activeLoan.balanceRemaining - order.baseCost)}</p>
                              <button
                                onClick={() => setPayModal({ orderId: order.id, orderNumber: order.orderNumber, baseCost: order.baseCost })}
                                className="w-full py-2 bg-[#16A34A] text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Pay with Loan →
                              </button>
                            </div>
                          ) : activeLoan ? (
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 opacity-60">
                              <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-600">Pay with Loan</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Insufficient balance ({formatCurrency(activeLoan.balanceRemaining)})
                              </p>
                            </div>
                          ) : null}

                          {/* Contact Admin */}
                          <div className="border border-[#E5E7EB] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <PhoneCall className="w-4 h-4 text-[#E53935]" />
                              <span className="text-sm font-semibold text-[#E53935]">Pay Normally</span>
                            </div>
                            <p className="text-xs text-[#6B7280] mb-3">Contact customer support to arrange bank transfer or Bitcoin</p>
                            <button
                              onClick={() => handleContactAdmin(order.id)}
                              disabled={contactingId === order.id}
                              className="w-full py-2 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {contactingId === order.id ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Contacting...</>
                              ) : (
                                <>Contact Support →</>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Profit display */}
                        <div className="flex items-center justify-center gap-2 text-xs bg-gray-50 rounded-lg p-2">
                          <TrendingUp className="w-3.5 h-3.5 text-[#E53935]" />
                          <span className="text-[#6B7280]">Your profit on this order:</span>
                          <span className="font-bold text-[#1A1A1A]">+{formatCurrency(order.profit)}</span>
                          <span className="text-[#6B7280]">({order.totalAmount > 0 ? ((order.profit / order.totalAmount) * 100).toFixed(0) : 0}% margin)</span>
                        </div>
                      </div>
                    )}

                    {/* Already contacted */}
                    {order.status === "CONTACTED_ADMIN" && (
                      <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 text-center space-y-1">
                        <p className="text-sm font-medium text-blue-700">
                          Customer support has been notified. Awaiting verification of your ${order.baseCost.toFixed(2)} payment.
                        </p>
                        {order.contactedAt && (
                          <p className="text-xs text-blue-500">
                            Contacted on {new Date(order.contactedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Message Admin button */}
                    <div className="flex justify-end">
                      <MessageAdminButton
                        subject={`Payment for Order #${order.orderNumber}`}
                        orderId={order.id}
                        label="Message Support"
                        variant="secondary"
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pay with Loan Modal */}
      <PayWithLoanModal
        isOpen={!!payModal}
        onClose={() => setPayModal(null)}
        onConfirm={handlePayWithLoan}
        orderNumber={payModal?.orderNumber ?? ""}
        baseCost={payModal?.baseCost ?? 0}
        currentBalance={activeLoan?.balanceRemaining ?? 0}
      />
    </div>
  );
}
