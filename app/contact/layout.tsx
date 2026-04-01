import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with AliExpress support. Reach us for order issues, seller inquiries, partnerships, or general questions. We respond within 24 hours.",
  alternates: { canonical: "https://aliexpressexpress.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
