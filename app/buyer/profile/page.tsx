import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import UnderReviewBanner from "@/components/dashboard/shared/UnderReviewBanner";
import UserProfileClient from "@/components/profile/UserProfileClient";

export const metadata = {
  title: "My Profile — MarketHub",
};

export default async function BuyerProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "BUYER") redirect("/seller/profile");

  return (
    <DashboardLayout
      role="BUYER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <UnderReviewBanner status={user.status} role="BUYER" />

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
      />
    </DashboardLayout>
  );
}
