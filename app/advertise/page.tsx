import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Megaphone,
  Search,
  Award,
  Image,
  Target,
  BarChart3,
  Wallet,
  HeadphonesIcon,
  PlusCircle,
  Settings,
  Rocket,
  LineChart,
  ArrowRight,
  Check,
  Globe,
  Users,
  Store,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise with Us | MarketHub Express",
  description:
    "Grow your business with MarketHub Express advertising. Reach millions of active shoppers with sponsored products, featured seller spots, and banner advertising.",
};

export default function AdvertisePage() {
  const adSolutions = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Sponsored Products",
      description:
        "Boost your product visibility by appearing at the top of search results and category pages. Our pay-per-click model means you only pay when shoppers engage with your listing.",
      features: [
        "Top placement in search results",
        "Pay only per click",
        "Keyword targeting",
        "Real-time bid management",
      ],
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Featured Seller Spots",
      description:
        "Get premium placement on the homepage and category pages. Showcase your brand to millions of visitors and establish yourself as a trusted, premium seller on the platform.",
      features: [
        "Homepage spotlight placement",
        "Category page features",
        "Brand logo display",
        "Increased trust signals",
      ],
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Banner Advertising",
      description:
        "Display eye-catching banner ads across the marketplace. Choose from multiple placements and formats to build brand awareness and drive traffic to your store or products.",
      features: [
        "Multiple ad formats",
        "Strategic placements",
        "Custom creative support",
        "Impression-based pricing",
      ],
    },
  ];

  const benefits = [
    {
      icon: <Target className="w-7 h-7" />,
      title: "Targeted Reach",
      description:
        "Reach buyers who are actively searching for products like yours. Our advanced targeting ensures your ads are shown to the most relevant audience, maximizing your conversion potential.",
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Measurable Results",
      description:
        "Track every click, impression, and conversion with our real-time analytics dashboard. Monitor your ROI and optimize campaigns on the fly with detailed performance reports.",
    },
    {
      icon: <Wallet className="w-7 h-7" />,
      title: "Flexible Budget",
      description:
        "Start advertising from as low as $5 per day. Scale your budget up or down at any time with no long-term commitments. You are always in control of your ad spend.",
    },
    {
      icon: <HeadphonesIcon className="w-7 h-7" />,
      title: "Expert Support",
      description:
        "Premium advertisers receive a dedicated account manager who helps optimize campaigns, provides market insights, and ensures you get the maximum return on your investment.",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: <PlusCircle className="w-8 h-8" />,
      title: "Create Campaign",
      description:
        "Choose your ad type, select products or upload creatives, and define your target audience.",
    },
    {
      step: 2,
      icon: <Settings className="w-8 h-8" />,
      title: "Set Budget",
      description:
        "Set your daily budget and bidding strategy. Start small and scale as you see results.",
    },
    {
      step: 3,
      icon: <Rocket className="w-8 h-8" />,
      title: "Launch",
      description:
        "Review and launch your campaign. Your ads go live within minutes of approval.",
    },
    {
      step: 4,
      icon: <LineChart className="w-8 h-8" />,
      title: "Track Results",
      description:
        "Monitor performance in real time. Adjust targeting, budget, and creatives to optimize ROI.",
    },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$5",
      period: "/day",
      description: "Perfect for new sellers testing the waters with advertising.",
      features: [
        "Sponsored product listings",
        "Basic keyword targeting",
        "Standard analytics dashboard",
        "Email support",
        "Up to 10 active campaigns",
      ],
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$25",
      period: "/day",
      description:
        "For growing sellers ready to accelerate their visibility and sales.",
      features: [
        "All Starter features",
        "Featured seller spots",
        "Advanced audience targeting",
        "Priority analytics & reports",
        "Priority email & chat support",
        "Up to 50 active campaigns",
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      price: "$100",
      period: "/day",
      description:
        "Full-service advertising for established brands seeking maximum impact.",
      features: [
        "All Growth features",
        "Banner advertising access",
        "Custom creative support",
        "Dedicated account manager",
        "Advanced ROI analytics",
        "Unlimited active campaigns",
        "Early access to new ad formats",
      ],
      highlighted: false,
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
            <Megaphone className="w-16 h-16 mx-auto mb-6 text-[#E53935]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Grow Your Business with MarketHub Advertising
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Reach millions of active shoppers across the globe. Our
              advertising solutions help you increase visibility, drive sales,
              and build your brand on the largest marketplace platform.
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                {
                  icon: <Users className="w-6 h-6" />,
                  stat: "10M+",
                  label: "Monthly Visitors",
                },
                {
                  icon: <Globe className="w-6 h-6" />,
                  stat: "190+",
                  label: "Countries",
                },
                {
                  icon: <Store className="w-6 h-6" />,
                  stat: "50K+",
                  label: "Active Sellers",
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div className="text-[#E53935] mb-2">{item.icon}</div>
                  <p className="text-3xl md:text-4xl font-bold text-[#E53935]">
                    {item.stat}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advertising Solutions */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Advertising Solutions
          </h2>
          <p className="text-gray-600 mb-10">
            Choose the advertising format that best fits your goals and budget.
            Mix and match solutions for maximum impact.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {adSolutions.map((solution) => (
              <div
                key={solution.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mb-5">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold text-[#E53935] mb-3">
                  {solution.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Check className="w-4 h-4 text-[#E53935] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Why Advertise */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3">
              Why Advertise with MarketHub
            </h2>
            <p className="text-gray-600 mb-10">
              Our platform offers unique advantages that help you get the most
              out of every advertising dollar.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 bg-[#F5F6FA]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#E53935]/10 flex items-center justify-center text-[#E53935] flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#E53935] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            How It Works
          </h2>
          <p className="text-gray-600 mb-10">
            Getting started with MarketHub advertising is simple. Follow these
            four steps to launch your first campaign.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-[#E53935]/30" />
                )}
                <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#E53935] mx-auto mb-4 relative">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#E53935] text-white text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-[#E53935] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3 text-center">
              Pricing Plans
            </h2>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Transparent pricing with no hidden fees. Choose the plan that
              matches your goals and scale up anytime.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl p-8 flex flex-col ${
                    tier.highlighted
                      ? "bg-[#E53935] text-white shadow-xl ring-2 ring-[#E53935] scale-[1.02]"
                      : "bg-[#F5F6FA] border border-gray-100"
                  }`}
                >
                  {tier.highlighted && (
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] mb-2">
                      Most Popular
                    </span>
                  )}
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      tier.highlighted ? "text-white" : "text-[#E53935]"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span
                      className={`text-4xl font-bold ${
                        tier.highlighted ? "text-[#E53935]" : "text-[#E53935]"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`text-sm ${
                        tier.highlighted ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <p
                    className={`text-sm mb-6 ${
                      tier.highlighted ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {tier.description}
                  </p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check
                          className={`w-4 h-4 flex-shrink-0 ${
                            tier.highlighted
                              ? "text-[#E53935]"
                              : "text-[#E53935]"
                          }`}
                        />
                        <span
                          className={
                            tier.highlighted ? "text-gray-200" : "text-gray-700"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact?subject=advertising"
                    className={`text-center py-3 rounded-xl font-semibold transition-colors ${
                      tier.highlighted
                        ? "bg-[#E53935] hover:bg-[#C62828] text-white"
                        : "bg-[#E53935] hover:bg-[#C62828] text-white"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#E53935] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Reach Millions of Shoppers?
            </h2>
            <p className="text-gray-300 mb-8">
              Contact our advertising team to discuss your goals and find the
              perfect campaign strategy for your business. We are here to help
              you succeed.
            </p>
            <Link
              href="/contact?subject=advertising"
              className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
