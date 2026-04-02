import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — fetch current loan settings
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let settings = await prisma.loanSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.loanSettings.create({
      data: { id: "default" },
    });
  }

  return NextResponse.json(settings);
}

// PATCH — update loan settings
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { dailyInterestRate, maxRepaymentDays, minRevenue, minCompletedOrders, minLoanAmount, maxLoanAmount } = body;

  const data: Record<string, number> = {};
  if (dailyInterestRate !== undefined) {
    if (typeof dailyInterestRate !== "number" || dailyInterestRate < 0 || dailyInterestRate > 1) {
      return NextResponse.json({ error: "Interest rate must be between 0 and 1 (e.g. 0.003 = 0.3%)" }, { status: 400 });
    }
    data.dailyInterestRate = dailyInterestRate;
  }
  if (maxRepaymentDays !== undefined) {
    if (!Number.isInteger(maxRepaymentDays) || maxRepaymentDays < 1 || maxRepaymentDays > 365) {
      return NextResponse.json({ error: "Max repayment days must be 1-365" }, { status: 400 });
    }
    data.maxRepaymentDays = maxRepaymentDays;
  }
  if (minRevenue !== undefined) {
    if (typeof minRevenue !== "number" || minRevenue < 0) {
      return NextResponse.json({ error: "Min revenue must be >= 0" }, { status: 400 });
    }
    data.minRevenue = minRevenue;
  }
  if (minCompletedOrders !== undefined) {
    if (!Number.isInteger(minCompletedOrders) || minCompletedOrders < 0) {
      return NextResponse.json({ error: "Min completed orders must be >= 0" }, { status: 400 });
    }
    data.minCompletedOrders = minCompletedOrders;
  }
  if (minLoanAmount !== undefined) data.minLoanAmount = minLoanAmount;
  if (maxLoanAmount !== undefined) data.maxLoanAmount = maxLoanAmount;

  const settings = await prisma.loanSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return NextResponse.json(settings);
}
