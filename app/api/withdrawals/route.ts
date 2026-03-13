import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — List withdrawals
// Seller: sees own store withdrawals
// Admin: sees all withdrawals (with optional status filter)
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  if (user.role === "ADMIN") {
    const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          store: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({ withdrawals, total, page, limit });
  }

  if (user.role === "SELLER" && user.store) {
    const where = {
      storeId: user.store.id,
      ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
    };

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    // Also compute balance info
    const [revenueResult, totalWithdrawn] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId: user.store.id, status: "COMPLETED" },
        _sum: { sellerRevenue: true },
      }),
      prisma.withdrawal.aggregate({
        where: { storeId: user.store.id, status: "APPROVED" },
        _sum: { amount: true },
      }),
    ]);

    const totalEarnings = revenueResult._sum.sellerRevenue ?? 0;
    const withdrawn = totalWithdrawn._sum.amount ?? 0;

    // Pending withdrawals lock the balance
    const pendingResult = await prisma.withdrawal.aggregate({
      where: { storeId: user.store.id, status: "PENDING" },
      _sum: { amount: true },
    });
    const pendingAmount = pendingResult._sum.amount ?? 0;

    const availableBalance = totalEarnings - withdrawn - pendingAmount;

    return NextResponse.json({
      withdrawals,
      total,
      page,
      limit,
      balance: {
        totalEarnings,
        withdrawn,
        pendingAmount,
        availableBalance,
      },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — Seller creates a new withdrawal request
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: { select: { id: true } } },
  });

  if (!user || user.role !== "SELLER" || !user.store) {
    return NextResponse.json({ error: "Only sellers can request withdrawals" }, { status: 403 });
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Your account must be active to withdraw" }, { status: 403 });
  }

  const body = await req.json();
  const { amount, method, bankName, accountNumber, accountHolderName, walletAddress, sellerNote } = body;

  const paymentMethod = method === "BITCOIN" ? "BITCOIN" : "BANK_TRANSFER";

  if (!amount) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }

  if (paymentMethod === "BANK_TRANSFER" && (!bankName || !accountNumber || !accountHolderName)) {
    return NextResponse.json(
      { error: "Bank name, account number, and account holder name are required for bank transfers" },
      { status: 400 }
    );
  }

  if (paymentMethod === "BITCOIN" && !walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required for Bitcoin withdrawals" },
      { status: 400 }
    );
  }

  const withdrawAmount = parseFloat(amount);
  if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
    return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
  }

  // Calculate available balance
  const [revenueResult, totalWithdrawnResult, pendingResult] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId: user.store.id, status: "COMPLETED" },
      _sum: { sellerRevenue: true },
    }),
    prisma.withdrawal.aggregate({
      where: { storeId: user.store.id, status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.withdrawal.aggregate({
      where: { storeId: user.store.id, status: "PENDING" },
      _sum: { amount: true },
    }),
  ]);

  const totalEarnings = revenueResult._sum.sellerRevenue ?? 0;
  const withdrawn = totalWithdrawnResult._sum.amount ?? 0;
  const pendingAmount = pendingResult._sum.amount ?? 0;
  const availableBalance = totalEarnings - withdrawn - pendingAmount;

  if (withdrawAmount > availableBalance) {
    return NextResponse.json(
      {
        error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}`,
      },
      { status: 400 }
    );
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      storeId: user.store.id,
      amount: withdrawAmount,
      method: paymentMethod,
      bankName: paymentMethod === "BANK_TRANSFER" ? bankName.trim() : null,
      accountNumber: paymentMethod === "BANK_TRANSFER" ? accountNumber.trim() : null,
      accountHolderName: paymentMethod === "BANK_TRANSFER" ? accountHolderName.trim() : null,
      walletAddress: paymentMethod === "BITCOIN" ? walletAddress.trim() : null,
      sellerNote: sellerNote?.trim() || null,
    },
  });

  return NextResponse.json({ withdrawal }, { status: 201 });
}
