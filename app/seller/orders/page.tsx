import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerOrdersList from "@/components/orders/SellerOrdersList";

export default async function SellerOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      store: {
        select: { id: true, storeName: true, logoUrl: true },
      },
    },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER" || !user.store) redirect("/");

  const orders = await prisma.order.findMany({
    where: { storeId: user.store.id },
    include: {
      items: true,
      buyer: { select: { firstName: true, lastName: true, email: true } },
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
      <SellerOrdersList orders={serialized} />
    </DashboardLayout>
  );
}
