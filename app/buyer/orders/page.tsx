import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import BuyerOrdersList from "@/components/orders/BuyerOrdersList";

export default async function BuyerOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "BUYER") redirect("/");

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
      items: true,
      store: {
        select: { storeName: true, storeSlug: true, logoUrl: true, isVerified: true },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates
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
      role="BUYER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <BuyerOrdersList orders={serialized} />
    </DashboardLayout>
  );
}
