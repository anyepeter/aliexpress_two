import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/stores — List all active stores with product counts (admin only) */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stores = await prisma.store.findMany({
      where: { user: { status: "ACTIVE" } },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        logoUrl: true,
        isVerified: true,
        user: { select: { firstName: true, lastName: true } },
        _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: [{ isVerified: "desc" }, { storeName: "asc" }],
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("GET /api/admin/stores error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
