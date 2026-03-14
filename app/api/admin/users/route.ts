import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — List all users with related data
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      store: {
        select: {
          storeName: true,
          isVerified: true,
          isPremium: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// PATCH — Update user status or role
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { action, userId } = body as { action: string; userId: string };

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Prevent admin from modifying themselves
  if (userId === admin.id) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  if (action === "suspend") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "activate") {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "changeRole") {
    const { role } = body as { role: string };
    if (!["ADMIN", "SELLER", "BUYER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as "ADMIN" | "SELLER" | "BUYER" },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
