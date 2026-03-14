import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminPremiumClient from "@/components/dashboard/admin/AdminPremiumClient";

export default async function AdminPremiumPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER", status: "ACTIVE" },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          isPremium: true,
          premiumOrder: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedSellers = sellers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
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
      <AdminPremiumClient initialSellers={serializedSellers} />
    </DashboardLayout>
  );
}
