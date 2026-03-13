import type { Metadata } from "next";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Globe,
  ShieldCheck,
  Rocket,
  Users,
  Heart,
  Store,
  Package,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | MarketHub Express",
  description:
    "Learn about MarketHub Express — the global multi-vendor marketplace connecting buyers and sellers across 190+ countries.",
};

const stats = [
  { label: "Countries", value: "190+", icon: MapPin },
  { label: "Sellers", value: "50K+", icon: Store },
  { label: "Products", value: "2M+", icon: Package },
  { label: "Happy Customers", value: "10M+", icon: Users },
];

const values = [
  {
    title: "Trust & Safety",
    description:
      "Every transaction is protected by our buyer and seller guarantee program, ensuring peace of mind for all parties.",
    icon: ShieldCheck,
  },
  {
    title: "Global Reach",
    description:
      "We connect markets across continents, making it easy for anyone to buy or sell products anywhere in the world.",
    icon: Globe,
  },
  {
    title: "Seller Empowerment",
    description:
      "We provide sellers with powerful tools, analytics, and support to grow their businesses and reach new audiences.",
    icon: Rocket,
  },
  {
    title: "Customer First",
    description:
      "From browsing to delivery, every touchpoint is designed to deliver a seamless and satisfying customer experience.",
    icon: Heart,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#E53935] text-white py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Connecting Buyers &amp; Sellers Worldwide
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              MarketHub Express is a global multi-vendor marketplace built to
              make cross-border commerce effortless. We bring together
              thousands of trusted sellers and millions of products so that
              buyers everywhere can discover, compare, and purchase with
              confidence.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-[#E53935] mb-6">
              Our Mission
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              We exist to empower entrepreneurs globally by removing the
              barriers to international trade. For sellers, we provide a
              world-class platform to showcase their products to a massive
              audience. For buyers, we deliver access to quality products at
              competitive prices — all backed by secure payments and reliable
              logistics.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-[#F5F6FA]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E53935]/10 mb-4">
                      <Icon className="w-6 h-6 text-[#E53935]" />
                    </div>
                    <p className="text-3xl font-extrabold text-[#E53935]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[#E53935] mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  MarketHub Express was founded in 2023 with a simple but
                  ambitious idea: bridge the gap between quality sellers and
                  global buyers. We saw that small and mid-size businesses had
                  incredible products but lacked the infrastructure to reach
                  international customers — while buyers around the world were
                  eager for variety, value, and choice.
                </p>
                <p>
                  What started as a lean marketplace with a handful of sellers
                  has grown rapidly into a thriving ecosystem spanning over 190
                  countries. Today, more than 50,000 verified sellers list over
                  2 million products on our platform, serving a community of
                  10 million satisfied customers.
                </p>
                <p>
                  Our growth is fueled by a relentless focus on trust,
                  technology, and the success of our community. We continue to
                  invest in tools that make selling easier and shopping more
                  enjoyable — because when our users thrive, so do we.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-[#F5F6FA]">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] text-center mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E53935]/10 mb-4">
                      <Icon className="w-6 h-6 text-[#E53935]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#E53935] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team / Leadership Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-[#E53935] mb-6">
              Our Team
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Behind MarketHub Express is a diverse, globally distributed team
              of engineers, designers, marketers, and commerce specialists
              united by a shared passion for democratizing trade. Our
              leadership brings decades of combined experience from top
              technology and e-commerce companies, and every team member is
              driven by the belief that opportunity should know no borders. We
              work across time zones and cultures — because the marketplace we
              are building does too.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#E53935] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join the Marketplace?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Whether you are looking to discover products from around the
              world or grow your business by reaching millions of customers,
              MarketHub Express is the platform for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#E53935] hover:bg-[#b3832a] text-white font-semibold text-base transition-colors"
              >
                Start Shopping
              </a>
              <a
                href="/seller/become-seller"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-white/40 hover:border-white text-white font-semibold text-base transition-colors"
              >
                Become a Seller
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
