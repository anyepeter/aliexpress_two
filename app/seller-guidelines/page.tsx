import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  Camera,
  Tag,
  FolderTree,
  FileText,
  Truck,
  PackageCheck,
  ScanBarcode,
  Box,
  Ban,
  BarChart3,
  Clock,
  Star,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Guidelines & Standards | MarketHub Express",
  description:
    "Learn about the guidelines and standards for selling on MarketHub Express. Understand our requirements for product listings, shipping, and seller performance.",
};

export default function SellerGuidelinesPage() {
  const listingStandards = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Accurate Descriptions & Titles",
      description:
        "Provide clear, truthful product titles and descriptions. Include all relevant specifications, dimensions, materials, and features so buyers can make informed decisions.",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "High-Quality Product Images",
      description:
        "Upload images at minimum 800x800px resolution. White backgrounds are recommended. Show multiple angles and include close-ups of important details.",
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: "Honest Pricing",
      description:
        "Set fair and transparent prices. Do not inflate original prices to create misleading discounts. All fees and charges must be clearly communicated upfront.",
    },
    {
      icon: <FolderTree className="w-6 h-6" />,
      title: "Proper Categorization",
      description:
        "List products in the correct categories and subcategories. Accurate categorization helps buyers find your products and improves your listing performance.",
    },
  ];

  const shippingStandards = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Ship Within 3 Business Days",
      description:
        "All orders must be dispatched within 3 business days of purchase confirmation.",
    },
    {
      icon: <ScanBarcode className="w-5 h-5" />,
      title: "Provide Valid Tracking Numbers",
      description:
        "Every shipment must include a valid, verifiable tracking number shared with the buyer.",
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Use Reliable Shipping Carriers",
      description:
        "Partner with reputable carriers that offer tracking and delivery confirmation.",
    },
    {
      icon: <Box className="w-5 h-5" />,
      title: "Proper Packaging",
      description:
        "Ensure products are securely packaged to prevent damage during transit.",
    },
  ];

  const prohibitedItems = [
    "Counterfeit or replica goods",
    "Weapons and ammunition",
    "Illegal substances and drugs",
    "Stolen property",
    "Hazardous materials",
  ];

  const performanceMetrics = [
    {
      metric: "Order Fulfillment Rate",
      target: "> 95%",
      description: "Percentage of orders shipped on time without cancellation.",
    },
    {
      metric: "Response Time",
      target: "< 24 Hours",
      description: "Average time to respond to buyer inquiries and messages.",
    },
    {
      metric: "Customer Rating",
      target: "> 4.0 / 5.0",
      description: "Overall average rating received from verified buyers.",
    },
    {
      metric: "Dispute Rate",
      target: "< 2%",
      description: "Percentage of orders resulting in disputes or claims.",
    },
  ];

  return (
    <>
      <TopBanner />
      <Navbar />

      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero */}
        <section className="bg-[#E53935] text-white py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-[#E53935]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Seller Guidelines & Standards
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Our guidelines ensure a trusted, high-quality marketplace for
              buyers and sellers alike. Adhering to these standards helps you
              build credibility and grow your business.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-8">
            To begin selling on MarketHub Express, you must meet the following
            requirements:
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <ul className="space-y-4">
              {[
                {
                  label: "Valid Government-Issued ID",
                  detail:
                    "A passport, driver's license, or national ID card for identity verification.",
                },
                {
                  label: "Business Information",
                  detail:
                    "Your business name, address, and registration details (if applicable).",
                },
                {
                  label: "Bank Account",
                  detail:
                    "A verified bank account for receiving payouts and processing refunds.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#E53935] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#E53935]">
                      {item.label}
                    </span>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Product Listing Standards */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Product Listing Standards
          </h2>
          <p className="text-gray-600 mb-8">
            Every listing on MarketHub Express must meet these quality
            standards to ensure a consistent buyer experience.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {listingStandards.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#E53935] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping & Fulfillment */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3">
              Shipping & Fulfillment
            </h2>
            <p className="text-gray-600 mb-8">
              Reliable shipping is critical to customer satisfaction. All
              sellers must comply with these fulfillment standards.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {shippingStandards.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-[#F5F6FA]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#E53935]/10 flex items-center justify-center text-[#E53935] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#E53935] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prohibited Items */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Prohibited Items
          </h2>
          <p className="text-gray-600 mb-8">
            The following items are strictly prohibited on MarketHub Express.
            Listing any of these will result in immediate removal and potential
            account suspension.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8">
            <ul className="space-y-3">
              {prohibitedItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3">
              Performance Metrics
            </h2>
            <p className="text-gray-600 mb-8">
              We continuously monitor seller performance to maintain marketplace
              quality. Here are the key metrics we track:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {performanceMetrics.map((item) => (
                <div
                  key={item.metric}
                  className="p-6 rounded-xl border border-gray-100 bg-[#F5F6FA]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#E53935]">
                      {item.metric}
                    </h3>
                    <span className="text-sm font-bold text-[#E53935] bg-[#E53935]/10 px-3 py-1 rounded-full">
                      {item.target}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Violations & Consequences */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Violations & Consequences
          </h2>
          <p className="text-gray-600 mb-8">
            MarketHub Express takes policy violations seriously. Our enforcement
            process is designed to be fair while protecting the marketplace
            community.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                level: "Warning",
                color: "text-yellow-600",
                bg: "bg-yellow-50 border-yellow-200",
                description:
                  "First-time or minor violations will result in a formal warning. You will be notified and given the opportunity to correct the issue promptly.",
              },
              {
                icon: <Ban className="w-6 h-6" />,
                level: "Account Suspension",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
                description:
                  "Repeated violations or failure to address warnings may lead to a temporary account suspension. During suspension, your listings will be hidden and you cannot process orders.",
              },
              {
                icon: <XCircle className="w-6 h-6" />,
                level: "Permanent Ban",
                color: "text-red-600",
                bg: "bg-red-50 border-red-200",
                description:
                  "Serious violations such as selling counterfeit goods, fraud, or repeated policy breaches will result in a permanent ban from the platform with no option for reinstatement.",
              },
            ].map((item) => (
              <div
                key={item.level}
                className={`flex items-start gap-4 p-6 rounded-xl border ${item.bg}`}
              >
                <div className={`${item.color} flex-shrink-0 mt-0.5`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${item.color} mb-1`}>
                    {item.level}
                  </h3>
                  <p className="text-gray-700 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#E53935] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Sell on MarketHub Express?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of successful sellers and start reaching millions
              of buyers worldwide. Create your account today and set up your
              store in minutes.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Create Your Seller Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
