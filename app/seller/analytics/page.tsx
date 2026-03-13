import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AnalyticsClient from "@/components/seller/analytics/AnalyticsClient";
import { Loader2 } from "lucide-react";

export default async function SellerAnalyticsPage() {
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
                store: user.store
                    ? { storeName: user.store.storeName, logoUrl: user.store.logoUrl }
                    : null,
            }}
        >
            <div className="p-6 min-h-screen bg-[#F5F6FA]">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
                    </div>
                }>
                    <AnalyticsClient />
                </Suspense>
            </div>
        </DashboardLayout>
    );
}
