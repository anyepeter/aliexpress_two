"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Store,
  User,
  Package,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────

interface StoreOption {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  isVerified: boolean;
  _count: { sellerProducts: number };
  user: { firstName: string; lastName: string };
}

interface BuyerOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface ProductOption {
  id: string;
  dummyProductId: number;
  title: string;
  category: string;
  brand: string | null;
  basePrice: number;
  sellingPrice: number;
  discountPct: number;
  stock: number;
  thumbnail: string;
}

interface CartItem extends ProductOption {
  quantity: number;
}

type Step = "store" | "buyer" | "products" | "review";

// ── Component ──────────────────────────────────────────────

interface AdminPlaceOrderProps {
  onOrderPlaced?: () => void;
}

export default function AdminPlaceOrder({ onOrderPlaced }: AdminPlaceOrderProps = {}) {
  const [step, setStep] = useState<Step>("store");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Selections
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerOption | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "BITCOIN">("BITCOIN");

  // Data lists
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [buyers, setBuyers] = useState<BuyerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // Search
  const [storeSearch, setStoreSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // ── Fetch stores ──
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/stores")
      .then((r) => r.json())
      .then((data) => setStores(data.stores ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch buyers when moving to buyer step ──
  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/buyers");
      const data = await res.json();
      setBuyers(data.buyers ?? []);
    } catch {}
    setLoading(false);
  }, []);

  // ── Fetch store products when moving to products step ──
  const fetchProducts = useCallback(async (storeId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/store-products?storeId=${storeId}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {}
    setLoading(false);
  }, []);

  // ── Cart helpers ──
  const addToCart = (product: ProductOption) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.id === productId ? { ...c, quantity: qty } : c))
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const dp = item.discountPct > 0 ? 1 - item.discountPct / 100 : 1;
    return sum + item.sellingPrice * dp * item.quantity;
  }, 0);

  // ── Step navigation ──
  const goToStore = () => {
    setStep("store");
    setSuccess(null);
  };

  const goToBuyer = () => {
    if (!selectedStore) return;
    fetchBuyers();
    setStep("buyer");
  };

  const goToProducts = () => {
    if (!selectedStore || !selectedBuyer) return;
    fetchProducts(selectedStore.id);
    setStep("products");
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const MIN_ITEMS = 10;

  const goToReview = () => {
    if (cartItemCount < MIN_ITEMS) return;
    setStep("review");
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    if (!selectedStore || !selectedBuyer || cart.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/admin/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: selectedBuyer.id,
          storeId: selectedStore.id,
          paymentMethod,
          items: cart.map((item) => ({
            sellerProductId: item.id,
            dummyProductId: item.dummyProductId,
            title: item.title,
            thumbnail: item.thumbnail,
            price: item.sellingPrice,
            basePrice: item.basePrice,
            discountPercentage: item.discountPct,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to place order");
        return;
      }

      const data = await res.json();
      setSuccess(data.order.orderNumber);
      setCart([]);
      // Notify parent so the orders list refetches
      onOrderPlaced?.();
    } catch {
      alert("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ──
  const handleReset = () => {
    setSelectedStore(null);
    setSelectedBuyer(null);
    setCart([]);
    setSuccess(null);
    setStep("store");
    setStoreSearch("");
    setBuyerSearch("");
    setProductSearch("");
  };

  // ── Filter helpers ──
  const filteredStores = stores.filter((s) =>
    s.storeName.toLowerCase().includes(storeSearch.toLowerCase()) ||
    `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const filteredBuyers = buyers.filter((b) =>
    `${b.firstName} ${b.lastName}`.toLowerCase().includes(buyerSearch.toLowerCase()) ||
    b.email.toLowerCase().includes(buyerSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand ?? "").toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ── Steps indicator ──
  const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "store", label: "Select Store", icon: Store },
    { key: "buyer", label: "Select Buyer", icon: User },
    { key: "products", label: "Select Products", icon: Package },
    { key: "review", label: "Review & Place", icon: ShoppingCart },
  ];

  const stepIdx = STEPS.findIndex((s) => s.key === step);

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-1">
          Order <span className="font-semibold text-gray-900">{success}</span> has been created.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Buyer: {selectedBuyer?.firstName} {selectedBuyer?.lastName} — Store: {selectedStore?.storeName}
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i === stepIdx;
          const isDone = i < stepIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight className={`w-4 h-4 ${isDone ? "text-[#E53935]" : "text-gray-300"}`} />
              )}
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#E53935] text-white"
                    : isDone
                    ? "bg-[#E53935]/10 text-[#E53935]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <StepIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Select Store ── */}
      {step === "store" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Select a Store</h2>
              <p className="text-sm text-gray-500">Choose which seller&apos;s store to place an order from.</p>
            </div>
            {selectedStore && (
              <button
                onClick={goToBuyer}
                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
              >
                Next: Select Buyer
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Search stores..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedStore?.id === store.id
                      ? "border-[#E53935] bg-red-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.storeName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{store.storeName[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                        {store.storeName}
                        {store.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </p>
                      <p className="text-xs text-gray-500">
                        {store.user.firstName} {store.user.lastName} — {store._count.sellerProducts} products
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredStores.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                  No stores found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Select Buyer ── */}
      {step === "buyer" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={goToStore} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Select a Buyer</h2>
                <p className="text-sm text-gray-500">
                  Choose which buyer&apos;s account to use for the order at{" "}
                  <span className="font-medium text-gray-700">{selectedStore?.storeName}</span>.
                </p>
              </div>
            </div>
            {selectedBuyer && (
              <button
                onClick={goToProducts}
                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
              >
                Next: Select Products
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={buyerSearch}
              onChange={(e) => setBuyerSearch(e.target.value)}
              placeholder="Search buyers by name or email..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBuyers.map((buyer) => (
                <button
                  key={buyer.id}
                  onClick={() => setSelectedBuyer(buyer)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedBuyer?.id === buyer.id
                      ? "border-[#E53935] bg-red-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {buyer.avatarUrl ? (
                      <Image
                        src={buyer.avatarUrl}
                        alt={`${buyer.firstName} ${buyer.lastName}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{buyer.firstName[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {buyer.firstName} {buyer.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{buyer.email}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredBuyers.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                  No buyers found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Select Products ── */}
      {step === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("buyer")}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Select Products</h2>
                <p className="text-sm text-gray-500">
                  Products from <span className="font-medium text-gray-700">{selectedStore?.storeName}</span>
                  {" "}— ordering as{" "}
                  <span className="font-medium text-gray-700">{selectedBuyer?.firstName} {selectedBuyer?.lastName}</span>
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={goToReview}
                disabled={cartItemCount < MIN_ITEMS}
                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Review Order ({cartItemCount}/{MIN_ITEMS})
              </button>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {/* Cart summary strip */}
          {cart.length > 0 && (
            <div
              className={`border rounded-xl p-3 flex items-center justify-between ${
                cartItemCount < MIN_ITEMS
                  ? "bg-amber-50 border-amber-200"
                  : "bg-[#E53935]/5 border-[#E53935]/20"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag
                  className={`w-4 h-4 ${cartItemCount < MIN_ITEMS ? "text-amber-600" : "text-[#E53935]"}`}
                />
                <span className="font-medium text-gray-900">{cartItemCount} items</span>
                <span className="text-gray-500">
                  — Total: <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                </span>
              </div>
              {cartItemCount < MIN_ITEMS && (
                <span className="text-xs font-medium text-amber-700">
                  Add {MIN_ITEMS - cartItemCount} more {MIN_ITEMS - cartItemCount === 1 ? "item" : "items"} to continue (minimum {MIN_ITEMS})
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find((c) => c.id === product.id);
                const dp = product.discountPct > 0 ? 1 - product.discountPct / 100 : 1;
                const finalPrice = product.sellingPrice * dp;

                return (
                  <div
                    key={product.id}
                    className={`rounded-xl border-2 overflow-hidden transition-all ${
                      inCart ? "border-[#E53935] bg-red-50/30" : "border-gray-200"
                    }`}
                  >
                    <div className="relative w-full aspect-square bg-gray-50">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      {product.discountPct > 0 && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded">
                          -{Math.round(product.discountPct)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{product.brand ?? product.category}</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {product.title}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-sm font-bold text-gray-900">${finalPrice.toFixed(2)}</span>
                        {product.discountPct > 0 && (
                          <span className="text-xs text-gray-400 line-through">${product.sellingPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {inCart ? (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQty(product.id, inCart.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQty(product.id, inCart.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="ml-auto w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-2 w-full py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                  No products found in this store
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Review & Place Order ── */}
      {step === "review" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep("products")}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Review Order</h2>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Store */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Store</p>
              <div className="flex items-center gap-2">
                {selectedStore?.logoUrl ? (
                  <Image src={selectedStore.logoUrl} alt="" width={32} height={32} className="rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{selectedStore?.storeName[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedStore?.storeName}</p>
                  <p className="text-xs text-gray-500">{selectedStore?.user.firstName} {selectedStore?.user.lastName}</p>
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Buyer Account</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{selectedBuyer?.firstName[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedBuyer?.firstName} {selectedBuyer?.lastName}</p>
                  <p className="text-xs text-gray-500">{selectedBuyer?.email}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Payment Method</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-[#E53935] bg-red-50 text-[#E53935]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  Bank Transfer
                </button>
                <button
                  onClick={() => setPaymentMethod("BITCOIN")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                    paymentMethod === "BITCOIN"
                      ? "border-[#E53935] bg-red-50 text-[#E53935]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  Bitcoin
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700">
                Order Items ({cart.length})
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {cart.map((item) => {
                const dp = item.discountPct > 0 ? 1 - item.discountPct / 100 : 1;
                const finalPrice = item.sellingPrice * dp;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">${finalPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      ${(finalPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-lg font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Place order button */}
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full py-3 bg-[#E53935] text-white font-bold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Place Order — ${cartTotal.toFixed(2)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
