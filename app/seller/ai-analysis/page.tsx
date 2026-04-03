import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AiAnalysisClient from "@/components/seller/ai-analysis/AiAnalysisClient";

export default async function AiAnalysisPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { store: { select: { id: true, storeName: true, logoUrl: true } } },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER" || !user.store) redirect("/");

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <AiAnalysisClient />
    </DashboardLayout>
  );
}
