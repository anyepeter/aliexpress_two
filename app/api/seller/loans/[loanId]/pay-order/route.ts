import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
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
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        // Fetch loan
        const loan = await prisma.loanRequest.findUnique({ where: { id: loanId } });
        if (!loan || loan.storeId !== user.store.id) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }
        if (loan.status !== "APPROVED") {
            return NextResponse.json({ error: "Loan is not active" }, { status: 400 });
        }

        // Fetch order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order || order.storeId !== user.store.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.status !== "PENDING") {
            return NextResponse.json({ error: "Order is not in pending status" }, { status: 400 });
        }

        const deductionAmount = order.baseCost;

        if (loan.balanceRemaining < deductionAmount) {
            return NextResponse.json(
                { error: `Insufficient loan balance. Need $${deductionAmount.toFixed(2)} but only $${loan.balanceRemaining.toFixed(2)} available.` },
                { status: 400 }
            );
        }

        const newBalance = loan.balanceRemaining - deductionAmount;
        const newTotalRepaid = loan.totalRepaid + deductionAmount;
        const newLoanStatus = newBalance === 0 ? "REPAID" : "APPROVED";

        // Atomic transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create LoanTransaction
            await tx.loanTransaction.create({
                data: {
                    loanId: loan.id,
                    orderId: order.id,
                    amountDeducted: deductionAmount,
                    balanceAfter: newBalance,
                },
            });

            // 2. Update LoanRequest
            const updatedLoan = await tx.loanRequest.update({
                where: { id: loan.id },
                data: {
                    balanceRemaining: newBalance,
                    totalRepaid: newTotalRepaid,
                    status: newLoanStatus as "REPAID" | "APPROVED",
                },
            });

            // 3. Update Order status to CONTACTED_ADMIN (seller has funded via loan)
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    status: "CONTACTED_ADMIN",
                    contactedAt: new Date(),
                },
            });

            // 4. Create OrderAnalytics record
            const firstItem = order.items[0];
            await tx.orderAnalytics.create({
                data: {
                    storeId: user.store!.id,
                    orderId: order.id,
                    basePrice: order.baseCost,
                    sellingPrice: order.totalAmount,
                    profit: order.profit,
                    category: firstItem?.title?.split(" ")[0] ?? "General",
                    productTitle: firstItem?.title ?? "Order",
                    completedAt: new Date(),
                },
            });

            return { updatedLoan, updatedOrder };
        });

        return NextResponse.json({
            success: true,
            newBalance: result.updatedLoan.balanceRemaining,
            order: result.updatedOrder,
        });
    } catch (error) {
        console.error("POST /api/seller/loans/[loanId]/pay-order error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
