"use client";

import { useState } from "react";
import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Mail,
  Clock,
  Timer,
  MapPin,
  ChevronDown,
  Send,
} from "lucide-react";

const contactCards = [
  {
    icon: Mail,
    title: "Email",
    detail: "support@aliexpressexpress.com",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Mon - Fri, 9:00 AM - 6:00 PM EST",
  },
  {
    icon: Timer,
    title: "Response Time",
    detail: "Within 24 hours",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    detail: "Singapore",
  },
];

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "Once your order has been shipped, you will receive a tracking number via email. You can also view your order status anytime by visiting the Orders section in your buyer dashboard.",
  },
  {
    question: "What is the return and refund policy?",
    answer:
      "We offer a 30-day return window on most products. If you receive a damaged or incorrect item, you can initiate a return request from your order details page. Refunds are typically processed within 5-7 business days after the return is approved.",
  },
  {
    question: "How do I become a seller on AliExpress?",
    answer:
      'Getting started is easy. Click on "Become a Seller" in the navigation menu, fill out the registration form with your business details, and submit for review. Our team typically approves verified sellers within 48 hours.',
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Absolutely. AliExpress uses industry-standard SSL encryption and partners with trusted payment processors to ensure all transactions are fully secure. We never store your full card details on our servers.",
  },
];

const subjectOptions = [
  "General Inquiry",
  "Order Issue",
  "Seller Support",
  "Technical Problem",
  "Partnership Opportunity",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would call an API
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <TopBanner />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#E53935] text-white py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Have a question, feedback, or need help with an order? Our
              support team is here to assist you.
            </p>
          </div>
        </section>

        {/* Contact Form + Info */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Left — Form (3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-[#E53935] mb-6">
                  Send Us a Message
                </h2>

                {submitted && (
                  <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                    Thank you for reaching out! We will get back to you within
                    24 hours.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] transition"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] transition appearance-none bg-white"
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] transition resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E53935] hover:bg-[#b3832a] text-white font-semibold text-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              </div>

              {/* Right — Contact Info Cards (2 cols) */}
              <div className="lg:col-span-2 space-y-5">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#E53935]/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#E53935]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {card.title}
                        </p>
                        <p className="text-base font-semibold text-[#E53935] mt-0.5">
                          {card.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#E53935] text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-[#F5F6FA] rounded-xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="text-base font-semibold text-[#E53935]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#E53935] flex-shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
