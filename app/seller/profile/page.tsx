import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import UnderReviewBanner from "@/components/dashboard/shared/UnderReviewBanner";
import UserProfileClient from "@/components/profile/UserProfileClient";

export const metadata = {
  title: "My Profile — MarketHub",
};

export default async function SellerProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      store: {
        select: {
          storeName: true,
          storeSlug: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER") redirect("/buyer/profile");

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
      <UnderReviewBanner status={user.status} role="SELLER" />

      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal information and account settings.
        </p>
      </div>

      <UserProfileClient
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
        }}
        store={user.store ?? null}
      />
    </DashboardLayout>
  );
}
