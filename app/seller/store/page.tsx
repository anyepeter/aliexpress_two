import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerStoreView from "@/components/seller/store/SellerStoreView";
import type { StoreViewData } from "@/components/seller/store/SellerStoreView";
import type { SavedSellerProduct } from "@/lib/types/sellerProduct";

export const metadata: Metadata = {
  title: "My Store — Seller Dashboard",
};

export default async function SellerStorePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/auth/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      store: {
        include: {
          sellerProducts: {
            where: { status: "PUBLISHED" },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!user || user.role !== "SELLER") redirect("/buyer/dashboard");
  if (!user.store) redirect("/seller/dashboard");

  const storeData: StoreViewData = {
    id: user.store.id,
    storeName: user.store.storeName,
    storeSlug: user.store.storeSlug,
    description: user.store.description,
    logoUrl: user.store.logoUrl,
    bannerUrl: user.store.bannerUrl,
    country: user.store.country,
    city: user.store.city,
    isVerified: user.store.isVerified,
    websiteUrl: user.store.websiteUrl,
  };

  const products: SavedSellerProduct[] = user.store.sellerProducts.map((p) => ({
    ...p,
    images: p.images as string[],
    tags: p.tags as string[] | null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const ownerName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        store: { storeName: user.store.storeName, logoUrl: user.store.logoUrl },
      }}
    >
      <SellerStoreView
        store={storeData}
        products={products}
        ownerName={ownerName}
      />
    </DashboardLayout>
  );
}
