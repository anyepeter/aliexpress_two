import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminVisitorsClient from "@/components/dashboard/admin/AdminVisitorsClient";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  // Fetch all active sellers with stores and analytics
  const sellers = await prisma.user.findMany({
    where: { role: "SELLER", status: "ACTIVE" },
    include: {
      store: {
        include: {
          analytics: { select: { totalViews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = sellers
    .filter((s) => s.store)
    .map((s) => ({
      sellerId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      avatarUrl: s.avatarUrl,
      storeId: s.store!.id,
      storeName: s.store!.storeName,
      storeSlug: s.store!.storeSlug,
      logoUrl: s.store!.logoUrl,
      totalViews: s.store!.analytics?.totalViews ?? 0,
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
      <AdminVisitorsClient stores={serialized} />
    </DashboardLayout>
  );
}
