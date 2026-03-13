import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ loanId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { store: { select: { id: true } } },
        });

        if (!user || user.role !== "SELLER" || !user.store) {
            return NextResponse.json({ error: "Not a seller" }, { status: 403 });
        }

        const { loanId } = await params;

        const loan = await prisma.loanRequest.findUnique({
            where: { id: loanId },
            include: { transactions: { orderBy: { createdAt: "desc" } } },
        });

        if (!loan || loan.storeId !== user.store.id) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json(loan);
    } catch (error) {
        console.error("GET /api/seller/loans/[loanId] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ loanId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { store: { select: { id: true } } },
        });

        if (!user || user.role !== "SELLER" || !user.store) {
            return NextResponse.json({ error: "Not a seller" }, { status: 403 });
        }

        const { loanId } = await params;

        const loan = await prisma.loanRequest.findUnique({
            where: { id: loanId },
        });

        if (!loan || loan.storeId !== user.store.id) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        if (loan.status !== "PENDING") {
            return NextResponse.json(
                { error: "Only pending loans can be cancelled" },
                { status: 400 }
            );
        }

        const updated = await prisma.loanRequest.update({
            where: { id: loanId },
            data: { status: "CANCELLED" },
            include: { transactions: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("DELETE /api/seller/loans/[loanId] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
