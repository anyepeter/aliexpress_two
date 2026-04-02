import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ loanId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Not an admin" }, { status: 403 });
        }

        const { loanId } = await params;
        const { action, approvedAmount, adminNote } = await req.json();

        const loan = await prisma.loanRequest.findUnique({
            where: { id: loanId },
            include: {
                seller: { select: { id: true, firstName: true } },
                store: { select: { storeName: true } },
            },
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        if (loan.status !== "PENDING") {
            return NextResponse.json({ error: "Loan is not pending" }, { status: 400 });
        }

        if (action === "APPROVE") {
            const finalAmount = approvedAmount ?? loan.amount;
            if (finalAmount <= 0 || finalAmount > loan.amount) {
                return NextResponse.json(
                    { error: "Approved amount must be > 0 and <= requested amount" },
                    { status: 400 }
                );
            }

            const now = new Date();
            const dueDate = new Date(now.getTime() + loan.repaymentDays * 24 * 60 * 60 * 1000);

            const updated = await prisma.loanRequest.update({
                where: { id: loanId },
                data: {
                    status: "APPROVED",
                    approvedAmount: finalAmount,
                    balanceRemaining: finalAmount,
                    approvedAt: now,
                    dueDate,
                    adminNote: adminNote || null,
                },
                include: { transactions: true },
            });

            // Pusher notification
            try {
                await pusherServer.trigger(
                    `private-user-${loan.sellerId}`,
                    "loan-status-update",
                    {
                        loanId: loan.id,
                        status: "APPROVED",
                        approvedAmount: finalAmount,
                        adminNote: adminNote || null,
                    }
                );
            } catch (e) {
                console.error("Pusher error:", e);
            }

            // Send system message in seller↔admin conversation
            try {
                const conversation = await prisma.conversation.findFirst({
                    where: { sellerId: loan.sellerId, adminId: user.id },
                });

                if (conversation) {
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            senderId: user.id,
                            type: "SYSTEM",
                            content: `✅ Your loan request of $${loan.amount.toFixed(2)} has been approved. Approved amount: $${finalAmount.toFixed(2)}. Available in your dashboard.`,
                        },
                    });
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: {
                            lastMessage: `Loan of $${finalAmount.toFixed(2)} approved`,
                            lastMessageAt: new Date(),
                        },
                    });
                }
            } catch (e) {
                console.error("Message error:", e);
            }

            return NextResponse.json(updated);
        }

        if (action === "REJECT") {
            const updated = await prisma.loanRequest.update({
                where: { id: loanId },
                data: {
                    status: "REJECTED",
                    rejectedAt: new Date(),
                    adminNote: adminNote || null,
                },
                include: { transactions: true },
            });

            // Pusher notification
            try {
                await pusherServer.trigger(
                    `private-user-${loan.sellerId}`,
                    "loan-status-update",
                    {
                        loanId: loan.id,
                        status: "REJECTED",
                        adminNote: adminNote || null,
                    }
                );
            } catch (e) {
                console.error("Pusher error:", e);
            }

            // System message
            try {
                const conversation = await prisma.conversation.findFirst({
                    where: { sellerId: loan.sellerId, adminId: user.id },
                });

                if (conversation) {
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            senderId: user.id,
                            type: "SYSTEM",
                            content: `❌ Your loan request has been reviewed. Admin note: ${adminNote || "No additional notes."}`,
                        },
                    });
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: {
                            lastMessage: "Loan request reviewed",
                            lastMessageAt: new Date(),
                        },
                    });
                }
            } catch (e) {
                console.error("Message error:", e);
            }

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("PATCH /api/admin/loans/[loanId] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
