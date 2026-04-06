import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const footerLinks = {
  buyers: [
    { label: "How to Buy", href: "/how-to-buy" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Buyer Protection", href: "/buyer-protection" },
    { label: "Help Center", href: "/help" },
  ],
  sellers: [
    { label: "Register as Seller", href: "/auth/register" },
    { label: "Seller Dashboard", href: "/seller/dashboard" },
    { label: "Seller Guidelines", href: "/seller-guidelines" },
    // { label: "Seller Academy", href: "/seller-academy" },
    { label: "Advertise with Us", href: "/advertise" },
  ],
  company: [
    { label: "About AliExpress", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socials = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter / X" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "YouTube" },
  { Icon: Mail, label: "Newsletter" },
];

const paymentMethods = ["VISA", "MC", "AMEX", "PayPal", "Apple Pay", "GPay"];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-300">
      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold italic text-[#E53935] tracking-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                AliExpress
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Your global marketplace connecting millions of buyers and sellers
              in 190+ countries. Shop smarter, sell globally.
            </p>
            {/* Social Icons */}
            {/* <div className="flex gap-2.5">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-[#C62828] hover:border-[#E53935] transition-all duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div> */}
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-white font-bold mb-5 text-xs tracking-widest uppercase">
              For Buyers
            </h3>
            <ul className="space-y-3">
              {footerLinks.buyers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#E53935] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-white font-bold mb-5 text-xs tracking-widest uppercase">
              For Sellers
            </h3>
            <ul className="space-y-3">
              {footerLinks.sellers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#E53935] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-5 text-xs tracking-widest uppercase">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#E53935] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Strip */}
      <div className="border-t border-white/8">
        <div className="max-w-[1440px] mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Stay in the loop
              </p>
              <p className="text-xs text-gray-500">
                Get exclusive deals and news straight to your inbox.
              </p>
            </div>
            <div className="flex items-stretch gap-0 border border-white/15 rounded-lg overflow-hidden w-full sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent px-4 py-2.5 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none flex-1 sm:w-56"
              />
              <button className="bg-[#E53935] text-white px-5 text-sm font-semibold hover:bg-[#C62828] transition-colors flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/8">
        <div className="max-w-[1440px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} AliExpress Inc. All rights reserved.
          </p>

          {/* Payment Badges */}
          {/* <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs text-gray-500 mr-1">We accept:</span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="text-[10px] font-bold bg-white/8 border border-white/10 text-gray-400 px-2 py-1 rounded"
              >
                {method}
              </span>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
}
