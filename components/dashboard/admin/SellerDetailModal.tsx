"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  User,
  Mail,
  Phone,
  Store,
  MapPin,
  FileText,
  Shield,
  Calendar,
  Globe,
  Lock,
  ImageIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface SellerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  password: string;
  avatarUrl: string | null;
  createdAt: string;
  store: {
    id: string;
    storeName: string;
    storeSlug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    businessType: string | null;
    businessRegNo: string | null;
    idDocumentUrl: string | null;
    taxDocumentUrl: string | null;
    country: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    websiteUrl: string | null;
    socialLinks: unknown;
    isVerified: boolean;
    adminNotes: string | null;
    approvedAt: string | null;
    approvedBy: string | null;
    createdAt: string;
  } | null;
}

interface Props {
  sellerId: string;
  open: boolean;
  onClose: () => void;
  onApprove?: (sellerId: string) => void;
  onReject?: (sellerId: string) => void;
  showActions?: boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  PENDING_VERIFICATION: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p
          className={`text-sm text-gray-900 mt-0.5 break-all ${
            mono ? "font-mono bg-gray-50 px-2 py-1 rounded text-xs" : ""
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function DocumentViewer({
  url,
  label,
}: {
  url: string | null | undefined;
  label: string;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <AlertTriangle className="w-5 h-5 text-gray-300" />
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#E53935]" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#E53935] font-medium hover:underline"
        >
          Open Full Size <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {isPdf ? (
        <div className="p-6 flex flex-col items-center gap-3 bg-white">
          <FileText className="w-12 h-12 text-red-500" />
          <p className="text-sm text-gray-500">PDF Document</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
          >
            View PDF
          </a>
        </div>
      ) : (
        <div className="relative bg-white p-2">
          <Image
            src={url}
            alt={label}
            width={600}
            height={400}
            className="w-full h-auto max-h-[400px] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

export default function SellerDetailModal({
  sellerId,
  open,
  onClose,
  onApprove,
  onReject,
  showActions = true,
}: Props) {
  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !sellerId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/seller-details?sellerId=${sellerId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load seller details");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, sellerId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E53935] to-[#E53935]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Seller Application Review
              </h2>
              <p className="text-xs text-white/60">
                Review all submitted information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Loading seller details...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center py-16 text-red-500">
              <XCircle className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Seller Identity */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-[#E53935] rounded-full" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Personal Information
                  </h3>
                  <span
                    className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      statusColors[data.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {data.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-4">
                    {data.avatarUrl ? (
                      <Image
                        src={data.avatarUrl}
                        alt={`${data.firstName} ${data.lastName}`}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#E53935] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {data.firstName[0]?.toUpperCase()}
                          {data.lastName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {data.firstName} {data.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{data.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <InfoRow icon={Mail} label="Email" value={data.email} />
                    <InfoRow icon={Phone} label="Phone" value={data.phone} />
                    <InfoRow
                      icon={Lock}
                      label="Password"
                      value={data.password}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Registered"
                      value={new Date(data.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* Store Information */}
              {data.store && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-[#E53935] rounded-full" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Store Information
                    </h3>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    {/* Store logo & banner preview */}
                    {data.store.bannerUrl && (
                      <div className="relative mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={data.store.bannerUrl}
                          alt="Store banner"
                          width={600}
                          height={150}
                          className="w-full h-32 object-cover"
                        />
                        {data.store.logoUrl && (
                          <div className="absolute bottom-0 left-4 translate-y-1/2">
                            <Image
                              src={data.store.logoUrl}
                              alt="Store logo"
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full border-4 border-white object-cover shadow"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {!data.store.bannerUrl && data.store.logoUrl && (
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={data.store.logoUrl}
                          alt="Store logo"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <p className="text-sm text-gray-500">Store Logo</p>
                      </div>
                    )}

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 gap-x-6 ${
                        data.store.bannerUrl && data.store.logoUrl
                          ? "mt-10"
                          : ""
                      }`}
                    >
                      <InfoRow
                        icon={Store}
                        label="Store Name"
                        value={data.store.storeName}
                      />
                      <InfoRow
                        icon={Globe}
                        label="Store Slug"
                        value={`/store/${data.store.storeSlug}`}
                      />
                      <InfoRow
                        icon={FileText}
                        label="Business Type"
                        value={data.store.businessType}
                      />
                      <InfoRow
                        icon={FileText}
                        label="Business Reg No."
                        value={data.store.businessRegNo}
                      />
                      <InfoRow
                        icon={Globe}
                        label="Website"
                        value={data.store.websiteUrl}
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Store Created"
                        value={new Date(
                          data.store.createdAt
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      />
                    </div>

                    {data.store.description && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                          Store Description
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {data.store.description}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Location */}
              {data.store && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-green-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Business Location
                    </h3>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <InfoRow
                        icon={MapPin}
                        label="Country"
                        value={data.store.country}
                      />
                      <InfoRow
                        icon={MapPin}
                        label="City"
                        value={data.store.city}
                      />
                      <InfoRow
                        icon={MapPin}
                        label="State / Province"
                        value={data.store.state}
                      />
                      <InfoRow
                        icon={MapPin}
                        label="Postal Code"
                        value={data.store.postalCode}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Verification Documents */}
              {data.store && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-red-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Verification Documents
                    </h3>
                    <Shield className="w-4 h-4 text-red-500 ml-1" />
                  </div>
                  <div className="space-y-4">
                    <DocumentViewer
                      url={data.store.idDocumentUrl}
                      label="Government-Issued ID (Passport / Driver's License / National ID)"
                    />
                    <DocumentViewer
                      url={data.store.taxDocumentUrl}
                      label="Tax / VAT Registration Certificate"
                    />
                  </div>
                </section>
              )}

              {/* Store Images */}
              {data.store &&
                (data.store.logoUrl || data.store.bannerUrl) && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-purple-500 rounded-full" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Store Branding Images
                      </h3>
                      <ImageIcon className="w-4 h-4 text-purple-500 ml-1" />
                    </div>
                    <div className="space-y-4">
                      {data.store.logoUrl && (
                        <DocumentViewer
                          url={data.store.logoUrl}
                          label="Store Logo"
                        />
                      )}
                      {data.store.bannerUrl && (
                        <DocumentViewer
                          url={data.store.bannerUrl}
                          label="Store Banner"
                        />
                      )}
                    </div>
                  </section>
                )}

              {/* Admin Notes */}
              {data.store?.adminNotes && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-gray-400 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Admin Notes
                    </h3>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      {data.store.adminNotes}
                    </p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {showActions && data && !loading && data.status === "PENDING_APPROVAL" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <p className="text-xs text-gray-400">
              Review all documents before approving
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onReject?.(data.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  onApprove?.(data.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Seller
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
