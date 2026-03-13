"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  MessageSquare,
  Globe,
  Lock,
} from "lucide-react";
import MessageButton from "@/components/messages/MessageButton";
import type { StoreInfo } from "@/lib/types/marketplace";

interface StoreInfoCardProps {
  store: StoreInfo;
}

function SocialIcon({ platform }: { platform: string }) {
  const size = "w-4 h-4";
  switch (platform.toLowerCase()) {
    case "instagram":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "twitter":
    case "x":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return <Globe className={size} />;
  }
}

export default function StoreInfoCard({ store }: StoreInfoCardProps) {
  const { isSignedIn, isLoaded } = useUser();

  const hasContact =
    store.ownerEmail || store.ownerPhone || store.socialLinks;
  const hasLocation = store.city || store.country;

  // Clean phone for WhatsApp link (remove spaces, dashes, etc.)
  const cleanPhone = store.ownerPhone
    ? store.ownerPhone.replace(/[^+\d]/g, "")
    : null;

  const socialEntries = store.socialLinks
    ? Object.entries(store.socialLinks).filter(
      ([, url]) => url && url.trim() !== ""
    )
    : [];

  const showContact = isLoaded && isSignedIn;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-r from-[#E53935] to-[#2a5c8e]">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt={`${store.storeName} banner`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
      </div>

      {/* Store info — always visible */}
      <div className="p-4 flex items-start gap-3 bg-white">
        {/* Logo */}
        <div className="relative -mt-8 flex-shrink-0">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.storeName}
              width={52}
              height={52}
              className="rounded-full object-cover ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-[#E53935] flex items-center justify-center ring-2 ring-white shadow">
              <span className="text-white text-xl font-bold">
                {store.storeName[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + verified + description + Visit Store */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#1A1A1A] truncate">
              {store.storeName}
            </h3>
            {store.isVerified && (
              <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 rounded-full px-2 py-0.5 flex-shrink-0">
                ✓ Verified
              </span>
            )}
          </div>

          {store.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {store.description}
            </p>
          )}

          <Link
            href={`/store/${store.storeSlug}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#E53935] hover:text-[#E53935] transition-colors"
          >
            Visit Store <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Contact & Location Section ─────────────────────── */}
      {(hasContact || hasLocation) && (
        <div className="border-t border-gray-100 bg-[#FAFBFD] px-4 py-3 space-y-2.5">
          {showContact ? (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Contact Seller
              </p>

              {/* Location */}
              {hasLocation && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-[#E53935] flex-shrink-0" />
                  <span>
                    {[store.city, store.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}


              {/* In-app Message Seller */}
              {store.userId && (
                <MessageButton
                  targetUserId={store.userId}
                  subject={`Question about store: ${store.storeName}`}
                  label="Message Seller"
                  variant="primary"
                />
              )}

              {/* Social links */}
              {socialEntries.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {socialEntries.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C62828] text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label={platform}
                    >
                      <SocialIcon platform={platform} />
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Not signed in — prompt to register */
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Register to contact this seller</span>
              </div>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
