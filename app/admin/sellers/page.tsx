import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminSellersClient from "@/components/dashboard/admin/AdminSellersClient";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
    include: {
      store: {
        include: {
          _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
          analytics: { select: { totalRevenue: true, totalOrders: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = sellers.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    avatarUrl: s.avatarUrl,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    store: s.store
      ? {
          id: s.store.id,
          storeName: s.store.storeName,
          storeSlug: s.store.storeSlug,
          logoUrl: s.store.logoUrl,
          isVerified: s.store.isVerified,
          isPremium: s.store.isPremium,
          premiumOrder: s.store.premiumOrder,
          country: s.store.country,
          city: s.store.city,
          productCount: s.store._count.sellerProducts,
          totalRevenue: s.store.analytics?.totalRevenue ?? 0,
          totalOrders: s.store.analytics?.totalOrders ?? 0,
          createdAt: s.store.createdAt.toISOString(),
          averageRating: s.store.averageRating,
          totalReviews: s.store.totalReviews,
          ratingOverride: s.store.ratingOverride,
        }
      : null,
  }));

  return (
    <DashboardLayout
      role="ADMIN"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <AdminSellersClient sellers={serialized} />
    </DashboardLayout>
  );
}
