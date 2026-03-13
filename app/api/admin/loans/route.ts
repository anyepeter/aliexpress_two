import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Not an admin" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where = status && status !== "all"
            ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "REPAID" | "CANCELLED" }
            : {};

        const loans = await prisma.loanRequest.findMany({
            where,
            include: {
                seller: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
                store: { select: { storeName: true, logoUrl: true } },
                transactions: { orderBy: { createdAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(loans);
    } catch (error) {
        console.error("GET /api/admin/loans error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
