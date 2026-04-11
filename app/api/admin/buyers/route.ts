import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/buyers — List all active buyers (admin only) */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const buyers = await prisma.user.findMany({
      where: { role: "BUYER", status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ buyers });
  } catch (error) {
    console.error("GET /api/admin/buyers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
