import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import AdminLoansClient from "@/components/admin/loans/AdminLoansClient";

export default async function AdminLoansPage() {
    const { userId } = await auth();
    if (!userId) redirect("/auth?tab=login");

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) redirect("/auth?tab=login");
    if (user.role !== "ADMIN") redirect("/");

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
            <div className="p-6 min-h-screen bg-[#F5F6FA]">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#E53935]">Loan Management</h1>
                    <p className="text-[#6B7280] mt-1">Review and approve seller loan requests</p>
                </div>
                <AdminLoansClient />
            </div>
        </DashboardLayout>
    );
}
