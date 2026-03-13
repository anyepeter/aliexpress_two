import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://markethubexpress.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MarketHub Express — Global Multi-Vendor Marketplace",
    template: "%s | MarketHub Express",
  },
  description:
    "Shop millions of products from 50,000+ verified sellers in 190+ countries. Electronics, Fashion, Beauty, Home & more — with buyer protection and free shipping on orders over $50.",
  keywords: [
    "online marketplace",
    "multi-vendor marketplace",
    "buy online",
    "sell online",
    "e-commerce",
    "electronics",
    "fashion",
    "beauty products",
    "home goods",
    "global shopping",
    "verified sellers",
    "buyer protection",
    "MarketHub",
    "MarketHub Express",
  ],
  authors: [{ name: "MarketHub Express" }],
  creator: "MarketHub Express",
  publisher: "MarketHub Express Inc.",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "MarketHub Express",
    title: "MarketHub Express — Shop from 50,000+ Verified Sellers Worldwide",
    description:
      "Discover millions of products at unbeatable prices. Trusted by 10M+ customers across 190+ countries. Free shipping, buyer protection & secure checkout.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MarketHub Express — Global Multi-Vendor Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketHub Express — Global Multi-Vendor Marketplace",
    description:
      "Shop millions of products from verified sellers worldwide. Buyer protection, free shipping & secure checkout.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-google-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MarketHub Express",
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  sameAs: [],
  description:
    "Shop millions of products from 50,000+ verified sellers in 190+ countries. Electronics, Fashion, Beauty, Home & more.",
};

const searchJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MarketHub Express",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(searchJsonLd) }}
          />
        </head>
        <body
          className={`${geistSans.variable} antialiased bg-[#F5F6FA] font-sans`}
        >
          {children}
          <CartDrawer />
        </body>
      </html>
    </ClerkProvider>
  );
}
