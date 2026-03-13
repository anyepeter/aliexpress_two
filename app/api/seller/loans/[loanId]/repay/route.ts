import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/server";

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
        const { amount, paymentMethod } = await req.json();

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
        }

        if (!paymentMethod || !["BANK_TRANSFER", "BITCOIN"].includes(paymentMethod)) {
            return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
        }

        const loan = await prisma.loanRequest.findUnique({ where: { id: loanId } });
        if (!loan || loan.storeId !== user.store.id) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }
        if (loan.status !== "APPROVED") {
            return NextResponse.json({ error: "Loan is not active" }, { status: 400 });
        }

        const repayAmount = Math.min(amount, loan.balanceRemaining);
        if (repayAmount <= 0) {
            return NextResponse.json({ error: "Nothing to repay" }, { status: 400 });
        }

        // Check for pending repayment
        const pendingRepayment = await prisma.loanRepayment.findFirst({
            where: { loanId: loan.id, status: "PENDING" },
        });

        if (pendingRepayment) {
            return NextResponse.json(
                { error: "You already have a pending repayment request. Please wait for admin approval." },
                { status: 400 }
            );
        }

        // Create repayment request
        const repayment = await prisma.loanRepayment.create({
            data: {
                loanId: loan.id,
                storeId: user.store.id,
                sellerId: user.id,
                amount: repayAmount,
                paymentMethod: paymentMethod as "BANK_TRANSFER" | "BITCOIN",
                status: "PENDING",
            },
        });

        // Notify admin
        try {
            const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
            if (admin) {
                const conversation = await prisma.conversation.findFirst({
                    where: { sellerId: user.id, adminId: admin.id },
                });

                if (conversation) {
                    const methodText = paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Bitcoin";
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            senderId: user.id,
                            type: "SYSTEM",
                            content: `💰 ${user.firstName} submitted a loan repayment request of $${repayAmount.toFixed(2)} via ${methodText}. Please review and approve.`,
                        },
                    });
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: {
                            lastMessage: `Loan repayment request: $${repayAmount.toFixed(2)}`,
                            lastMessageAt: new Date(),
                        },
                    });
                }

                await pusherServer.trigger(
                    `private-user-${admin.id}`,
                    "loan-repayment-request",
                    { loanId: loan.id, amount: repayAmount, sellerId: user.id, paymentMethod }
                );
            }
        } catch (e) {
            console.error("Notification error:", e);
        }

        return NextResponse.json({
            success: true,
            repayment,
        });
    } catch (error) {
        console.error("POST /api/seller/loans/[loanId]/repay error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
