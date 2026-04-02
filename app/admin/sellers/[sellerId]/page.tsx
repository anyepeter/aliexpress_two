import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerDetailPage from "@/components/dashboard/admin/SellerDetailPage";

interface PageProps {
  params: Promise<{ sellerId: string }>;
}

export default async function AdminSellerDetailPage({ params }: PageProps) {
  const { sellerId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

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
      <SellerDetailPage sellerId={sellerId} />
    </DashboardLayout>
  );
}
