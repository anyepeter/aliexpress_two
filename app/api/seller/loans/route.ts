import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getLoanSettings() {
  const settings = await prisma.loanSettings.findUnique({ where: { id: "default" } });
  return settings ?? {
    dailyInterestRate: 0.003,
    maxRepaymentDays: 7,
    minRevenue: 30000,
    minCompletedOrders: 5,
    minLoanAmount: 100,
    maxLoanAmount: 10000,
  };
}

// Helper: calculate accumulated interest for a loan
function calculateInterest(loan: { approvedAmount: number | null; dailyInterestRate: number; approvedAt: Date | null; dueDate: Date | null }) {
  if (!loan.approvedAmount || !loan.approvedAt) return 0;
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - loan.approvedAt.getTime()) / (1000 * 60 * 60 * 24)));
  return parseFloat((loan.approvedAmount * loan.dailyInterestRate * daysElapsed).toFixed(2));
}

export async function GET() {
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

    const [loans, settings] = await Promise.all([
      prisma.loanRequest.findMany({
        where: { storeId: user.store.id },
        include: { transactions: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      }),
      getLoanSettings(),
    ]);

    // Check eligibility
    const [completedOrders, storeAnalytics] = await Promise.all([
      prisma.order.count({ where: { storeId: user.store.id, status: "COMPLETED" } }),
      prisma.storeAnalytics.findUnique({ where: { storeId: user.store.id }, select: { totalRevenue: true } }),
    ]);

    const totalRevenue = storeAnalytics?.totalRevenue ?? 0;
    const isEligible = totalRevenue >= settings.minRevenue && completedOrders >= settings.minCompletedOrders;

    // Add interest info to active loans
    const loansWithInterest = loans.map((loan) => ({
      ...loan,
      accumulatedInterest: loan.status === "APPROVED" ? calculateInterest(loan) : 0,
      daysRemaining: loan.dueDate
        ? Math.max(0, Math.ceil((loan.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null,
      isOverdue: loan.dueDate ? loan.dueDate.getTime() < Date.now() : false,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
      approvedAt: loan.approvedAt?.toISOString() ?? null,
      rejectedAt: loan.rejectedAt?.toISOString() ?? null,
      dueDate: loan.dueDate?.toISOString() ?? null,
    }));

    return NextResponse.json({
      loans: loansWithInterest,
      eligibility: {
        isEligible,
        totalRevenue,
        completedOrders,
        minRevenue: settings.minRevenue,
        minCompletedOrders: settings.minCompletedOrders,
      },
      settings: {
        dailyInterestRate: settings.dailyInterestRate,
        maxRepaymentDays: settings.maxRepaymentDays,
        minLoanAmount: settings.minLoanAmount,
        maxLoanAmount: settings.maxLoanAmount,
      },
    });
  } catch (error) {
    console.error("GET /api/seller/loans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const settings = await getLoanSettings();
    const body = await req.json();
    const { amount, reason, repaymentDays } = body;

    // ── Eligibility checks ──
    const [completedOrders, storeAnalytics] = await Promise.all([
      prisma.order.count({ where: { storeId: user.store.id, status: "COMPLETED" } }),
      prisma.storeAnalytics.findUnique({ where: { storeId: user.store.id }, select: { totalRevenue: true } }),
    ]);

    const totalRevenue = storeAnalytics?.totalRevenue ?? 0;

    if (totalRevenue < settings.minRevenue) {
      return NextResponse.json(
        { error: `You need at least $${settings.minRevenue.toLocaleString()} in completed revenue to request a loan. Current: $${totalRevenue.toLocaleString()}.` },
        { status: 400 }
      );
    }

    if (completedOrders < settings.minCompletedOrders) {
      return NextResponse.json(
        { error: `You need at least ${settings.minCompletedOrders} completed orders to request a loan. Current: ${completedOrders}.` },
        { status: 400 }
      );
    }

    // ── Validate amount ──
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (amount < settings.minLoanAmount) {
      return NextResponse.json({ error: `Minimum loan amount is $${settings.minLoanAmount}` }, { status: 400 });
    }
    if (amount > settings.maxLoanAmount) {
      return NextResponse.json({ error: `Maximum loan amount is $${settings.maxLoanAmount}` }, { status: 400 });
    }

    // ── Validate repayment days ──
    const days = repaymentDays ?? settings.maxRepaymentDays;
    if (!Number.isInteger(days) || days < 1 || days > settings.maxRepaymentDays) {
      return NextResponse.json({ error: `Repayment period must be 1-${settings.maxRepaymentDays} days` }, { status: 400 });
    }

    // ── Validate reason ──
    if (!reason || typeof reason !== "string") {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }
    if (reason.trim().length < 20) {
      return NextResponse.json({ error: "Reason must be at least 20 characters" }, { status: 400 });
    }
    if (reason.trim().length > 500) {
      return NextResponse.json({ error: "Reason must be at most 500 characters" }, { status: 400 });
    }

    // ── Check for existing active/pending loan ──
    const existingLoan = await prisma.loanRequest.findFirst({
      where: {
        storeId: user.store.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingLoan) {
      return NextResponse.json(
        { error: "You already have an active or pending loan. Please repay or wait for review before requesting another." },
        { status: 400 }
      );
    }

    const loan = await prisma.loanRequest.create({
      data: {
        storeId: user.store.id,
        sellerId: user.id,
        amount,
        reason: reason.trim(),
        status: "PENDING",
        repaymentDays: days,
        dailyInterestRate: settings.dailyInterestRate,
      },
      include: { transactions: true },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error("POST /api/seller/loans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
