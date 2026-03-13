import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get help with your MarketHub Express orders, returns, payments, shipping, and account. Browse FAQs or contact our support team for fast assistance.",
  alternates: { canonical: "https://markethubexpress.com/help" },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
