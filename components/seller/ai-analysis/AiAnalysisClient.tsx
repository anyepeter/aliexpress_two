"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Brain,
  TrendingUp,
  Sparkles,
  Lock,
  CreditCard,
  Building2,
  Bitcoin,
  MessageSquare,
  X,
  CheckCircle2,
  Clock,
  BarChart3,
  ShoppingBag,
  ArrowUp,
  Minus,
  Zap,
  Plus,
  PackagePlus,
} from "lucide-react";

interface Prediction {
  id: number;
  title: string;
  thumbnail: string | null;
  category: string;
  price: number;
  predictedOrders: number;
  confidence: number;
  trend: string;
  inStore: boolean;
}

interface AnalysisResult {
  predictions: Prediction[];
  messages: string[];
  analyzedAt: string;
  totalProductsAnalyzed: number;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  price: number;
}

export default function AiAnalysisClient() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const [addingAll, setAddingAll] = useState(false);

  // Margin modal state
  const [marginModal, setMarginModal] = useState<{ products: Prediction[] } | null>(null);
  const [margin, setMargin] = useState(12);
  const [publishing, setPublishing] = useState(false);

  // Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "BITCOIN">("BANK_TRANSFER");
  const [subscribing, setSubscribing] = useState(false);
  const [payStep, setPayStep] = useState<"method" | "done">("method");
  const [contactingSupport, setContactingSupport] = useState(false);

  useEffect(() => {
    fetch("/api/ai-analysis")
      .then((r) => r.json())
      .then((data) => {
        setHasAccess(data.hasAccess);
        setSubscription(data.subscription);
      })
      .finally(() => setLoading(false));
  }, []);

  // Typing effect for AI messages
  useEffect(() => {
    if (!result || typingIndex >= result.messages.length) return;
    if (typingIndex === -1) {
      setTypingIndex(0);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedMessages((prev) => [...prev, result.messages[typingIndex]]);
      setTypingIndex((prev) => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [result, typingIndex]);

  const openMarginModal = (products: Prediction[]) => {
    setMarginModal({ products });
    setMargin(12);
  };

  const handlePublish = async () => {
    if (!marginModal) return;
    setPublishing(true);
    try {
      // Build all products payload at once using data we already have
      const payload = marginModal.products.map((p) => ({
        dummyProductId: p.id,
        title: p.title,
        description: "",
        images: [],
        category: p.category,
        brand: null,
        basePrice: p.price,
        marginPercent: margin,
        sellingPrice: parseFloat((p.price * (1 + margin / 100)).toFixed(2)),
        discountPct: 0,
        stock: 100,
        tags: [],
        rating: 0,
        status: "PUBLISHED",
      }));

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });

      if (res.ok) {
        for (const p of marginModal.products) {
          setAddedProducts((prev) => new Set([...prev, p.id]));
        }
      }

      setMarginModal(null);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddAll = () => {
    if (!result) return;
    const toAdd = result.predictions.filter((p) => !p.inStore && !addedProducts.has(p.id));
    if (toAdd.length > 0) openMarginModal(toAdd);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);
    setDisplayedMessages([]);
    setTypingIndex(-1);

    // Fake delay to simulate AI processing
    await new Promise((r) => setTimeout(r, 2500));

    try {
      const res = await fetch("/api/ai-analysis/analyze", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setTypingIndex(0);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const sub = await res.json();
        setSubscription(sub);
        setPayStep("done");
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleContactSupport = async () => {
    if (contactingSupport) return;
    setContactingSupport(true);
    try {
      const adminRes = await fetch("/api/admin/info");
      if (!adminRes.ok) { setContactingSupport(false); return; }
      const admin = await adminRes.json();

      const convRes = await fetch("/api/messages/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: admin.id,
          subject: "AI Analysis Subscription Payment",
        }),
      });

      if (convRes.ok) {
        const { conversationId } = await convRes.json();
        const message = `Hello, I would like to unlock the AI Market Analysis tool ($299).\n\nPayment Method: ${paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin"}\n\nPlease provide me with the payment details so I can complete my subscription. Thank you!`;

        await fetch(`/api/messages/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message, type: "TEXT" }),
        });

        setShowPayModal(false);
        setPayStep("method");
        router.push(`/messages?c=${conversationId}`);
      }
    } catch {
      // silent
    } finally {
      setContactingSupport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // ── No Access — Show paywall ──
  if (!hasAccess && !subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Market Analysis</h1>
          <p className="text-gray-500 mt-1">Discover winning products with AI-powered insights</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#0a1a2e] to-[#14304d] px-8 py-12 text-center text-white">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Unlock AI Market Analysis</h2>
            <p className="text-white/60 max-w-md mx-auto">
              Get data-driven product recommendations and market insights to grow your store faster.
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: TrendingUp, title: "Trending Products", desc: "Discover which products are in high demand this week" },
                { icon: BarChart3, title: "Order Predictions", desc: "Get estimated order volumes for recommended products" },
                { icon: Sparkles, title: "Weekly Reports", desc: "Fresh analysis every time you run the tool" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 text-[#0F2540] mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-3xl font-black text-[#1A1A1A] mb-1">$299</p>
              <p className="text-sm text-gray-400 mb-6">one-time payment</p>
              <button
                onClick={() => setShowPayModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Lock className="w-4 h-4" />
                Unlock AI Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => { setShowPayModal(false); setPayStep("method"); }} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[460px] max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a1a2e] to-[#14304d] px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">AI Market Analysis</h3>
                    <p className="text-white/60 text-sm">$299 one-time payment</p>
                  </div>
                  <button onClick={() => { setShowPayModal(false); setPayStep("method"); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {payStep === "method" ? (
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod("BANK_TRANSFER")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === "BANK_TRANSFER" ? "border-[#0F2540] bg-gray-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Building2 className={`w-6 h-6 ${paymentMethod === "BANK_TRANSFER" ? "text-[#0F2540]" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold ${paymentMethod === "BANK_TRANSFER" ? "text-[#0F2540]" : "text-gray-600"}`}>Bank Transfer</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("BITCOIN")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === "BITCOIN" ? "border-[#F7931A] bg-[#F7931A]/5" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Bitcoin className={`w-6 h-6 ${paymentMethod === "BITCOIN" ? "text-[#F7931A]" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold ${paymentMethod === "BITCOIN" ? "text-[#F7931A]" : "text-gray-600"}`}>Bitcoin</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {subscribing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Confirm Payment</>}
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  <div className="text-center py-3">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Subscription Submitted!</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Your AI Analysis subscription is <strong className="text-amber-600">pending approval</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handleContactSupport}
                    disabled={contactingSupport}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {contactingSupport ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : <><MessageSquare className="w-4 h-4" /> Contact Support to Make Payment</>}
                  </button>
                  <button onClick={() => { setShowPayModal(false); setPayStep("method"); }} className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700">
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

  // ── Pending approval ──
  if (subscription?.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Market Analysis</h1>
          <p className="text-gray-500 mt-1">Discover winning products with AI-powered insights</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-amber-800">Approval Pending</h2>
          <p className="text-sm text-amber-700 mt-1">Your AI Analysis subscription is awaiting admin approval. You&apos;ll get access once your payment is confirmed.</p>
        </div>
      </div>
    );
  }

  // ── Has Access — Show analysis dashboard ──
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">AI Market Analysis</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">ACTIVE</span>
          </div>
          <p className="text-gray-500 mt-1">Discover trending products and market opportunities</p>
        </div>
      </div>

      {/* Analysis Action */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1a2e] to-[#14304d] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Market Intelligence</h2>
              <p className="text-xs text-gray-400">Analyze products and predict demand</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Market...</>
            ) : (
              <><Zap className="w-4 h-4" /> Analyze Winning Products</>
            )}
          </button>
        </div>

        {/* Analyzing Animation */}
        {analyzing && (
          <div className="flex flex-col items-center py-12">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#0F2540]/10 border-t-[#0F2540] animate-spin" />
              <Brain className="w-8 h-8 text-[#0F2540] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm font-medium text-gray-600 mt-4">Scanning market data...</p>
            <p className="text-xs text-gray-400 mt-1">Analyzing trends across all categories</p>
          </div>
        )}

        {/* AI Messages */}
        {!analyzing && displayedMessages.length > 0 && (
          <div className="space-y-3 mb-6">
            {displayedMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0a1a2e] to-[#14304d] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-2.5 flex-1">
                  {msg}
                </p>
              </div>
            ))}
            {typingIndex < (result?.messages.length ?? 0) && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0a1a2e] to-[#14304d] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex gap-1 px-4 py-3">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        {!analyzing && result && displayedMessages.length === result.messages.length && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Top {result.predictions.length} Recommended Products
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400">
                  {result.totalProductsAnalyzed} products analyzed
                </span>
                {result.predictions.some((p) => !p.inStore && !addedProducts.has(p.id)) && (
                  <button
                    onClick={handleAddAll}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <PackagePlus className="w-3.5 h-3.5" /> Add All to Store
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.predictions.map((p, i) => {
                const alreadyInStore = p.inStore || addedProducts.has(p.id);

                return (
                <div
                  key={p.id}
                  className="group relative flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-400 w-5 text-center">
                    {i + 1}
                  </span>

                  {p.thumbnail ? (
                    <Image
                      src={p.thumbnail}
                      alt={p.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">${p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{p.category.replace(/-/g, " ")}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-[#0F2540]" />
                        <span className="text-sm font-bold text-[#0F2540]">{p.predictedOrders}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {p.trend === "up" ? (
                          <ArrowUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-[10px] text-gray-400">{p.confidence}%</span>
                      </div>
                    </div>

                    {/* Add to Store button */}
                    {alreadyInStore ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" /> In Store
                      </span>
                    ) : (
                      <button
                        onClick={() => openMarginModal([p])}
                        className="flex items-center gap-1 text-[10px] font-semibold text-[#0F2540] bg-[#0F2540]/10 px-2 py-1 rounded-lg hover:bg-[#0F2540]/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!analyzing && !result && (
          <div className="text-center py-10">
            <Brain className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Click &quot;Analyze Winning Products&quot; to get started</p>
          </div>
        )}
      </div>

      {/* ── Margin Modal ── */}
      {marginModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !publishing && setMarginModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#0a1a2e] to-[#14304d] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Set Profit Margin</h3>
                  <p className="text-white/60 text-sm">
                    {marginModal.products.length} product{marginModal.products.length !== 1 ? "s" : ""} to add
                  </p>
                </div>
                <button onClick={() => setMarginModal(null)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Products preview */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {marginModal.products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                    {p.thumbnail ? (
                      <Image src={p.thumbnail} alt={p.title} width={36} height={36} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-[10px] text-gray-400">${p.price.toFixed(2)}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 shrink-0">
                      ${(p.price * (1 + margin / 100)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Margin slider */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Profit Margin</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="8"
                    max="25"
                    step="1"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="flex-1 accent-[#0F2540]"
                  />
                  <span className="text-lg font-black text-[#0F2540] w-14 text-center bg-gray-50 rounded-lg py-1">
                    {margin}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                  <span>8%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Products</span>
                  <span className="font-medium">{marginModal.products.length}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Margin</span>
                  <span className="font-medium">{margin}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Est. profit per product</span>
                  <span className="font-medium text-green-600">
                    ~${(marginModal.products.reduce((s, p) => s + p.price, 0) / marginModal.products.length * margin / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMarginModal(null)}
                  disabled={publishing}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0a1a2e] to-[#14304d] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {publishing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Publish to Store</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
