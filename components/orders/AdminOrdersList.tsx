"use client";

import { useState } from "react";
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
  Store,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";

type OrderStatus = "PENDING" | "CONTACTED_ADMIN" | "SHIPPING" | "COMPLETED" | "REJECTED";

interface OrderItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
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
  store: {
    storeName: string;
    storeSlug: string;
    logoUrl: string | null;
    isVerified: boolean;
  } | null;
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
  CONTACTED_ADMIN: { label: "Awaiting Verification", color: "text-blue-700", bg: "bg-blue-50", icon: PhoneCall },
  SHIPPING: { label: "Shipping", color: "text-indigo-700", bg: "bg-indigo-50", icon: Truck },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
};

export default function AdminOrdersList({ orders: initialOrders }: { orders: SerializedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONTACTED_ADMIN"
  ).length;

  const handleAction = async (orderId: string, action: "ship" | "complete" | "reject") => {
    setProcessingId(orderId);
    try {
      const res = await fetch("/api/orders/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action,
          adminNote: noteInputs[orderId] || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: data.order.status,
                  shippingAt: data.order.shippingAt,
                  completedAt: data.order.completedAt,
                  rejectedAt: data.order.rejectedAt,
                  adminNote: data.order.adminNote,
                  sellerRevenue: data.order.sellerRevenue ?? o.sellerRevenue,
                }
              : o
          )
        );
        setNoteInputs((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }
    } catch {
      // silent
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Verify payments and manage all marketplace orders
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span className="text-sm text-gray-500">Needs Action</span>
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Completed</span>
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "COMPLETED").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
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
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                isActive
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
          <p className="text-sm text-gray-400">No orders match the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            const config = STATUS_CONFIG[order.status];
            const StatusIcon = config.icon;
            const isActionable = order.status === "PENDING" || order.status === "CONTACTED_ADMIN" || order.status === "SHIPPING";

            return (
              <Card
                key={order.id}
                className={`overflow-hidden ${
                  order.status === "CONTACTED_ADMIN" ? "ring-2 ring-blue-200" : ""
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Store logo */}
                  {order.store?.logoUrl ? (
                    <Image
                      src={order.store.logoUrl}
                      alt={order.store.storeName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {(order.store?.storeName ?? "M")[0].toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} flex items-center gap-1`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {order.status === "CONTACTED_ADMIN" && (
                        <span className="text-[10px] font-bold text-blue-600 animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium">{order.store?.storeName ?? "MarketHub"}</span>
                      {order.store?.isVerified && " ✓"} · {order.buyer.firstName} {order.buyer.lastName} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1A1A1A]">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400">
                      {order.paymentMethod === "BANK_TRANSFER" ? "Bank" : "BTC"}
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
                        <Package className="w-3.5 h-3.5" /> Order Items
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
                              <p className="text-[11px] text-gray-400">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-gray-700">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                          <Store className="w-3.5 h-3.5" /> Store
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {order.store?.storeName ?? "MarketHub (No Store)"}
                          {order.store?.isVerified && (
                            <span className="text-[#E53935] ml-1">✓</span>
                          )}
                        </p>
                      </div>
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
                    </div>

                    {/* Payment & pricing breakdown */}
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">
                            {order.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin"}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-2 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Buyer paid</span>
                          <span className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Seller owes admin (base cost)</span>
                          <span className="font-bold text-[#1A1A1A]">${order.baseCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Seller profit (margin)</span>
                          <span className="font-bold text-emerald-600">${order.profit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Existing admin note */}
                    {order.adminNote && (
                      <div className="bg-purple-50 rounded-lg border border-purple-100 p-3">
                        <p className="text-xs font-bold text-purple-700 mb-1">Admin Note</p>
                        <p className="text-xs text-purple-600">{order.adminNote}</p>
                      </div>
                    )}

                    {/* Action buttons for actionable orders */}
                    {isActionable && (
                      <div className="space-y-3 pt-2 border-t border-gray-200">
                        <textarea
                          placeholder="Admin note (optional)..."
                          value={noteInputs[order.id] || ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 resize-none h-16"
                        />
                        <div className="flex items-center gap-3">
                          {(order.status === "PENDING" || order.status === "CONTACTED_ADMIN") && (
                            <button
                              onClick={() => handleAction(order.id, "ship")}
                              disabled={processingId === order.id}
                              className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processingId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Truck className="w-4 h-4" />
                              )}
                              Mark as Shipping
                            </button>
                          )}
                          {order.status === "SHIPPING" && (
                            <button
                              onClick={() => handleAction(order.id, "complete")}
                              disabled={processingId === order.id}
                              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processingId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Mark as Completed
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(order.id, "reject")}
                            disabled={processingId === order.id}
                            className="flex-1 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shipping summary */}
                    {order.status === "SHIPPING" && (
                      <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-3 flex items-center gap-3">
                        <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-indigo-700">
                            Order is being shipped
                          </p>
                          {order.shippingAt && (
                            <p className="text-xs text-indigo-600">
                              Shipped on {new Date(order.shippingAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed summary */}
                    {order.status === "COMPLETED" && (
                      <div className="bg-green-50 rounded-lg border border-green-100 p-3 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-green-700">
                            Order completed — ${order.sellerRevenue.toFixed(2)} credited to seller
                          </p>
                          {order.completedAt && (
                            <p className="text-xs text-green-600">
                              Completed on {new Date(order.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rejected summary */}
                    {order.status === "REJECTED" && (
                      <div className="bg-red-50 rounded-lg border border-red-100 p-3 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-700">Order rejected</p>
                          {order.rejectedAt && (
                            <p className="text-xs text-red-600">
                              Rejected on {new Date(order.rejectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
