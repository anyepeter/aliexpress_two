import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const MAX_LOAN_AMOUNT = 10000;
const MIN_LOAN_AMOUNT = 100;

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

        const loans = await prisma.loanRequest.findMany({
            where: { storeId: user.store.id },
            include: { transactions: { orderBy: { createdAt: "desc" } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(loans);
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

        const body = await req.json();
        const { amount, reason } = body;

        // Validate amount
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
        }
        if (amount < MIN_LOAN_AMOUNT) {
            return NextResponse.json({ error: `Minimum loan amount is $${MIN_LOAN_AMOUNT}` }, { status: 400 });
        }
        if (amount > MAX_LOAN_AMOUNT) {
            return NextResponse.json({ error: `Maximum loan amount is $${MAX_LOAN_AMOUNT}` }, { status: 400 });
        }

        // Validate reason
        if (!reason || typeof reason !== "string") {
            return NextResponse.json({ error: "Reason is required" }, { status: 400 });
        }
        if (reason.trim().length < 20) {
            return NextResponse.json({ error: "Reason must be at least 20 characters" }, { status: 400 });
        }
        if (reason.trim().length > 500) {
            return NextResponse.json({ error: "Reason must be at most 500 characters" }, { status: 400 });
        }

        // Check for existing active/pending loan
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
            },
            include: { transactions: true },
        });

        return NextResponse.json(loan, { status: 201 });
    } catch (error) {
        console.error("POST /api/seller/loans error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
