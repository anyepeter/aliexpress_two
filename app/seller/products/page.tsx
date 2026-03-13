import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import MyProductsWizard from "@/components/seller/products/MyProductsWizard";
import { ExternalLink, RefreshCw, WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "My Products — Seller Dashboard",
};

export default async function SellerProductsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/auth/sign-in");

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        store: {
          include: {
            sellerProducts: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
  } catch (error) {
    console.error("[seller/products] DB error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn&apos;t load your products right now. This is usually a temporary issue with the database connection.
          </p>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E53935] text-white rounded-xl font-semibold text-sm hover:bg-[#C62828] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") redirect("/buyer/dashboard");
  if (!user.store) redirect("/seller/dashboard");

  // Backfill discountPct for existing products that don't have it yet
  const needsBackfill = user.store.sellerProducts.filter((p) => p.discountPct === 0);
  if (needsBackfill.length > 0) {
    try {
      const dummyRes = await fetch(
        `https://dummyjson.com/products?limit=0&select=id,discountPercentage`,
        { next: { revalidate: 3600 } }
      );
      if (dummyRes.ok) {
        const data = (await dummyRes.json()) as {
          products: Array<{ id: number; discountPercentage: number }>;
        };
        const discountMap = new Map(data.products.map((p) => [p.id, p.discountPercentage]));
        await Promise.all(
          needsBackfill
            .filter((p) => (discountMap.get(p.dummyProductId) ?? 0) > 0)
            .map((p) =>
              prisma.sellerProduct.update({
                where: { id: p.id },
                data: { discountPct: discountMap.get(p.dummyProductId)! },
              })
            )
        );
        // Refresh the products in memory
        for (const p of user.store.sellerProducts) {
          const dp = discountMap.get(p.dummyProductId);
          if (dp && dp > 0) p.discountPct = dp;
        }
      }
    } catch {
      // Silent fail — discount will show as 0 until next page load
    }
  }

  const totalCount = user.store.sellerProducts.length;
  const publishedCount = user.store.sellerProducts.filter(
    (p) => p.status === "PUBLISHED"
  ).length;

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        store: user.store
          ? { storeName: user.store.storeName, logoUrl: user.store.logoUrl }
          : null,
      }}
    >
      <div className="px-2 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">My Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add and manage products for your store catalog.
            </p>
          </div>
          <Link
            href={`/shop/${user.store.storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            View My Store
          </Link>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Total Products", value: totalCount, color: "text-[#E53935]" },
            { label: "Published", value: publishedCount, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Add products wizard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-[#1A1A1A]">Add Products</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Browse, select, set margins, and publish products to your store.
            </p>
          </div>
          <MyProductsWizard />
        </div>
      </div>
    </DashboardLayout>
  );
}
