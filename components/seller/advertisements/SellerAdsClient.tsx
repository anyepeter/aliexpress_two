"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Star,
  Zap,
  Crown,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  CreditCard,
  MessageSquare,
  Building2,
  Bitcoin,
  X,
} from "lucide-react";

interface AdPlan {
  id: string;
  tier: string;
  name: string;
  price: number;
  durationDays: number;
  minVisitorsDay: number;
  maxVisitorsDay: number;
  description: string | null;
  features: string[];
}

interface AdSubscription {
  id: string;
  storeId: string;
  planId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  adminNote: string | null;
  createdAt: string;
  plan: AdPlan;
}

const TIER_CONFIG: Record<string, { icon: typeof Star; gradient: string; border: string }> = {
  BASIC: { icon: Star, gradient: "from-[#0a1a2e] to-[#14304d]", border: "border-gray-200" },
  STANDARD: { icon: Zap, gradient: "from-[#08152a] to-[#0F2540]", border: "border-[#0F2540]/30" },
  PREMIUM: { icon: Crown, gradient: "from-[#050e1a] to-[#0a1a2e]", border: "border-[#0F2540]/40" },
};

function formatVisitors(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

export default function SellerAdsClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<AdPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe modal state
  const [selectedPlan, setSelectedPlan] = useState<AdPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "BITCOIN">("BANK_TRANSFER");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStep, setSubscribeStep] = useState<"payment" | "done">("payment");
  const [cancelling, setCancelling] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [contactingAdmin, setContactingAdmin] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/ad-plans").then((r) => r.json()),
      fetch("/api/ad-subscriptions").then((r) => r.json()),
    ])
      .then(([p, s]) => { setPlans(p); setSubscriptions(s); })
      .finally(() => setLoading(false));
  }, []);

  const activeSub = subscriptions.find((s) => s.status === "ACTIVE");
  const pendingSub = subscriptions.find((s) => s.status === "PENDING");
  const currentSub = activeSub || pendingSub;

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/ad-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      if (res.ok) {
        const sub = await res.json();
        setSubscriptions((prev) => [sub, ...prev]);
        setSubscribeStep("done");
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleContactAdmin = async () => {
    if (!selectedPlan || contactingAdmin) return;
    setContactingAdmin(true);
    try {
      // Get admin ID
      const adminRes = await fetch("/api/admin/info");
      if (!adminRes.ok) return;
      const admin = await adminRes.json();

      // Start conversation with pre-filled message
      const convRes = await fetch("/api/messages/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: admin.id,
          subject: `Advertisement Plan - ${selectedPlan.name}`,
        }),
      });

      if (convRes.ok) {
        const { conversationId } = await convRes.json();

        // Send the pre-written message
        const message = `Hello, I would like to subscribe to the ${selectedPlan.name} Advertisement Plan ($${selectedPlan.price.toLocaleString()}).\n\nPayment Method: ${paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin"}\n\nPlease provide me with the payment details so I can complete the transaction. Thank you!`;

        await fetch(`/api/messages/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message, type: "TEXT" }),
        });

        // Close modal and navigate to messages
        setSelectedPlan(null);
        setSubscribeStep("payment");
        router.push(`/messages?c=${conversationId}`);
      }
    } catch {
      // silent
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/ad-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: cancelTarget }),
      });
      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === cancelTarget ? { ...s, status: "CANCELLED" } : s))
        );
        setCancelTarget(null);
      }
    } finally {
      setCancelling(false);
    }
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setSubscribeStep("payment");
    setPaymentMethod("BANK_TRANSFER");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advertisement Plans</h1>
        <p className="text-gray-500 mt-1">
          Boost your store visibility and get more customers
        </p>
      </div>

      {/* Active Subscription Banner */}
      {activeSub && (
        <div className="rounded-2xl p-5 border bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-bold text-green-800">
                  Active Plan — {activeSub.plan.name}
                </h3>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  {formatVisitors(activeSub.plan.minVisitorsDay)}–{formatVisitors(activeSub.plan.maxVisitorsDay)} visitors/day
                </p>
                {activeSub.startDate && activeSub.endDate && (
                  <p>
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    {new Date(activeSub.startDate).toLocaleDateString()} — {new Date(activeSub.endDate).toLocaleDateString()}
                    {" "}({Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left)
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                ACTIVE
              </span>
              <button
                onClick={() => setCancelTarget(activeSub.id)}
                disabled={cancelling}
                className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Subscription Banner */}
      {pendingSub && !activeSub && (
        <div className="rounded-2xl p-5 border bg-amber-50 border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">
                  Approval Pending — {pendingSub.plan.name} Plan
                </h3>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Your subscription is pending admin approval. You will be notified once it&apos;s approved.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Submitted: {new Date(pendingSub.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                PENDING
              </span>
              <button
                onClick={() => setCancelTarget(pendingSub.id)}
                disabled={cancelling}
                className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const config = TIER_CONFIG[plan.tier] ?? TIER_CONFIG.BASIC;
          const Icon = config.icon;
          const isCurrentPlan = currentSub?.planId === plan.id;
          const canSubscribe = !currentSub;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-shadow hover:shadow-lg ${
                plan.tier === "PREMIUM" ? "border-[#0F2540]/40 shadow-md" : config.border
              }`}
            >
              {plan.tier === "PREMIUM" && (
                <div className="absolute top-3 right-3 bg-white text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  MOST POPULAR
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute top-3 left-3 bg-white text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  {currentSub?.status === "ACTIVE" ? "CURRENT PLAN" : "PENDING APPROVAL"}
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-br ${config.gradient} px-5 py-6 text-white`}>
                <Icon className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-white/70 text-xs mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-black">${plan.price.toLocaleString()}</span>
                  <span className="text-white/60 text-sm ml-1">/ {plan.durationDays} days</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {formatVisitors(plan.minVisitorsDay)}–{formatVisitors(plan.maxVisitorsDay)}
                  </span>
                  <span className="text-xs text-gray-500">visitors/day</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => canSubscribe && setSelectedPlan(plan)}
                  disabled={!canSubscribe}
                  className={`w-full mt-3 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? currentSub?.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 cursor-default"
                        : "bg-amber-50 text-amber-700 cursor-default"
                      : canSubscribe
                      ? `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  } disabled:opacity-60`}
                >
                  {isCurrentPlan ? (
                    currentSub?.status === "ACTIVE" ? (
                      <><CheckCircle2 className="w-4 h-4" /> Current Plan</>
                    ) : (
                      <><Clock className="w-4 h-4" /> Approval Pending</>
                    )
                  ) : canSubscribe ? (
                    "Subscribe Now"
                  ) : (
                    "Plan Active"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription History</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {subscriptions.map((sub) => {
                const statusColors: Record<string, string> = {
                  ACTIVE: "bg-green-50 text-green-700",
                  PENDING: "bg-amber-50 text-amber-700",
                  EXPIRED: "bg-gray-100 text-gray-500",
                  REJECTED: "bg-red-50 text-red-700",
                  CANCELLED: "bg-gray-100 text-gray-500",
                };
                return (
                  <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sub.plan.name} Plan</p>
                      <p className="text-xs text-gray-400">
                        ${sub.plan.price.toLocaleString()} · {new Date(sub.createdAt).toLocaleDateString()}
                        {sub.endDate && ` — ${new Date(sub.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[sub.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {sub.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {cancelTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !cancelling && setCancelTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Cancel Plan?</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Your store will be removed from the sponsored section and daily visitor boosts will stop immediately. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Subscribe Modal ── */}
      {selectedPlan && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`bg-gradient-to-br ${TIER_CONFIG[selectedPlan.tier]?.gradient ?? "from-blue-500 to-blue-700"} px-6 py-5 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedPlan.name} Plan</h3>
                  <p className="text-white/70 text-sm mt-0.5">
                    ${selectedPlan.price.toLocaleString()} / {selectedPlan.durationDays} days
                  </p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {subscribeStep === "payment" ? (
              <div className="p-6 space-y-5">
                {/* Plan Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-bold text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{selectedPlan.durationDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Visitors</span>
                    <span className="font-medium text-gray-900">{formatVisitors(selectedPlan.minVisitorsDay)}–{formatVisitors(selectedPlan.maxVisitorsDay)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-[#1A1A1A] text-lg">${selectedPlan.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "border-[#1A1A1A] bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building2 className={`w-6 h-6 ${paymentMethod === "BANK_TRANSFER" ? "text-[#1A1A1A]" : "text-gray-400"}`} />
                      <span className={`text-sm font-semibold ${paymentMethod === "BANK_TRANSFER" ? "text-[#1A1A1A]" : "text-gray-600"}`}>
                        Bank Transfer
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("BITCOIN")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "BITCOIN"
                          ? "border-[#F7931A] bg-[#F7931A]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Bitcoin className={`w-6 h-6 ${paymentMethod === "BITCOIN" ? "text-[#F7931A]" : "text-gray-400"}`} />
                      <span className={`text-sm font-semibold ${paymentMethod === "BITCOIN" ? "text-[#F7931A]" : "text-gray-600"}`}>
                        Bitcoin
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`w-full py-3.5 bg-gradient-to-r ${TIER_CONFIG[selectedPlan.tier]?.gradient ?? "from-blue-500 to-blue-700"} text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {subscribing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Confirm Subscription</>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: Done — contact admin */
              <div className="p-6 space-y-5">
                <div className="text-center py-3">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Subscription Submitted!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your {selectedPlan.name} plan subscription is now <strong className="text-amber-600">pending approval</strong>.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    Contact customer support to provide your payment details and complete the subscription.
                  </p>
                </div>

                <button
                  onClick={handleContactAdmin}
                  disabled={contactingAdmin}
                  className={`w-full py-3.5 bg-gradient-to-r ${TIER_CONFIG[selectedPlan.tier]?.gradient ?? "from-blue-500 to-blue-700"} text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2`}
                >
                  {contactingAdmin ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                  ) : (
                    <><MessageSquare className="w-4 h-4" /> Contact Support to Make Payment</>
                  )}
                </button>

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                >
                  I&apos;ll pay later
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
