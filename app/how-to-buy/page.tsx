import type { Metadata } from "next";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  UserPlus,
  Search,
  ShieldCheck,
  ShoppingCart,
  CreditCard,
  Truck,
  Star,
  Scale,
  BookOpen,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Buy — MarketHub Express",
  description:
    "Learn how to shop on MarketHub Express. Our step-by-step guide makes online shopping easy, secure, and enjoyable.",
};

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description:
      "Sign up for free in just a few seconds. Verify your email address to unlock the full shopping experience, wishlists, and order tracking.",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Browse & Search",
    description:
      "Use our intuitive categories, powerful filters, and smart search bar to find exactly what you are looking for among thousands of products.",
    icon: Search,
  },
  {
    number: 3,
    title: "Check Seller Ratings",
    description:
      "Look for verified sellers with high ratings. Read honest reviews from real buyers to make informed purchasing decisions.",
    icon: ShieldCheck,
  },
  {
    number: 4,
    title: "Add to Cart",
    description:
      "Select your preferred variants such as size, color, or style. Choose your quantity and add items to your cart for a seamless checkout.",
    icon: ShoppingCart,
  },
  {
    number: 5,
    title: "Secure Checkout",
    description:
      "Choose your preferred shipping method, enter your delivery address, and pay securely with our encrypted payment processing.",
    icon: CreditCard,
  },
  {
    number: 6,
    title: "Track Your Order",
    description:
      "Follow your package in real time with live tracking updates. Receive notifications at every stage from dispatch to delivery.",
    icon: Truck,
  },
];

const paymentMethods = [
  { name: "Visa", color: "#1A1F71" },
  { name: "Mastercard", color: "#EB001B" },
  { name: "PayPal", color: "#003087" },
  { name: "Apple Pay", color: "#000000" },
  { name: "Google Pay", color: "#4285F4" },
];

const shoppingTips = [
  {
    icon: Scale,
    title: "Compare Prices",
    description:
      "Browse multiple sellers for the same product to find the best deal. Price differences can be significant across listings.",
  },
  {
    icon: BookOpen,
    title: "Read Reviews",
    description:
      "Detailed reviews with photos give the most accurate picture of product quality. Look for reviews from verified purchases.",
  },
  {
    icon: BadgeCheck,
    title: "Check Seller Ratings",
    description:
      "Sellers with higher ratings and more completed orders are generally more reliable. Look for the verified badge.",
  },
  {
    icon: ShieldCheck,
    title: "Use Buyer Protection",
    description:
      "Every purchase on MarketHub is covered by our buyer protection program. Shop with confidence knowing you are covered.",
  },
];

export default function HowToBuyPage() {
  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#E53935] via-[#22476b] to-[#E53935]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#E53935] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E53935] rounded-full blur-[150px]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <span className="inline-block rounded-full bg-[#E53935]/20 px-4 py-1.5 text-sm font-medium text-[#E53935] mb-6">
              Shopping Guide
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How to Shop on{" "}
              <span className="text-[#E53935]">MarketHub</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
              Easy, secure, and enjoyable shopping in just a few simple steps.
              From creating your account to tracking your delivery, we have got you covered.
            </p>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#E53935] sm:text-4xl">
              Your Shopping Journey
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Follow these six simple steps to start shopping today
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#E53935]/30 hover:-translate-y-1"
                >
                  <div className="absolute -top-4 -left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E53935] text-sm font-bold text-white shadow-lg shadow-[#E53935]/30">
                    {step.number}
                  </div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E53935]/5 text-[#E53935] group-hover:bg-[#C62828]/10 group-hover:text-[#E53935] transition-colors duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#E53935] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white border-y border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#E53935]">
                Accepted Payment Methods
              </h2>
              <p className="mt-3 text-gray-500">
                We support all major payment options for your convenience
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#F5F6FA] px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CreditCard
                    className="h-6 w-6"
                    style={{ color: method.color }}
                  />
                  <span className="font-medium text-[#E53935]">
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-gray-400">
              All transactions are encrypted with 256-bit SSL security
            </p>
          </div>
        </section>

        {/* Shopping Tips */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#E53935] sm:text-4xl">
              Shopping Tips
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Make the most of your MarketHub experience with these helpful tips
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shoppingTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E53935]/10 to-[#E53935]/20 text-[#E53935]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E53935] mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#E53935] to-[#15314d]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Shop?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Discover thousands of products from trusted sellers worldwide.
              Your next great find is just a click away.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#E53935] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E53935]/30 transition-all duration-200 hover:bg-[#b8862a] hover:shadow-xl hover:gap-3"
            >
              Start Shopping
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
