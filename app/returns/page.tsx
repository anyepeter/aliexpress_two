import type { Metadata } from "next";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  RotateCcw,
  Package,
  ClipboardCheck,
  Wallet,
  Gift,
  Leaf,
  Monitor,
  Heart,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds — AliExpress",
  description:
    "Learn about our hassle-free return and refund policy. 30-day returns, easy process, and fast refunds on AliExpress.",
};

const returnSteps = [
  {
    number: 1,
    title: "Initiate Return",
    description:
      "Go to your Orders page, select the item you wish to return, and choose your reason for returning. Our guided process makes it simple.",
    icon: RotateCcw,
  },
  {
    number: 2,
    title: "Ship the Item Back",
    description:
      "Print your prepaid shipping label from the returns dashboard. Pack the item securely in its original packaging and drop it off.",
    icon: Package,
  },
  {
    number: 3,
    title: "Inspection & Approval",
    description:
      "The seller receives and inspects the returned item within 3 business days. You will be notified once the inspection is complete.",
    icon: ClipboardCheck,
  },
  {
    number: 4,
    title: "Get Your Refund",
    description:
      "Once approved, your refund is issued to your original payment method within 5-7 business days. You will receive a confirmation email.",
    icon: Wallet,
  },
];

const refundTimelines = [
  {
    scenario: "Approved Return",
    method: "Original payment method",
    timeline: "5-7 business days",
  },
  {
    scenario: "Defective / Damaged Item",
    method: "Original payment method",
    timeline: "1-3 business days",
  },
  {
    scenario: "Order Never Arrived",
    method: "Original payment method or store credit",
    timeline: "3-5 business days",
  },
  {
    scenario: "Partial Refund (used item)",
    method: "Original payment method",
    timeline: "7-10 business days",
  },
  {
    scenario: "Store Credit Refund",
    method: "AliExpress wallet",
    timeline: "Instant",
  },
];

const nonReturnableItems = [
  {
    icon: Gift,
    title: "Personalized Items",
    description:
      "Custom-made or engraved products tailored to your specifications",
  },
  {
    icon: Leaf,
    title: "Perishable Goods",
    description: "Food, flowers, and other items with a limited shelf life",
  },
  {
    icon: Monitor,
    title: "Digital Products",
    description:
      "Software licenses, e-books, downloadable content, and gift cards",
  },
  {
    icon: Heart,
    title: "Intimate Items",
    description:
      "Undergarments, swimwear, and personal hygiene products for health reasons",
  },
];

const faqs = [
  {
    question: "Can I return an item after 30 days?",
    answer:
      "Our standard return window is 30 days from delivery. After this period, returns are generally not accepted unless the item is defective or covered under warranty. Contact our support team for special circumstances.",
  },
  {
    question: "Who pays for return shipping?",
    answer:
      "If the return is due to a seller error, defective product, or the item does not match the description, return shipping is free. For change-of-mind returns, a small shipping fee may apply depending on the seller policy.",
  },
  {
    question: "Can I exchange an item instead of returning it?",
    answer:
      "Yes, many sellers offer direct exchanges. When initiating your return, select the exchange option if available. You can swap for a different size, color, or variant of the same product at no extra cost.",
  },
  {
    question: "What if my item arrived damaged or defective?",
    answer:
      "Damaged or defective items are eligible for immediate replacement or a full refund. Take photos of the damage and submit them with your return request. These cases are prioritized and typically resolved within 1-3 business days.",
  },
];

export default function ReturnsPage() {
  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#E53935] via-[#22476b] to-[#E53935]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-[#E53935] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-20 w-96 h-96 bg-[#E53935] rounded-full blur-[150px]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <span className="inline-block rounded-full bg-[#E53935]/20 px-4 py-1.5 text-sm font-medium text-[#E53935] mb-6">
              Policy
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Returns &{" "}
              <span className="text-[#E53935]">Refunds</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
              Hassle-free returns and fast refunds. We stand behind every
              purchase and make the return process as simple as possible.
            </p>
          </div>
        </section>

        {/* Return Policy Overview */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E53935]/5 text-[#E53935]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#E53935] sm:text-3xl">
                  Return Policy Overview
                </h2>
                <p className="mt-3 text-gray-500 leading-relaxed">
                  We offer a generous return policy to ensure your complete
                  satisfaction with every purchase on AliExpress.
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F5F6FA] p-5 text-center">
                <Clock className="mx-auto h-8 w-8 text-[#E53935] mb-3" />
                <p className="text-2xl font-bold text-[#E53935]">30 Days</p>
                <p className="mt-1 text-sm text-gray-500">Return window from delivery date</p>
              </div>
              <div className="rounded-xl bg-[#F5F6FA] p-5 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#E53935] mb-3" />
                <p className="text-2xl font-bold text-[#E53935]">Unused</p>
                <p className="mt-1 text-sm text-gray-500">Items must be in original condition</p>
              </div>
              <div className="rounded-xl bg-[#F5F6FA] p-5 text-center">
                <Package className="mx-auto h-8 w-8 text-[#E53935] mb-3" />
                <p className="text-2xl font-bold text-[#E53935]">Original Packaging</p>
                <p className="mt-1 text-sm text-gray-500">Return in the original box and wrapping</p>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Return Process */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#E53935] sm:text-4xl">
              How to Return an Item
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Four simple steps to process your return
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#E53935]/30 hover:-translate-y-1"
                >
                  <div className="absolute -top-4 -left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E53935] text-sm font-bold text-white shadow-lg shadow-[#E53935]/30">
                    {step.number}
                  </div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E53935]/5 text-[#E53935] group-hover:bg-[#C62828]/10 group-hover:text-[#E53935] transition-colors duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E53935] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Refund Timeline */}
        <section className="bg-white border-y border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#E53935]">
                Refund Timeline
              </h2>
              <p className="mt-3 text-gray-500">
                Estimated processing times for different refund scenarios
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <div className="hidden sm:grid sm:grid-cols-3 bg-[#E53935] text-white text-sm font-semibold">
                <div className="px-6 py-4">Scenario</div>
                <div className="px-6 py-4">Refund Method</div>
                <div className="px-6 py-4">Estimated Timeline</div>
              </div>
              {refundTimelines.map((row, index) => (
                <div
                  key={row.scenario}
                  className={`grid sm:grid-cols-3 text-sm ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F5F6FA]"
                  } border-t border-gray-100 first:border-t-0`}
                >
                  <div className="px-6 py-4">
                    <span className="font-medium text-[#E53935] sm:font-normal">
                      <span className="sm:hidden text-xs text-gray-400 block mb-1">Scenario</span>
                      {row.scenario}
                    </span>
                  </div>
                  <div className="px-6 py-4 text-gray-600">
                    <span className="sm:hidden text-xs text-gray-400 block mb-1">Method</span>
                    {row.method}
                  </div>
                  <div className="px-6 py-4">
                    <span className="sm:hidden text-xs text-gray-400 block mb-1">Timeline</span>
                    <span className="inline-flex items-center rounded-full bg-[#E53935]/10 px-3 py-1 text-xs font-medium text-[#E53935]">
                      {row.timeline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Non-Returnable Items */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#E53935] sm:text-4xl">
              Non-Returnable Items
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              The following categories are excluded from our standard return
              policy
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {nonReturnableItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E53935] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Exceptions */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-[#E53935]/20 bg-gradient-to-br from-[#E53935]/5 to-transparent p-8 sm:p-10">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E53935]/10 text-[#E53935]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#E53935]">
                  Exceptions: Damaged or Defective Items
                </h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  If you receive a damaged or defective item, you are entitled
                  to an <strong>immediate replacement</strong> or a{" "}
                  <strong>full refund</strong>, regardless of the product
                  category. Simply photograph the damage, submit your claim
                  through the Orders page, and our team will prioritize your
                  case. These requests are typically resolved within 1-3
                  business days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white border-y border-gray-100">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-[#E53935] sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-gray-500 text-lg">
                Common questions about returns and refunds
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-gray-200 bg-[#F5F6FA] shadow-sm transition-all duration-200 hover:shadow-md [&[open]]:bg-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-[#E53935] font-semibold list-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-5 text-gray-500 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#E53935] to-[#15314d]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Need More Help?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Our support team is available around the clock to assist you with
              returns, refunds, or any other questions.
            </p>
            <Link
              href="/help"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#E53935] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E53935]/30 transition-all duration-200 hover:bg-[#b8862a] hover:shadow-xl hover:gap-3"
            >
              Visit Help Center
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
