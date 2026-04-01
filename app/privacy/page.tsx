import type { Metadata } from "next";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Shield,
  Database,
  Settings,
  Share2,
  Lock,
  Cookie,
  UserCheck,
  Globe,
  Baby,
  RefreshCw,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — AliExpress",
  description:
    "Learn how AliExpress collects, uses, and protects your personal information. Your privacy matters to us.",
};

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you create an account, place an order, or contact us, we may collect your name, email address, phone number, shipping and billing addresses, and payment information. Sellers may also provide business details such as tax identification numbers.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform, including pages visited, products viewed, search queries, device type, browser information, IP address, and referring URLs.",
      },
      {
        subtitle: "Cookies & Similar Technologies",
        text: "We use cookies, web beacons, and similar tracking technologies to recognize your browser, remember your preferences, and understand how you use AliExpress. See Section 5 for more details.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: Settings,
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Order Processing",
        text: "We use your information to process and fulfill orders, manage payments, send order confirmations, and provide shipping updates.",
      },
      {
        subtitle: "Personalization",
        text: "We personalize your shopping experience by recommending products based on your browsing history, purchase patterns, and stated preferences.",
      },
      {
        subtitle: "Communication",
        text: "We may send you transactional emails related to your orders, promotional messages about new products and deals (with your consent), and important platform updates.",
      },
      {
        subtitle: "Security & Fraud Prevention",
        text: "Your data helps us detect and prevent fraudulent transactions, unauthorized access, and other security threats to protect both buyers and sellers.",
      },
    ],
  },
  {
    id: "information-sharing",
    icon: Share2,
    title: "3. Information Sharing",
    content: [
      {
        subtitle: "With Sellers",
        text: "When you place an order, we share necessary information (name, shipping address) with the seller to fulfill your order. Sellers are contractually obligated to protect this information.",
      },
      {
        subtitle: "Payment Processors",
        text: "We share payment information with trusted third-party payment processors (such as Stripe) to securely process transactions. We never store your full credit card details on our servers.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information when required by law, in response to valid legal processes, or to protect the rights, property, or safety of AliExpress, our users, or the public.",
      },
      {
        subtitle: "We Never Sell Your Data",
        text: "AliExpress does not sell, rent, or trade your personal information to third parties for their marketing purposes. Your trust is paramount to our business.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    title: "4. Data Security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data transmitted between your browser and our servers is encrypted using industry-standard TLS/SSL protocols. Sensitive data at rest is encrypted using AES-256 encryption.",
      },
      {
        subtitle: "Secure Payment Processing",
        text: "Payment processing is handled by PCI DSS-compliant providers. Your payment credentials are tokenized and never stored in plain text on our systems.",
      },
      {
        subtitle: "Regular Audits",
        text: "We conduct regular security audits, vulnerability assessments, and penetration testing to identify and address potential security risks. Our team continuously monitors for suspicious activity.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "These cookies are necessary for the platform to function properly. They enable core features like user authentication, shopping cart functionality, and security measures. These cannot be disabled.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "We use analytics cookies to understand how visitors interact with our platform, which pages are most popular, and where users encounter issues. This helps us improve the user experience.",
      },
      {
        subtitle: "Preference Cookies",
        text: "These cookies remember your settings and preferences, such as language, currency, and display preferences, to provide a more personalized experience.",
      },
      {
        subtitle: "Managing Your Preferences",
        text: "You can manage cookie preferences through your browser settings. Most browsers allow you to block or delete cookies. Please note that disabling certain cookies may affect the functionality of the platform.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "6. Your Rights",
    content: [
      {
        subtitle: "Access",
        text: "You have the right to request a copy of the personal information we hold about you. We will provide this information in a commonly used, machine-readable format.",
      },
      {
        subtitle: "Correction",
        text: "You can update or correct your personal information at any time through your account settings, or by contacting our support team.",
      },
      {
        subtitle: "Deletion",
        text: "You may request the deletion of your personal information. We will comply with your request, subject to certain legal obligations that may require us to retain some data.",
      },
      {
        subtitle: "Data Portability",
        text: "You have the right to receive your personal data in a structured, commonly used format and to transmit that data to another service provider where technically feasible.",
      },
    ],
  },
  {
    id: "third-party",
    icon: Globe,
    title: "7. Third-Party Services",
    content: [
      {
        subtitle: "Payment Gateways",
        text: "We integrate with third-party payment gateways such as Stripe to process transactions securely. These providers have their own privacy policies governing how they handle your data.",
      },
      {
        subtitle: "Analytics Providers",
        text: "We use analytics services to help us understand platform usage and improve our services. These services may collect anonymized usage data in accordance with their own privacy policies.",
      },
      {
        subtitle: "Cloudinary (Image Hosting)",
        text: "Product images and user-uploaded media are stored and served through Cloudinary. Cloudinary processes images on our behalf and is bound by our data processing agreements.",
      },
    ],
  },
  {
    id: "children",
    icon: Baby,
    title: "8. Children's Privacy",
    content: [
      {
        subtitle: "Age Restriction",
        text: "AliExpress is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete that information promptly.",
      },
      {
        subtitle: "Parental Notice",
        text: "If you are a parent or guardian and believe your child has provided personal information to us, please contact us immediately so we can take appropriate action.",
      },
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "Policy Updates",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on this page and updating the \"Last updated\" date.",
      },
      {
        subtitle: "Notification",
        text: "For significant changes, we will provide additional notice via email or a prominent announcement on our platform. We encourage you to review this policy periodically to stay informed about how we protect your data.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "10. Contact Us",
    content: [
      {
        subtitle: "Get in Touch",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please don't hesitate to reach out to our team.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
              <Shield className="h-10 w-10 text-[#E53935]" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-white/70">Last updated: March 2026</p>
          </div>
        </section>

        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-[#E53935]/10 bg-white p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-gray-700">
              At AliExpress, your privacy is critically important to us.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our marketplace platform,
              make purchases, or interact with our services. Please read this
              policy carefully to understand our practices regarding your
              personal data.
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
                      Contact Our Privacy Team
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
