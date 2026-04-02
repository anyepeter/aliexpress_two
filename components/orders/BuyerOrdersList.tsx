"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Truck,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MessageAdminButton from "@/components/messages/MessageAdminButton";
import ReviewOrderModal from "./ReviewOrderModal";

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
  createdAt: string;
  shippingAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  adminNote: string | null;
  items: OrderItem[];
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
  CONTACTED_ADMIN: { label: "Processing", color: "text-blue-700", bg: "bg-blue-50", icon: PhoneCall },
  SHIPPING: { label: "Shipping", color: "text-indigo-700", bg: "bg-indigo-50", icon: Truck },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
};

export default function BuyerOrdersList({ orders }: { orders: SerializedOrder[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [reviewModal, setReviewModal] = useState<{ orderId: string; orderNumber: string; storeName: string } | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  // Check which completed orders have already been reviewed
  useEffect(() => {
    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    if (completedOrders.length === 0) return;

    Promise.all(
      completedOrders.map((o) =>
        fetch(`/api/store-reviews?orderId=${o.id}`)
          .then((r) => r.json())
          .then((data) => (data.reviewed ? o.id : null))
          .catch(() => null)
      )
    ).then((results) => {
      setReviewedOrders(new Set(results.filter(Boolean) as string[]));
    });
  }, [orders]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
        >
          Continue Shopping
        </Link>
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
          <p className="text-sm text-gray-400">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${STATUS_CONFIG[filter as OrderStatus].label.toLowerCase()} orders.`}
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.store?.storeName ?? "AliExpress"}
                      {order.store?.isVerified && " ✓"} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1A1A1A]">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </div>

                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
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
                              <p className="text-[11px] text-gray-400">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-gray-700">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address + payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Delivery
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.address.label} — {order.address.street}, {order.address.city}
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

                    {/* Admin note */}
                    {order.adminNote && (
                      <div className="bg-white rounded-lg border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-500 mb-1">Support Note</p>
                        <p className="text-xs text-gray-600">{order.adminNote}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {/* Rate button for completed orders */}
                      {order.status === "COMPLETED" && order.store && !reviewedOrders.has(order.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewModal({
                              orderId: order.id,
                              orderNumber: order.orderNumber,
                              storeName: order.store!.storeName,
                            });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Rate this Order
                        </button>
                      ) : order.status === "COMPLETED" && reviewedOrders.has(order.id) ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      ) : (
                        <div />
                      )}
                      <MessageAdminButton
                        subject={`Support for Order #${order.orderNumber}`}
                        orderId={order.id}
                        label="Contact Support"
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
      {reviewModal && (
        <ReviewOrderModal
          isOpen={!!reviewModal}
          onClose={() => setReviewModal(null)}
          orderId={reviewModal.orderId}
          orderNumber={reviewModal.orderNumber}
          storeName={reviewModal.storeName}
          onReviewSubmitted={() => {
            setReviewedOrders((prev) => new Set([...prev, reviewModal.orderId]));
          }}
        />
      )}
    </div>
  );
}
