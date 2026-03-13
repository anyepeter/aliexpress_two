"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import SellerDetailModal from "./SellerDetailModal";

interface PendingSeller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  store: { storeName: string; createdAt: Date } | null;
}

export default function AdminPendingSellers({
  sellers,
}: {
  sellers: PendingSeller[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewSellerId, setViewSellerId] = useState<string | null>(null);

  const handleAction = async (sellerId: string, action: "approve" | "reject") => {
    setLoadingId(sellerId);
    try {
      await fetch("/api/admin/approve-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, action }),
      });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (sellers.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-400">
        <CheckCircle className="w-10 h-10 mb-3 text-gray-200" />
        <p className="text-sm font-medium">No pending seller applications</p>
        <p className="text-xs mt-1">All caught up!</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Seller</th>
              <th className="text-left px-5 py-3 font-semibold">Store</th>
              <th className="text-left px-5 py-3 font-semibold">Registered</th>
              <th className="text-right px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">
                    {seller.firstName} {seller.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{seller.email}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-700">
                  {seller.store?.storeName ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {new Date(seller.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewSellerId(seller.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => handleAction(seller.id, "approve")}
                      disabled={loadingId === seller.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loadingId === seller.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(seller.id, "reject")}
                      disabled={loadingId === seller.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SellerDetailModal
        sellerId={viewSellerId ?? ""}
        open={!!viewSellerId}
        onClose={() => setViewSellerId(null)}
        onApprove={(id) => handleAction(id, "approve")}
        onReject={(id) => handleAction(id, "reject")}
        showActions
      />
    </>
  );
}
