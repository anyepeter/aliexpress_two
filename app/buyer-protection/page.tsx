import type { Metadata } from "next";
import Link from "next/link";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  ShieldCheck,
  Lock,
  Scale,
  ShoppingCart,
  PackageSearch,
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Buyer Protection — MarketHub Express",
  description:
    "Shop with complete confidence. Every purchase on MarketHub Express is backed by our comprehensive buyer protection program.",
};

export default function BuyerProtectionPage() {
  const pillars = [
    {
      icon: BadgeDollarSign,
      title: "Money-Back Guarantee",
      description:
        "Receive a full refund if your item doesn't arrive or doesn't match the seller's description. We stand behind every transaction on our platform.",
      highlights: [
        "Full refund for items not received",
        "Full refund for items not as described",
        "Partial refunds available for minor issues",
      ],
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description:
        "All transactions are encrypted with industry-leading security protocols. Your payment information is never shared with sellers.",
      highlights: [
        "256-bit SSL encryption",
        "PCI DSS compliant processing",
        "Payment info never shared with sellers",
      ],
    },
    {
      icon: Scale,
      title: "Dispute Resolution",
      description:
        "Our dedicated team of specialists mediates between buyers and sellers to ensure fair outcomes for every dispute.",
      highlights: [
        "Professional mediation team",
        "Fair and impartial process",
        "Evidence-based decisions",
      ],
    },
  ];

  const steps = [
    {
      icon: ShoppingCart,
      step: "01",
      title: "Shop & Pay Securely",
      description:
        "Browse millions of products and pay with confidence using our secure checkout. Your financial details are protected at every step.",
    },
    {
      icon: PackageSearch,
      step: "02",
      title: "Receive & Inspect Your Order",
      description:
        "Once your order arrives, take time to inspect the item carefully. Make sure it matches the listing description and meets your expectations.",
    },
    {
      icon: AlertTriangle,
      step: "03",
      title: "Open a Dispute if Needed",
      description:
        "If something isn't right, open a dispute within 15 days of delivery. Provide photos and details so our team can review your case.",
    },
    {
      icon: BadgeDollarSign,
      step: "04",
      title: "Get Your Money Back",
      description:
        "Once the dispute is resolved in your favor, your refund is processed immediately. Funds typically return within 5-10 business days.",
    },
  ];

  const covered = [
    "Item not received after estimated delivery date",
    "Item significantly different from listing description",
    "Wrong item shipped to you",
    "Item arrived damaged or defective",
    "Counterfeit items",
    "Missing parts or accessories listed in the description",
  ];

  const notCovered = [
    "Change of mind or personal preference",
    "Items damaged by the buyer after delivery",
    "Disputes opened more than 15 days after delivery",
    "Items explicitly sold as-is or for parts",
    "Shipping delays due to customs or force majeure",
    "Digital goods after download or access",
  ];

  const stats = [
    {
      icon: DollarSign,
      value: "$5M+",
      label: "Refunded to Buyers",
    },
    {
      icon: Users,
      value: "98%",
      label: "Dispute Resolution Rate",
    },
    {
      icon: Clock,
      value: "24hr",
      label: "Average Response Time",
    },
  ];

  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#E53935] via-[#E53935] to-[#0f2740] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#E53935] rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#E53935] rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <Shield className="w-5 h-5 text-[#E53935]" />
              <span className="text-white/90 text-sm font-medium tracking-wide">
                100% Purchase Protection
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              MarketHub{" "}
              <span className="text-[#E53935]">Buyer Protection</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Shop with Complete Confidence. Every purchase is backed by our
              comprehensive protection program, ensuring your money and your
              trust are always safe.
            </p>
          </div>
        </section>

        {/* You're Protected Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-gradient-to-r from-[#E53935] to-[#d4a645] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 shadow-xl shadow-[#E53935]/20">
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full p-4">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                You&apos;re Protected
              </h2>
              <p className="text-white/90 text-lg">
                Every single purchase you make on MarketHub Express is covered by
                our Buyer Protection program — no exceptions.
              </p>
            </div>
          </div>
        </section>

        {/* Three Protection Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#E53935] mb-4">
              Our Protection Pillars
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Three layers of protection designed to make your shopping
              experience completely worry-free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-[#E53935]/10 rounded-2xl flex items-center justify-center mb-6">
                  <pillar.icon className="w-8 h-8 text-[#E53935]" />
                </div>
                <h3 className="text-xl font-bold text-[#E53935] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {pillar.description}
                </p>
                <ul className="space-y-3">
                  {pillar.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#E53935] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#E53935] mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                From secure checkout to guaranteed refunds, here is how our
                protection process works step by step.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[2px]">
                      <div className="w-full h-full border-t-2 border-dashed border-[#E53935]/30" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-[#F5F6FA] rounded-full flex items-center justify-center">
                        <step.icon className="w-10 h-10 text-[#E53935]" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-10 h-10 bg-[#E53935] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#E53935] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Covered vs What's Not Covered */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#E53935] mb-4">
              Coverage Details
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Understand exactly what our Buyer Protection covers so you can
              shop with full clarity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Covered */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#E53935]">
                  What&apos;s Covered
                </h3>
              </div>
              <ul className="space-y-4">
                {covered.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Not Covered */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#E53935]">
                  What&apos;s Not Covered
                </h3>
              </div>
              <ul className="space-y-4">
                {notCovered.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-[#E53935] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
                    <stat.icon className="w-7 h-7 text-[#E53935]" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-br from-[#E53935] to-[#0f2740] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E53935] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E53935] rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <ShieldCheck className="w-16 h-16 text-[#E53935] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Shop with Confidence?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Every purchase is protected. Browse our marketplace and enjoy
                the peace of mind that comes with MarketHub Buyer Protection.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-4 rounded-xl transition-colors duration-200 text-lg shadow-lg shadow-[#E53935]/30"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
