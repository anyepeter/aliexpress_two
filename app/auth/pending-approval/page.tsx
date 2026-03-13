import Link from "next/link";
import { Store, Clock, Mail, CheckCircle2, Circle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Application Under Review — MarketHub",
};

const TIMELINE = [
  {
    label: "Application submitted",
    desc: "Your seller application has been received",
    done: true,
  },
  {
    label: "Document verification",
    desc: "Our team is reviewing your ID and business documents",
    done: false,
    active: true,
  },
  {
    label: "Store setup review",
    desc: "We verify your store information and policies",
    done: false,
  },
  {
    label: "Approval & activation",
    desc: "Your store goes live and you can start listing products",
    done: false,
  },
];

const FAQS = [
  {
    q: "How long does the review process take?",
    a: "Most applications are reviewed within 2–3 business days. Complex business registrations may take up to 5 business days. You'll receive an email at each stage.",
  },
  {
    q: "What happens if my application is rejected?",
    a: "If your application is rejected, you'll receive a detailed email explaining the reason and steps you can take to reapply. Common reasons include unreadable documents or incomplete store information.",
  },
  {
    q: "Can I edit my application while it's under review?",
    a: "Once submitted, applications cannot be edited. If you need to make changes, please contact our seller support team and we can assist you.",
  },
  {
    q: "What documents are required?",
    a: "We require a government-issued ID (passport, driver's license, or national ID card). For business accounts, a business registration certificate is also recommended.",
  },
  {
    q: "Will I be notified of the decision?",
    a: "Yes, you'll receive an email notification when your application is approved or if additional information is needed. You can also check this page for real-time status updates.",
  },
];

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Store className="w-7 h-7 text-[#E53935]" />
          <span className="text-xl font-extrabold text-[#E53935]">
            Market<span className="text-[#E53935]">Hub</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto mb-5 w-20 h-20 bg-[#E53935]/10 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-[#E53935]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Application Under Review
            </h1>
            <p className="text-gray-500 mb-6">
              Thank you for applying to become a MarketHub seller! Our team is
              carefully reviewing your application and documents. You&apos;ll
              receive an email update within 2–3 business days.
            </p>

            <div className="inline-flex items-center gap-2 bg-[#E53935]/10 text-[#E53935] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Mail className="w-4 h-4" />
              Check your email for updates
            </div>

            {/* Timeline */}
            <div className="text-left space-y-1 mt-6">
              {TIMELINE.map((step, i) => (
                <div key={i} className="flex gap-4">
                  {/* Icon column */}
                  <div className="flex flex-col items-center">
                    <div className="mt-1">
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : step.active ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#E53935] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 my-1 ${
                          step.done ? "bg-green-300" : "bg-gray-200"
                        }`}
                        style={{ minHeight: "24px" }}
                      />
                    )}
                  </div>

                  {/* Text column */}
                  <div className="pb-4">
                    <p
                      className={`text-sm font-semibold ${
                        step.active
                          ? "text-[#E53935]"
                          : step.done
                          ? "text-green-700"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-1">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-gray-100 rounded-lg px-4"
                >
                  <AccordionTrigger className="text-sm font-medium text-gray-700 hover:text-[#E53935] text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-500 pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact support */}
          <div className="text-center text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:seller-support@markethub.com"
              className="text-[#E53935] font-semibold hover:text-[#E53935] transition-colors"
            >
              Contact seller support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
