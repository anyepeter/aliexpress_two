import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  GraduationCap,
  Store,
  ListPlus,
  ShoppingBag,
  Search,
  Camera,
  PenLine,
  DollarSign,
  Truck,
  Headphones,
  TrendingUp,
  BarChart3,
  Megaphone,
  Clock,
  Star,
  Zap,
  ArrowRight,
  Quote,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Academy | MarketHub Express",
  description:
    "Learn how to succeed on MarketHub Express with our Seller Academy. Access guides, tips, and strategies to grow your online business.",
};

export default function SellerAcademyPage() {
  const learningPaths = [
    {
      level: "Beginner",
      color: "bg-green-500",
      lightColor: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      icon: <Store className="w-7 h-7" />,
      title: "Foundations",
      topics: [
        "Setting up your store profile and branding",
        "Creating your first product listings",
        "Making your first sale and processing orders",
      ],
      description:
        "Start your selling journey with the essentials. Learn how to set up your store, create compelling listings, and land your first sale on MarketHub Express.",
    },
    {
      level: "Intermediate",
      color: "bg-[#E53935]",
      lightColor: "bg-amber-50 border-amber-200",
      textColor: "text-amber-700",
      icon: <Search className="w-7 h-7" />,
      title: "Growth",
      topics: [
        "Optimizing listings for search and discovery",
        "Product photography tips and best practices",
        "Pricing strategy and competitive analysis",
      ],
      description:
        "Take your store to the next level. Master listing optimization, professional photography, and smart pricing strategies to boost your visibility and sales.",
    },
    {
      level: "Advanced",
      color: "bg-[#E53935]",
      lightColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Mastery",
      topics: [
        "Marketing and promotional campaigns",
        "Analytics and data-driven decisions",
        "Scaling your business and managing inventory",
      ],
      description:
        "Become a top seller. Leverage marketing tools, dive deep into analytics, and implement scaling strategies to maximize your revenue on the platform.",
    },
  ];

  const quickGuides = [
    {
      icon: <Store className="w-6 h-6" />,
      title: "How to Create Your Store",
      description:
        "A step-by-step walkthrough of setting up your seller profile, choosing your store name, and configuring your settings. Get your store live in under 30 minutes.",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Product Photography Tips",
      description:
        "Learn how to take professional product photos with just a smartphone. Covers lighting, backgrounds, angles, and editing for eye-catching listings.",
    },
    {
      icon: <PenLine className="w-6 h-6" />,
      title: "Writing Compelling Descriptions",
      description:
        "Master the art of product copywriting that converts. Learn to highlight features, tell a story, and use keywords that buyers search for.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Pricing Strategy Guide",
      description:
        "Discover proven pricing models to stay competitive while maximizing profit. Learn about psychological pricing, bundling, and dynamic pricing tactics.",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Shipping Best Practices",
      description:
        "Optimize your shipping workflow to reduce costs and delivery times. Covers carrier selection, packaging materials, and international shipping tips.",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Handling Customer Service",
      description:
        "Build customer loyalty through excellent support. Learn how to handle inquiries, resolve disputes, and turn negative experiences into positive reviews.",
    },
  ];

  const successStories = [
    {
      name: "Sarah Mitchell",
      store: "Artisan Home Goods",
      quote:
        "MarketHub Express changed my life. I started selling handmade candles from my kitchen, and within a year I had a full team and a warehouse. The Seller Academy guides on photography and descriptions made all the difference.",
      metric: "From 0 to 2,000+ sales in 12 months",
    },
    {
      name: "David Chen",
      store: "TechGear Solutions",
      quote:
        "The pricing strategy guide alone doubled my margins. I was underpricing everything and competing on the wrong things. Now I focus on value and quality, and my reviews speak for themselves.",
      metric: "4.9-star rating with 5,000+ reviews",
    },
    {
      name: "Amara Okafor",
      store: "Lagos Fashion Co.",
      quote:
        "Selling internationally seemed impossible until I found the shipping best practices guide. Now I ship to over 30 countries, and my brand is recognized globally. MarketHub gave me the tools to dream bigger.",
      metric: "Shipping to 30+ countries worldwide",
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
            <GraduationCap className="w-16 h-16 mx-auto mb-6 text-[#E53935]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              MarketHub Seller Academy
            </h1>
            <p className="text-2xl font-semibold text-[#E53935] mb-4">
              Learn, Grow, Succeed
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Your comprehensive resource for mastering online selling. From
              setting up your first listing to scaling a thriving business, we
              have you covered.
            </p>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            Learning Paths
          </h2>
          <p className="text-gray-600 mb-10">
            Choose a track that matches your experience level and follow a
            structured curriculum to build your selling skills.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <div
                key={path.level}
                className={`rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`${path.color} p-6 text-white flex items-center justify-between`}
                >
                  <div>
                    <span className="text-sm font-medium uppercase tracking-wider opacity-80">
                      {path.level}
                    </span>
                    <h3 className="text-xl font-bold">{path.title}</h3>
                  </div>
                  {path.icon}
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    {path.description}
                  </p>
                  <ul className="space-y-2">
                    {path.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <ChevronRight className="w-4 h-4 text-[#E53935] flex-shrink-0 mt-0.5" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Guides */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3">
              Quick Guides
            </h2>
            <p className="text-gray-600 mb-10">
              Bite-sized guides to help you master specific aspects of selling.
              Each guide is packed with actionable tips you can implement right
              away.
            </p>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
              {quickGuides.map((guide) => (
                <div
                  key={guide.title}
                  className="p-6 rounded-2xl border border-gray-100 bg-[#F5F6FA] hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mb-4 group-hover:bg-[#C62828]/10 group-hover:text-[#E53935] transition-colors">
                    {guide.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#E53935] mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#E53935] mb-3">
            What Top Sellers Do Differently
          </h2>
          <p className="text-gray-600 mb-10">
            We analyzed our highest-performing sellers to identify the habits
            that set them apart. Here is what they consistently do:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="w-8 h-8" />,
                metric: "Respond Within 2 Hours",
                description:
                  "Top sellers reply to customer messages in under 2 hours, building trust and increasing conversion rates significantly.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                metric: "Ship Same Day",
                description:
                  "Orders placed before the cutoff time are shipped the same day, leading to better reviews and repeat customers.",
              },
              {
                icon: <Star className="w-8 h-8" />,
                metric: "4.8+ Average Rating",
                description:
                  "Consistently maintaining a 4.8 or higher rating by delivering quality products and exceptional customer service.",
              },
            ].map((item) => (
              <div
                key={item.metric}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#E53935] mb-2">
                  {item.metric}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seller Success Stories */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] mb-3">
              Seller Success Stories
            </h2>
            <p className="text-gray-600 mb-10">
              Hear from real sellers who transformed their businesses using the
              strategies and tools available on MarketHub Express.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <div
                  key={story.name}
                  className="rounded-2xl border border-gray-100 bg-[#F5F6FA] p-6 flex flex-col"
                >
                  <Quote className="w-8 h-8 text-[#E53935] mb-4" />
                  <p className="text-gray-700 text-sm leading-relaxed italic flex-1 mb-6">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-bold text-[#E53935]">{story.name}</p>
                    <p className="text-sm text-gray-500">{story.store}</p>
                    <p className="text-sm font-semibold text-[#E53935] mt-1">
                      {story.metric}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#E53935] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Selling Today
            </h2>
            <p className="text-gray-300 mb-8">
              Put your knowledge into action. Create your seller account and
              start building a successful business on MarketHub Express. Our
              tools and community are here to support you every step of the way.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Start Selling Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
