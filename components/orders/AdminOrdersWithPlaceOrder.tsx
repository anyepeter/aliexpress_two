"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, PlusCircle } from "lucide-react";
import AdminOrdersList from "./AdminOrdersList";
import AdminPlaceOrder from "./AdminPlaceOrder";

interface Props {
  orders: Parameters<typeof AdminOrdersList>[0]["orders"];
}

export default function AdminOrdersWithPlaceOrder({ orders }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "place">("orders");

  const handleOrderPlaced = () => {
    // Refresh server data so the new order appears in "All Orders"
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "orders"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          All Orders
        </button>
        <button
          onClick={() => setActiveTab("place")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "place"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Place Order
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "orders" ? (
        <AdminOrdersList orders={orders} />
      ) : (
        <AdminPlaceOrder onOrderPlaced={handleOrderPlaced} />
      )}
    </div>
  );
}
