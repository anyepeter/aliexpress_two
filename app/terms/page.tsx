import type { Metadata } from "next";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  UserPlus,
  ShoppingCart,
  Store,
  AlertTriangle,
  Copyright,
  CreditCard,
  Scale,
  ShieldAlert,
  XCircle,
  Landmark,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — MarketHub Express",
  description:
    "Read the Terms of Service for MarketHub Express. Understand your rights and responsibilities as a buyer or seller on our marketplace.",
};

const sections = [
  {
    id: "acceptance",
    icon: CheckCircle,
    title: "1. Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement",
        text: 'By accessing or using the MarketHub Express platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. The term "platform" refers to the MarketHub Express website, mobile applications, and all related services.',
      },
      {
        subtitle: "Modifications",
        text: "MarketHub Express reserves the right to modify these terms at any time. Continued use of the platform after any modifications constitutes your acceptance of the revised terms. We will make reasonable efforts to notify users of significant changes.",
      },
    ],
  },
  {
    id: "account-registration",
    icon: UserPlus,
    title: "2. Account Registration",
    content: [
      {
        subtitle: "Age Requirements",
        text: "You must be at least 18 years of age or the age of majority in your jurisdiction to create an account and use MarketHub Express. By registering, you represent and warrant that you meet this requirement.",
      },
      {
        subtitle: "Account Security",
        text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify MarketHub Express of any unauthorized use of your account or any other security breach.",
      },
      {
        subtitle: "Accurate Information",
        text: "You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. MarketHub Express reserves the right to suspend or terminate accounts with inaccurate or incomplete information.",
      },
    ],
  },
  {
    id: "buyer-terms",
    icon: ShoppingCart,
    title: "3. Buyer Terms",
    content: [
      {
        subtitle: "Minimum Purchase Requirement",
        text: "MarketHub Express operates on a bulk-purchase model. All buyers are required to have a minimum of 10 items in their shopping cart before checkout is enabled. This policy applies to every order placed on the platform, regardless of the seller or product category. Items may be sourced from any combination of sellers to meet this requirement.",
      },
      {
        subtitle: "Ordering",
        text: "When you place an order on MarketHub Express (with the required minimum of 10 items), you are making an offer to purchase the products from the respective sellers at the listed prices. The order is confirmed once the seller accepts and processes it. MarketHub Express acts as a marketplace facilitator and is not the seller of the products.",
      },
      {
        subtitle: "Payment",
        text: "All payments must be made through the payment methods accepted on the platform. Prices are displayed in the applicable currency and may be subject to change without prior notice. You agree to pay the full purchase price, including any applicable taxes and shipping fees, at the time of purchase.",
      },
      {
        subtitle: "Shipping & Delivery",
        text: "Shipping times and costs vary by seller and destination. Estimated delivery dates are provided as guidance and are not guaranteed. MarketHub Express is not responsible for shipping delays caused by carriers, customs, or events beyond our control.",
      },
      {
        subtitle: "Taxes",
        text: "You are responsible for any applicable taxes, duties, or customs charges associated with your purchase. Tax amounts may be estimated at checkout and adjusted based on the final shipping destination and applicable regulations.",
      },
    ],
  },
  {
    id: "seller-terms",
    icon: Store,
    title: "4. Seller Terms",
    content: [
      {
        subtitle: "Listing Requirements",
        text: "Sellers must provide accurate, complete, and truthful product descriptions, images, and specifications. All listings must comply with applicable laws and MarketHub Express policies. Misleading or deceptive listings will be removed.",
      },
      {
        subtitle: "Pricing",
        text: "Sellers are solely responsible for setting their product prices. Prices must include all mandatory charges except shipping and applicable taxes. Sellers may not engage in price manipulation, fake discounts, or deceptive pricing practices.",
      },
      {
        subtitle: "Shipping Obligations",
        text: "Sellers must ship orders within the timeframe specified in their listing or store policies. Sellers are responsible for providing valid tracking information, using adequate packaging, and ensuring products arrive in the condition described.",
      },
      {
        subtitle: "Prohibited Items",
        text: "Sellers may not list items that are illegal, counterfeit, hazardous, or otherwise prohibited by MarketHub Express policies. This includes but is not limited to weapons, controlled substances, stolen goods, and items that infringe on intellectual property rights. Violations may result in immediate account termination.",
      },
    ],
  },
  {
    id: "marketplace-conduct",
    icon: AlertTriangle,
    title: "5. Marketplace Conduct",
    content: [
      {
        subtitle: "Prohibited Activities",
        text: "Users may not engage in fraud, harassment, spam, manipulation of reviews or ratings, circumvention of platform fees, unauthorized data scraping, account farming, or any activity that disrupts the platform or harms other users.",
      },
      {
        subtitle: "Content Guidelines",
        text: "All content submitted to the platform, including reviews, messages, and product listings, must be lawful, accurate, and respectful. Users may not post content that is defamatory, obscene, threatening, discriminatory, or that violates the rights of others. MarketHub Express reserves the right to remove content that violates these guidelines.",
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: Copyright,
    title: "6. Intellectual Property",
    content: [
      {
        subtitle: "Platform Content",
        text: "All content on MarketHub Express, including the logo, design, text, graphics, and software, is the property of MarketHub Express or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.",
      },
      {
        subtitle: "User Content",
        text: "By submitting content to the platform, you grant MarketHub Express a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with the operation of the marketplace. You retain ownership of your original content.",
      },
      {
        subtitle: "Infringement Claims",
        text: "MarketHub Express respects intellectual property rights and will respond to valid notices of alleged infringement. If you believe your intellectual property has been infringed upon, please contact us with the relevant details for prompt investigation and action.",
      },
    ],
  },
  {
    id: "payments-fees",
    icon: CreditCard,
    title: "7. Payments & Fees",
    content: [
      {
        subtitle: "Transaction Fees",
        text: "MarketHub Express charges sellers a transaction fee on each completed sale. The current fee schedule is available in the Seller Dashboard and may be updated with reasonable notice. No hidden fees will be applied.",
      },
      {
        subtitle: "Seller Payouts",
        text: "Seller earnings are disbursed according to the payout schedule outlined in the Seller Agreement. Payouts are processed through the payment method configured in the seller's account settings, subject to meeting the minimum payout threshold.",
      },
      {
        subtitle: "Refund Process",
        text: "Refunds are processed in accordance with the seller's return policy and MarketHub Express's Buyer Protection program. Refund timelines depend on the payment method and may take 5-14 business days to appear in the buyer's account. MarketHub Express may mediate refund disputes between buyers and sellers.",
      },
    ],
  },
  {
    id: "dispute-resolution",
    icon: Scale,
    title: "8. Dispute Resolution",
    content: [
      {
        subtitle: "Buyer-Seller Disputes",
        text: "We encourage buyers and sellers to resolve disputes directly through communication. If a resolution cannot be reached, either party may escalate the issue to MarketHub Express for mediation through our Resolution Center.",
      },
      {
        subtitle: "Mediation",
        text: "MarketHub Express offers a mediation service to help resolve disputes fairly. Our team will review the evidence provided by both parties and make a determination. Both parties agree to cooperate in good faith during the mediation process.",
      },
      {
        subtitle: "MarketHub Express's Role",
        text: "As a marketplace facilitator, MarketHub Express may intervene in disputes to protect the integrity of the platform and ensure fair outcomes. Our decisions in dispute resolution are made at our discretion and are guided by our policies and the evidence presented.",
      },
    ],
  },
  {
    id: "limitation-liability",
    icon: ShieldAlert,
    title: "9. Limitation of Liability",
    content: [
      {
        subtitle: "Disclaimer",
        text: 'MarketHub Express provides the platform on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the platform\'s reliability, availability, or fitness for a particular purpose. We do not guarantee uninterrupted or error-free operation.',
      },
      {
        subtitle: "Limitation",
        text: "To the maximum extent permitted by law, MarketHub Express shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the platform, even if we have been advised of the possibility of such damages.",
      },
      {
        subtitle: "Third-Party Products",
        text: "MarketHub Express is not responsible for the quality, safety, legality, or any other aspect of products sold by third-party sellers on the platform. Transactions are between buyers and sellers, and MarketHub Express is not a party to those transactions except as a facilitator.",
      },
    ],
  },
  {
    id: "termination",
    icon: XCircle,
    title: "10. Termination",
    content: [
      {
        subtitle: "By You",
        text: "You may terminate your account at any time by contacting our support team or through your account settings. Termination does not relieve you of any obligations incurred prior to termination, including pending orders and outstanding payments.",
      },
      {
        subtitle: "By MarketHub Express",
        text: "MarketHub Express reserves the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Reasons for termination may include violation of these terms, fraudulent activity, extended inactivity, or any conduct that we determine to be harmful to the platform or its users.",
      },
      {
        subtitle: "Effect of Termination",
        text: "Upon termination, your right to access and use the platform ceases immediately. Any data associated with your account may be deleted after a reasonable retention period, except as required by law. Provisions of these terms that by their nature should survive termination will remain in effect.",
      },
    ],
  },
  {
    id: "governing-law",
    icon: Landmark,
    title: "11. Governing Law",
    content: [
      {
        subtitle: "Jurisdiction",
        text: "These Terms of Service shall be governed by and construed in accordance with the laws of the United States of America, without regard to conflict of law principles. Any legal proceedings arising from these terms shall be filed in the federal or state courts located within the United States.",
      },
      {
        subtitle: "Severability",
        text: "If any provision of these terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision will be modified to the minimum extent necessary to make it valid and enforceable.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "12. Contact Information",
    content: [
      {
        subtitle: "Questions & Concerns",
        text: "If you have any questions or concerns about these Terms of Service, your rights, or your obligations, please reach out to our team. We are here to help.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero Banner */}
        <section className="relative bg-[#E53935] py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(200,149,42,0.1)_25%,rgba(200,149,42,0.1)_50%,transparent_50%,transparent_75%,rgba(200,149,42,0.1)_75%)] bg-[length:40px_40px]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[#E53935]/20 p-4">
              <FileText className="h-10 w-10 text-[#E53935]" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-lg text-white/70">Last updated: March 2026</p>
          </div>
        </section>

        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-[#E53935]/10 bg-white p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-gray-700">
              Welcome to MarketHub Express. These Terms of Service govern your
              access to and use of the MarketHub Express marketplace platform,
              including all associated services, features, and content. By using
              our platform as a buyer, seller, or visitor, you acknowledge that
              you have read, understood, and agree to be bound by these terms.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mx-auto max-w-4xl px-4 pb-8">
          <div className="rounded-2xl border border-[#E53935]/10 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#E53935]">
              Table of Contents
            </h2>
            <nav className="grid gap-2 sm:grid-cols-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-[#F5F6FA] hover:text-[#E53935]"
                >
                  <section.icon className="h-4 w-4 text-[#E53935]" />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Content Sections */}
        <section className="mx-auto max-w-4xl space-y-6 px-4 pb-20">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-[#E53935]/10 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E53935]/5">
                  <section.icon className="h-6 w-6 text-[#E53935]" />
                </div>
                <h2 className="text-2xl font-bold text-[#E53935]">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-5">
                {section.content.map((item, idx) => (
                  <div key={idx} className="pl-16">
                    <h3 className="mb-2 text-base font-semibold text-[#E53935]/80">
                      {item.subtitle}
                    </h3>
                    <p className="leading-relaxed text-gray-600">{item.text}</p>
                  </div>
                ))}
                {section.id === "contact" && (
                  <div className="pl-16">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#E53935] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C62828]"
                    >
                      <Mail className="h-4 w-4" />
                      Contact Our Team
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
