import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerLoansClient from "@/components/seller/loans/SellerLoansClient";

export default async function SellerLoansPage() {
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
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#E53935]">Business Loans</h1>
                    <p className="text-[#6B7280] mt-1">
                        Request a loan to fund your orders and grow your store
                    </p>
                </div>
                <SellerLoansClient />
            </div>
        </DashboardLayout>
    );
}
