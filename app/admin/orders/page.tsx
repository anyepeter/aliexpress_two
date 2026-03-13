import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminOrdersList from "@/components/orders/AdminOrdersList";

export default async function AdminOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    include: {
      items: true,
      buyer: { select: { firstName: true, lastName: true, email: true } },
      store: {
        select: { storeName: true, storeSlug: true, logoUrl: true, isVerified: true },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    contactedAt: o.contactedAt?.toISOString() ?? null,
    shippingAt: o.shippingAt?.toISOString() ?? null,
    completedAt: o.completedAt?.toISOString() ?? null,
    rejectedAt: o.rejectedAt?.toISOString() ?? null,
    address: { ...o.address, createdAt: o.address.createdAt.toISOString() },
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
      <AdminOrdersList orders={serialized} />
    </DashboardLayout>
  );
}
