import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminUsersClient from "@/components/dashboard/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "ADMIN") redirect("/");

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  const users = await prisma.user.findMany({
    where: superAdminEmail ? { email: { not: superAdminEmail } } : undefined,
    include: {
      store: {
        select: {
          storeName: true,
          isVerified: true,
          isPremium: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates
  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
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
      <AdminUsersClient initialUsers={serializedUsers} />
    </DashboardLayout>
  );
}
