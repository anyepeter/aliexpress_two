import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH — Admin approves or rejects a withdrawal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, adminNote } = body as { action: "approve" | "reject"; adminNote?: string };

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    include: { store: { select: { id: true, storeName: true } } },
  });

  if (!withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
  }

  if (withdrawal.status !== "PENDING") {
    return NextResponse.json(
      { error: `Withdrawal already ${withdrawal.status.toLowerCase()}` },
      { status: 400 }
    );
  }

  if (action === "approve") {
    // Verify the store still has enough balance
    const [revenueResult, totalWithdrawnResult, pendingResult] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId: withdrawal.storeId, status: "COMPLETED" },
        _sum: { sellerRevenue: true },
      }),
      prisma.withdrawal.aggregate({
        where: { storeId: withdrawal.storeId, status: "APPROVED" },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { storeId: withdrawal.storeId, status: "PENDING", id: { not: withdrawal.id } },
        _sum: { amount: true },
      }),
    ]);

    const totalEarnings = revenueResult._sum.sellerRevenue ?? 0;
    const withdrawn = totalWithdrawnResult._sum.amount ?? 0;
    const otherPending = pendingResult._sum.amount ?? 0;
    const availableBalance = totalEarnings - withdrawn - otherPending;

    if (withdrawal.amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.withdrawal.update({
    where: { id },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      adminNote: adminNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: user.id,
    },
    include: {
      store: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ withdrawal: updated });
}
