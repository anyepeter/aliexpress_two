"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Plus,
  CreditCard,
  Bitcoin,
  ChevronRight,
  CheckCircle2,
  ShoppingBag,
  Loader2,
  ArrowLeft,
  Shield,
  Package,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import type { StoreCartGroup } from "@/lib/types/marketplace";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  isDefault: boolean;
};

type Step = "address" | "payment" | "review";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: Package },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { items, getGroupedByStore, getDiscountedPrice, clearCart } = useCartStore();

  const [step, setStep] = useState<Step>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "BITCOIN" | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<Array<{ orderNumber: string; store: { storeName: string } }>>([]);
  const [error, setError] = useState<string | null>(null);

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const groups = getGroupedByStore();

  const totalPrice = items.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
    0
  );

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        const def = data.addresses.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (data.addresses.length > 0) setSelectedAddressId(data.addresses[0].id);
      }
    } catch {
      // silent
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Redirect unauthenticated users to register
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/register/buyer?redirect=/checkout");
    }
  }, [isLoaded, isSignedIn, router]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Redirect if cart is empty (and not in success state)
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push("/");
    }
  }, [items.length, orderSuccess, router]);

  // Redirect if fewer than 10 items
  useEffect(() => {
    if (items.length > 0 && totalItems < 10 && !orderSuccess) {
      router.push("/");
    }
  }, [totalItems, items.length, orderSuccess, router]);

  const handleAddAddress = async () => {
    if (!addressForm.label || !addressForm.street || !addressForm.city || !addressForm.country) {
      setError("Please fill in all required address fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addressForm, isDefault: addresses.length === 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddressId(data.address.id);
        setShowAddressForm(false);
        setAddressForm({ label: "", street: "", city: "", state: "", country: "", postalCode: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add address");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !paymentMethod) return;
    if (totalItems < 10) {
      setError("Minimum 10 items required to place an order. Please add more items to your cart.");
      return;
    }
    setPlacing(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          groups: groups.map((g) => ({
            storeId: g.storeId,
            storeName: g.storeName,
            items: g.items.map((item) => ({
              id: item.id,
              dummyProductId: item.dummyProductId,
              title: item.title,
              thumbnail: item.thumbnail,
              price: item.price,
              discountPercentage: item.discountPercentage,
              quantity: item.quantity,
            })),
            subtotal: g.subtotal,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedOrders(data.orders);
        setOrderSuccess(true);
        clearCart();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to place order");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const canProceedFromAddress = selectedAddressId !== null;
  const canProceedFromPayment = paymentMethod !== null;

  // ── Success Screen ───
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
              <p className="text-gray-500 mt-2">
                {createdOrders.length > 1
                  ? `${createdOrders.length} orders have been created (one per store).`
                  : "Your order has been created."}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
              {createdOrders.map((order) => (
                <div key={order.orderNumber} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.store?.storeName ?? "MarketHub"}</p>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/buyer/orders"
                className="w-full py-3 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors text-center"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show nothing while checking auth or if not signed in (will redirect)
  if (!isLoaded || !isSignedIn) return null;

  if (items.length === 0) return null;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E53935] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const stepIndex = STEPS.findIndex((st) => st.key === step);
            const isDone = i < stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-8 h-0.5 ${isDone || isActive ? "bg-[#E53935]" : "bg-gray-200"}`} />
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
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: Step content ── */}
          <div className="flex-1 min-w-0">
            {/* STEP 1: Address */}
            {step === "address" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E53935]" />
                  Delivery Address
                </h2>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {addresses.length > 0 && (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? "border-[#E53935] bg-[#E53935]/5"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 accent-[#E53935]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {addr.label}
                                {addr.isDefault && (
                                  <span className="ml-2 text-[10px] font-bold text-[#1A1A1A] bg-[#E53935]/10 rounded-full px-2 py-0.5">
                                    Default
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {addr.street}, {addr.city}
                                {addr.state ? `, ${addr.state}` : ""}, {addr.country}
                                {addr.postalCode ? ` ${addr.postalCode}` : ""}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Add new address */}
                    {!showAddressForm ? (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-2 text-sm font-medium text-[#E53935] hover:text-[#E53935] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Address
                      </button>
                    ) : (
                      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700">New Address</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            placeholder="Label (e.g. Home) *"
                            value={addressForm.label}
                            onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                            className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                          <input
                            placeholder="Street Address *"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
                            className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                          <input
                            placeholder="City *"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                          <input
                            placeholder="State"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                          <input
                            placeholder="Country *"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                          <input
                            placeholder="Postal Code"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleAddAddress}
                            disabled={loading}
                            className="px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-50"
                          >
                            {loading ? "Saving..." : "Save Address"}
                          </button>
                          <button
                            onClick={() => setShowAddressForm(false)}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setStep("payment")}
                    disabled={!canProceedFromAddress}
                    className="w-full py-3 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Method */}
            {step === "payment" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#E53935]" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "border-[#E53935] bg-[#E53935]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="accent-[#E53935]"
                    />
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Pay via bank transfer. Seller will contact admin for verification.</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "BITCOIN"
                        ? "border-[#E53935] bg-[#E53935]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "BITCOIN"}
                      onChange={() => setPaymentMethod("BITCOIN")}
                      className="accent-[#E53935]"
                    />
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Bitcoin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Bitcoin</p>
                      <p className="text-xs text-gray-500">Pay with Bitcoin. Seller will contact admin for verification.</p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setStep("address")}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!canProceedFromPayment}
                    className="flex-1 py-3 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Review Order <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Place Order */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Delivery info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#E53935]" /> Delivery Address
                    </h3>
                    <button
                      onClick={() => setStep("address")}
                      className="text-xs text-[#E53935] font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  {selectedAddress && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{selectedAddress.label}</span> — {selectedAddress.street}, {selectedAddress.city}
                      {selectedAddress.state ? `, ${selectedAddress.state}` : ""}, {selectedAddress.country}
                    </p>
                  )}
                </div>

                {/* Payment info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#E53935]" /> Payment Method
                    </h3>
                    <button
                      onClick={() => setStep("payment")}
                      className="text-xs text-[#E53935] font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin"}
                  </p>
                </div>

                {/* Order items grouped by store */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#E53935]" /> Order Items
                  </h3>

                  {groups.map((group) => (
                    <OrderGroupPreview
                      key={group.storeId ?? "official"}
                      group={group}
                      getDiscountedPrice={(item) => {
                        const dp = item.discountPercentage;
                        return dp > 0 ? item.price * (1 - dp / 100) : item.price;
                      }}
                    />
                  ))}
                </div>

                {/* Place Order */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("payment")}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || items.length === 0}
                    className="flex-1 py-3 bg-[#E53935] text-white text-sm font-bold rounded-xl hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" /> Place Order — ${totalPrice.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary sidebar ── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#E53935]" />
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-[#1A1A1A]">${totalPrice.toFixed(2)}</span>
              </div>

              {groups.length > 1 && (
                <p className="text-[11px] text-gray-400 text-center">
                  {groups.length} separate orders will be created
                </p>
              )}

              <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center pt-1">
                <Shield className="w-3 h-3" />
                Secure checkout &middot; Min. 10 items
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrderGroupPreview({
  group,
  getDiscountedPrice,
}: {
  group: StoreCartGroup;
  getDiscountedPrice: (item: { price: number; discountPercentage: number }) => number;
}) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* Store header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E53935]/5 border-b border-gray-100">
        {group.logoUrl ? (
          <Image src={group.logoUrl} alt={group.storeName} width={20} height={20} className="rounded-full object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#E53935] flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">{group.storeName[0].toUpperCase()}</span>
          </div>
        )}
        <span className="text-xs font-bold text-[#1A1A1A]">{group.storeName}</span>
        {group.isVerified && (
          <span className="text-[9px] font-bold text-[#1A1A1A]">✓ Verified</span>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {group.items.map((item) => {
          const discounted = getDiscountedPrice(item);
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={40}
                height={40}
                className="rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-xs font-bold text-[#1A1A1A]">
                ${(discounted * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">Store subtotal</span>
        <span className="text-xs font-bold text-[#1A1A1A]">${group.subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
