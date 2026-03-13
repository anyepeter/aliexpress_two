"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Search,
  Loader2,
  CheckCircle2,
  Save,
} from "lucide-react";

interface StoreVisitor {
  sellerId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  storeId: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  totalViews: number;
}

interface Props {
  stores: StoreVisitor[];
}

export default function AdminVisitorsClient({ stores: initialStores }: Props) {
  const [stores, setStores] = useState(initialStores);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = stores.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.storeName.toLowerCase().includes(q) ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q)
    );
  });

  const handleSave = async (storeId: string) => {
    const value = editValues[storeId];
    if (value === undefined) return;

    const views = Math.max(0, Math.floor(Number(value)));
    if (!Number.isFinite(views)) return;

    setSavingId(storeId);
    setSavedId(null);
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, totalViews: views }),
      });
      if (res.ok) {
        setStores((prev) =>
          prev.map((s) =>
            s.storeId === storeId ? { ...s, totalViews: views } : s
          )
        );
        setEditValues((prev) => {
          const copy = { ...prev };
          delete copy[storeId];
          return copy;
        });
        setSavedId(storeId);
        setTimeout(() => setSavedId(null), 2000);
      }
    } finally {
      setSavingId(null);
    }
  };

  const totalVisitors = stores.reduce((sum, s) => sum + s.totalViews, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Visitors</h1>
        <p className="text-gray-500 mt-1">
          Set the visitor count displayed on each seller&apos;s dashboard and store
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Stores</span>
            <div className="p-2 rounded-lg bg-blue-50">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Visitors</span>
            <div className="p-2 rounded-lg bg-green-50">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalVisitors.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by store or seller..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
        />
      </div>

      {/* Stores List */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Eye className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No stores found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Store</span>
              <span className="w-36 text-center">Visitors</span>
              <span className="w-20 text-center">Action</span>
            </div>

            {filtered.map((store) => {
              const isEditing = editValues[store.storeId] !== undefined;
              const isSaving = savingId === store.storeId;
              const justSaved = savedId === store.storeId;
              const currentValue = editValues[store.storeId] ?? String(store.totalViews);

              return (
                <div
                  key={store.storeId}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Store info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {store.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.logoUrl}
                        alt={store.storeName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">
                          {store.storeName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {store.storeName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {store.firstName} {store.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Visitors input */}
                  <div className="w-36">
                    <input
                      type="number"
                      min="0"
                      value={currentValue}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [store.storeId]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>

                  {/* Save button */}
                  <div className="w-20 flex justify-center">
                    {justSaved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => handleSave(store.storeId)}
                        disabled={!isEditing || isSaving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-40"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        Save
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
