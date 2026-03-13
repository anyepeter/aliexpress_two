"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  ShoppingBag,
  Zap,
  GripVertical,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DealItem {
  id?: string;
  dummyProductId: number;
  productId?: string;
  customTitle?: string;
  customPrice?: number;
  customOldPrice?: number;
  customBadge?: string;
  sortOrder: number;
}

interface Section {
  id?: string;
  type: "DOLLAR_EXPRESS" | "SUPER_DEALS";
  title: string;
  subtitle: string;
  isActive: boolean;
  items: DealItem[];
}

const defaultSections: Section[] = [
  {
    type: "DOLLAR_EXPRESS",
    title: "Dollar Express",
    subtitle: "3 from $0.99",
    isActive: true,
    items: [],
  },
  {
    type: "SUPER_DEALS",
    title: "SuperDeals",
    subtitle: "",
    isActive: true,
    items: [],
  },
];

type Toast = { type: "success" | "error"; message: string } | null;

export default function AdminDealsClient() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/deals");
      if (!res.ok) return;
      const data = await res.json();
      if (data.sections?.length) {
        setSections((prev) =>
          prev.map((def) => {
            const found = data.sections.find(
              (s: { type: string }) => s.type === def.type
            );
            if (found) {
              return {
                ...def,
                id: found.id,
                title: found.title,
                subtitle: found.subtitle ?? "",
                isActive: found.isActive,
                items: found.items.map(
                  (item: {
                    id: string;
                    dummyProductId: number;
                    productId: string | null;
                    customTitle: string | null;
                    customPrice: number | null;
                    customOldPrice: number | null;
                    customBadge: string | null;
                    sortOrder: number;
                  }) => ({
                    id: item.id,
                    dummyProductId: item.dummyProductId,
                    productId: item.productId ?? undefined,
                    customTitle: item.customTitle ?? undefined,
                    customPrice: item.customPrice ?? undefined,
                    customOldPrice: item.customOldPrice ?? undefined,
                    customBadge: item.customBadge ?? undefined,
                    sortOrder: item.sortOrder,
                  })
                ),
              };
            }
            return def;
          })
        );
      }
    } catch {
      // defaults shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const saveSection = async (section: Section) => {
    setSaving(section.type);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: section.type,
          title: section.title,
          subtitle: section.subtitle || null,
          isActive: section.isActive,
          items: section.items,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("success", `${section.title} saved successfully`);
      fetchSections();
    } catch {
      showToast("error", `Failed to save ${section.title}`);
    } finally {
      setSaving(null);
    }
  };

  const updateSection = (
    type: string,
    field: keyof Section,
    value: string | boolean
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, [field]: value } : s))
    );
  };

  const addItem = (type: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.type === type
          ? {
              ...s,
              items: [
                ...s.items,
                {
                  dummyProductId: 1,
                  customBadge:
                    type === "DOLLAR_EXPRESS" ? "New shoppers only" : "-50%",
                  sortOrder: s.items.length,
                },
              ],
            }
          : s
      )
    );
  };

  const updateItem = (
    sectionType: string,
    idx: number,
    field: keyof DealItem,
    value: string | number
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.type === sectionType
          ? {
              ...s,
              items: s.items.map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
              ),
            }
          : s
      )
    );
  };

  const removeItem = (sectionType: string, idx: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.type === sectionType
          ? { ...s, items: s.items.filter((_, i) => i !== idx) }
          : s
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Today&apos;s Deals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure the Dollar Express and SuperDeals sections on the homepage.
            If no products are configured, demo data will be shown.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => {
          const isDollar = section.type === "DOLLAR_EXPRESS";
          const Icon = isDollar ? ShoppingBag : Zap;
          const isSaving = saving === section.type;

          return (
            <div
              key={section.type}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isDollar
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {section.type === "DOLLAR_EXPRESS"
                        ? "Dollar Express"
                        : "SuperDeals"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {section.items.length} product
                      {section.items.length !== 1 ? "s" : ""} configured
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">Active</span>
                    <input
                      type="checkbox"
                      checked={section.isActive}
                      onChange={(e) =>
                        updateSection(section.type, "isActive", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <button
                    onClick={() => saveSection(section)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[#E53935] text-white hover:bg-[#C62828] disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.type, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={section.subtitle}
                    onChange={(e) =>
                      updateSection(section.type, "subtitle", e.target.value)
                    }
                    placeholder={isDollar ? "3 from $0.99" : ""}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {section.items.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No products added yet. Demo data will be shown on the homepage.
                  </p>
                )}

                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                          DummyJSON ID
                        </label>
                        <input
                          type="number"
                          value={item.dummyProductId}
                          onChange={(e) =>
                            updateItem(
                              section.type,
                              idx,
                              "dummyProductId",
                              parseInt(e.target.value) || 1
                            )
                          }
                          min={1}
                          max={194}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                          Custom Title
                        </label>
                        <input
                          type="text"
                          value={item.customTitle ?? ""}
                          onChange={(e) =>
                            updateItem(
                              section.type,
                              idx,
                              "customTitle",
                              e.target.value
                            )
                          }
                          placeholder="Auto from API"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.customPrice ?? ""}
                          onChange={(e) =>
                            updateItem(
                              section.type,
                              idx,
                              "customPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Auto"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                          Old Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.customOldPrice ?? ""}
                          onChange={(e) =>
                            updateItem(
                              section.type,
                              idx,
                              "customOldPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Strikethrough"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                          Badge
                        </label>
                        <input
                          type="text"
                          value={item.customBadge ?? ""}
                          onChange={(e) =>
                            updateItem(
                              section.type,
                              idx,
                              "customBadge",
                              e.target.value
                            )
                          }
                          placeholder={isDollar ? "New shoppers only" : "-80%"}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(section.type, idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addItem(section.type)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
