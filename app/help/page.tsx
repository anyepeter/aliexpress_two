"use client";

import { useState } from "react";
import Link from "next/link";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search,
  Package,
  RotateCcw,
  CreditCard,
  Truck,
  Settings,
  Store,
  ChevronDown,
  Mail,
  MessageSquare,
  Clock,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  id: string;
  items: FAQItem[];
}

const quickLinks = [
  {
    icon: Package,
    title: "My Orders",
    description: "Track, manage, and review your orders",
    href: "/orders",
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    description: "Start a return or check refund status",
    href: "#returns-refunds",
  },
  {
    icon: CreditCard,
    title: "Payment Issues",
    description: "Resolve payment and billing problems",
    href: "#payments",
  },
  {
    icon: Truck,
    title: "Shipping Info",
    description: "Delivery times, tracking, and more",
    href: "#orders-shipping",
  },
  {
    icon: Settings,
    title: "Account Settings",
    description: "Update your profile and preferences",
    href: "#account",
  },
  {
    icon: Store,
    title: "Seller Support",
    description: "Help for sellers on the platform",
    href: "/seller",
  },
];

const faqCategories: FAQCategory[] = [
  {
    title: "Orders & Shipping",
    id: "orders-shipping",
    items: [
      {
        question: "How do I track my order?",
        answer:
          "You can track your order by going to My Orders in your account dashboard. Click on the order you want to track and you will see real-time shipping updates, including the tracking number and estimated delivery date. You will also receive email notifications at each stage of the delivery process.",
      },
      {
        question: "What are the typical shipping times?",
        answer:
          "Shipping times vary depending on the seller location and shipping method selected. Standard shipping typically takes 7-15 business days, while express shipping takes 3-7 business days. Domestic orders usually arrive within 3-5 business days. You can see the estimated delivery date on each product page before placing your order.",
      },
      {
        question: "Do you offer international shipping?",
        answer:
          "Yes, AliExpress supports international shipping to over 200 countries and territories. Shipping costs and delivery times vary by destination. Please note that international orders may be subject to customs duties and import taxes, which are the responsibility of the buyer. You can see available shipping options at checkout.",
      },
      {
        question: "Can I change or cancel my order?",
        answer:
          "You can cancel or modify your order within 24 hours of placing it, provided it has not yet been shipped. Go to My Orders, find the order, and click Cancel Order or Modify Order. If the order has already been shipped, you will need to wait for delivery and then initiate a return. Contact our support team if you need urgent assistance.",
      },
    ],
  },
  {
    title: "Payments",
    id: "payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept a wide range of payment methods including Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. In select regions, we also support local payment methods such as bank transfers and digital wallets. All payment methods are processed through our secure payment gateway.",
      },
      {
        question: "How secure are my payments?",
        answer:
          "Your payment security is our top priority. We use 256-bit SSL encryption for all transactions and are fully PCI DSS compliant. Your credit card information is never stored on our servers or shared with sellers. We also offer fraud detection and prevention systems to protect your account from unauthorized transactions.",
      },
      {
        question: "How does currency conversion work?",
        answer:
          "Prices are displayed in your local currency based on your location settings. Currency conversion is handled automatically at checkout using real-time exchange rates. A small conversion fee (typically 1-3%) may be applied by your payment provider. You can change your preferred currency in your account settings.",
      },
      {
        question: "What should I do if my payment failed?",
        answer:
          "If your payment failed, first verify that your card details are correct and that you have sufficient funds. Try a different payment method if the issue persists. Common reasons for failed payments include incorrect CVV, expired cards, or bank security blocks. Contact your bank to authorize the transaction, or reach out to our support team for further assistance.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    id: "returns-refunds",
    items: [
      {
        question: "How do I return an item?",
        answer:
          "To initiate a return, go to My Orders, select the order containing the item you want to return, and click Return Item. Select your reason for the return, upload photos if applicable, and submit your request. The seller will review your request within 2-3 business days. Once approved, you will receive a return shipping label and instructions.",
      },
      {
        question: "How long does a refund take?",
        answer:
          "Once your return is received and inspected by the seller, your refund will be processed within 3-5 business days. The refund will be credited to your original payment method. Credit card refunds may take an additional 5-10 business days to appear on your statement, depending on your bank. PayPal refunds are typically faster.",
      },
      {
        question: "Are there items that cannot be returned?",
        answer:
          "Certain items are not eligible for return, including perishable goods, personalized or custom-made products, intimate apparel, digital downloads, and items marked as final sale. Additionally, items must be in their original condition with tags attached. Check the product listing for specific return policy details before purchasing.",
      },
      {
        question: "What if I received a damaged item?",
        answer:
          "If you received a damaged item, take photos of the damage immediately and open a dispute within 15 days of delivery. Go to My Orders, select the order, and click Report a Problem. Upload your photos as evidence. Damaged items are fully covered under our Buyer Protection program, and you are eligible for a full refund or replacement.",
      },
    ],
  },
  {
    title: "Account",
    id: "account",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Creating an account is quick and easy. Click the Sign Up button at the top of the page and enter your email address, create a password, and fill in your basic details. You can also sign up using your Google or Facebook account for faster registration. Once registered, you can start shopping immediately.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "To reset your password, click the Sign In button, then select Forgot Password. Enter the email address associated with your account, and we will send you a password reset link. The link is valid for 24 hours. If you do not receive the email, check your spam folder or contact our support team for assistance.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account by going to Account Settings and selecting Delete Account. Please note that this action is permanent and cannot be undone. All your order history, saved items, and personal data will be removed. Make sure to complete any pending orders or disputes before deleting your account.",
      },
      {
        question: "How do I update my personal information?",
        answer:
          "To update your personal information, go to Account Settings in your dashboard. You can update your name, email address, phone number, shipping addresses, and payment methods. Changes are saved automatically. For security reasons, changing your email address requires verification through your current email.",
      },
    ],
  },
];

function AccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors duration-150"
      >
        <span className="font-semibold text-[#E53935] pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#E53935] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          searchQuery === "" ||
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="min-h-screen bg-[#F5F6FA]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#E53935] via-[#E53935] to-[#0f2740] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-80 h-80 bg-[#E53935] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#E53935] rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <HelpCircle className="w-5 h-5 text-[#E53935]" />
              <span className="text-white/90 text-sm font-medium tracking-wide">
                Help Center
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              How Can We <span className="text-[#E53935]">Help</span>?
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
              Search our knowledge base or browse the categories below to find
              the answers you need.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help topics..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-lg shadow-xl shadow-black/10 focus:outline-none focus:ring-2 focus:ring-[#E53935] border-0"
              />
            </div>
          </div>
        </section>

        {/* Quick Links Grid */}
        {!searchQuery && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-[#E53935]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#C62828] transition-colors duration-300">
                    <link.icon className="w-6 h-6 text-[#E53935] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#E53935] mb-1 group-hover:text-[#E53935] transition-colors duration-200">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Sections */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#E53935] mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try different keywords or browse the categories below.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-[#E53935] font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {filteredCategories.map((category) => (
            <div key={category.id} id={category.id} className="mb-12">
              <h2 className="text-2xl font-bold text-[#E53935] mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#E53935] rounded-full" />
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Still Need Help? */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#E53935] mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Our support team is here for you. Choose the option that works
                best.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Email Support */}
              <div className="bg-[#F5F6FA] rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-8 h-8 text-[#E53935]" />
                </div>
                <h3 className="text-xl font-bold text-[#E53935] mb-2">
                  Email Support
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Send us a detailed message and we will get back to you as soon
                  as possible.
                </p>
                <a
                  href="mailto:support@aliexpressexpress.com"
                  className="inline-flex items-center gap-2 text-[#E53935] font-semibold hover:underline"
                >
                  support@aliexpressexpress.com
                </a>
              </div>
              {/* Contact Page */}
              <div className="bg-[#F5F6FA] rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-8 h-8 text-[#E53935]" />
                </div>
                <h3 className="text-xl font-bold text-[#E53935] mb-2">
                  Contact Us
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Visit our contact page to submit a support request with all
                  the details.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#15334f] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
                >
                  Contact Page
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Support Promise */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-[#E53935]/10 rounded-full px-6 py-3">
                <Clock className="w-5 h-5 text-[#E53935]" />
                <span className="text-[#E53935] font-medium">
                  We typically respond within 24 hours
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
