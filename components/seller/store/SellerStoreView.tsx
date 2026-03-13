"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink, Camera, Check, X, Loader2,
  MapPin, ShieldCheck, Package, AlertCircle,
} from "lucide-react";
import SellerProductsGrid from "@/components/seller/products/SellerProductsGrid";
import type { SavedSellerProduct } from "@/lib/types/sellerProduct";

export interface StoreViewData {
  id: string;
  storeName: string;
  storeSlug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  country: string;
  city: string;
  isVerified: boolean;
  websiteUrl: string | null;
}

interface Props {
  store: StoreViewData;
  products: SavedSellerProduct[];
  ownerName: string;
}

export default function SellerStoreView({ store: initialStore, products: initialProducts, ownerName }: Props) {
  const router = useRouter();

  // ── Committed store state (what's in DB) ──────────────────────────────────
  const [committed, setCommitted] = useState(initialStore);
  const [products, setProducts] = useState(initialProducts);

  // ── Pending (unsaved) changes ─────────────────────────────────────────────
  const [pendingName, setPendingName] = useState(initialStore.storeName);
  const [pendingDesc, setPendingDesc] = useState(initialStore.description ?? "");
  const [pendingBannerUrl, setPendingBannerUrl] = useState<string | null>(null);
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null);

  // Derived: live preview values
  const displayBanner = pendingBannerUrl ?? committed.bannerUrl;
  const displayLogo = pendingLogoUrl ?? committed.logoUrl;
  const hasChanges =
    pendingName.trim() !== committed.storeName ||
    pendingDesc.trim() !== (committed.description ?? "") ||
    pendingBannerUrl !== null ||
    pendingLogoUrl !== null;

  // ── Upload / save state ───────────────────────────────────────────────────
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const uploadImage = async (file: File, folder: "store-banners" | "store-logos") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
    return (await res.json()).url as string;
  };

  // ── Banner: upload to Cloudinary → preview only (not saved yet) ───────────

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setSaveError(null);
    try {
      const url = await uploadImage(file, "store-banners");
      setPendingBannerUrl(url);       // show preview, mark as unsaved
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Banner upload failed");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  // ── Logo: upload to Cloudinary → preview only (not saved yet) ────────────

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setSaveError(null);
    try {
      const url = await uploadImage(file, "store-logos");
      setPendingLogoUrl(url);         // show preview, mark as unsaved
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // ── Save all pending changes ──────────────────────────────────────────────

  const handleSaveAll = async () => {
    if (!pendingName.trim()) {
      setSaveError("Store name cannot be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updates: Record<string, string | null> = {
        storeName: pendingName.trim(),
        description: pendingDesc.trim() || null,
      };
      if (pendingBannerUrl) updates.bannerUrl = pendingBannerUrl;
      if (pendingLogoUrl) updates.logoUrl = pendingLogoUrl;

      const res = await fetch("/api/seller/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");

      // Commit saved values locally
      setCommitted((s) => ({
        ...s,
        storeName: pendingName.trim(),
        description: pendingDesc.trim() || null,
        bannerUrl: pendingBannerUrl ?? s.bannerUrl,
        logoUrl: pendingLogoUrl ?? s.logoUrl,
      }));
      setPendingBannerUrl(null);
      setPendingLogoUrl(null);

      // Sync server component data in the background
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── Discard all pending changes ───────────────────────────────────────────

  const handleDiscard = () => {
    setPendingName(committed.storeName);
    setPendingDesc(committed.description ?? "");
    setPendingBannerUrl(null);
    setPendingLogoUrl(null);
    setSaveError(null);
  };

  // ── Product delete ────────────────────────────────────────────────────────

  const handleProductDelete = async (id: string) => {
    // Grid already removed the card optimistically; call API to persist
    await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Store</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Update your storefront — images, name, and product pricing.
          </p>
        </div>
        <Link
          href={`/shop/${committed.storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border-2 border-[#E53935] text-[#E53935] text-sm font-semibold rounded-xl hover:bg-[#C62828] hover:text-white transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Store
        </Link>
      </div>

      {/* ── Store visual + edit card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="relative h-44 md:h-52 w-full bg-gradient-to-br from-[#E53935] to-[#1A1A1A]">
          {displayBanner && (
            <Image src={displayBanner} alt="Store banner" fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-black/20" />

          {/* Pending banner badge */}
          {pendingBannerUrl && (
            <span className="absolute top-3 left-3 text-[10px] font-semibold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
              Unsaved preview
            </span>
          )}

          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
          >
            {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {uploadingBanner ? "Uploading…" : "Change Banner"}
          </button>
          <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerChange} />
        </div>

        {/* Logo + info */}
        <div className="px-5">
          <div className="flex items-start gap-4">

            {/* Logo */}
            <div className="relative -mt-10 flex-shrink-0 z-10">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-[#E53935]">
                {displayLogo ? (
                  <Image src={displayLogo} alt={pendingName || committed.storeName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold select-none">
                    {(pendingName || committed.storeName)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {/* Logo camera overlay */}
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors group/logo"
                title="Change logo"
              >
                {uploadingLogo
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white opacity-0 group-hover/logo:opacity-100 transition-opacity drop-shadow" />
                }
              </button>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
              {/* Pending logo dot */}
              {pendingLogoUrl && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" title="Unsaved logo" />
              )}
            </div>

            {/* Editable store info */}
            <div className="flex-1 min-w-0 pt-3 pb-4">
              {/* Store name — always editable */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <input
                  type="text"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  maxLength={60}
                  className="text-xl font-bold text-[#1A1A1A] bg-transparent border-b-2 border-transparent focus:border-[#E53935] focus:outline-none transition-colors w-full max-w-xs"
                  placeholder="Store name"
                />
                {committed.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Description — always editable */}
              <textarea
                value={pendingDesc}
                onChange={(e) => setPendingDesc(e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full text-sm text-gray-500 bg-transparent border border-transparent hover:border-gray-200 focus:border-[#E53935] focus:outline-none rounded-lg px-2 py-1 -mx-2 transition-colors resize-none placeholder:text-gray-300 mb-1"
                placeholder="Add a store description…"
              />
              <p className="text-[10px] text-gray-300 text-right mb-1">{pendingDesc.length}/300</p>

              {/* Location + stats (read-only) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {committed.city}, {committed.country}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </span>
                <span>by {ownerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Unsaved changes bar ─────────────────────────────────────────── */}
        {(hasChanges || saveError) && (
          <div className={`border-t px-5 py-3 flex flex-wrap items-center justify-between gap-3 ${saveError ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
            <p className={`text-xs font-medium flex items-center gap-1.5 ${saveError ? "text-red-600" : "text-amber-700"}`}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {saveError ?? "You have unsaved changes"}
            </p>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleDiscard}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <X className="w-3 h-3" />
                Discard
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || !pendingName.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Published products ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1A1A1A]">Published Products</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Hover a card to edit its profit margin or remove it from your store.
            </p>
          </div>
          <span className="text-sm font-bold text-[#E53935] bg-blue-50 px-2.5 py-0.5 rounded-full">
            {products.length}
          </span>
        </div>

        <div className="p-6">
          {products.length > 0 ? (
            <SellerProductsGrid
              products={products}
              onDelete={handleProductDelete}
            />
          ) : (
            <div className="text-center py-14">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No published products yet.</p>
              <p className="text-gray-300 text-xs mt-1">
                Go to{" "}
                <Link href="/seller/products" className="text-[#E53935] hover:underline underline-offset-2">
                  My Products
                </Link>{" "}
                to add and publish products.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
