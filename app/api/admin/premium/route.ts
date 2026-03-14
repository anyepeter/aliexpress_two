import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — List all users with premium status
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Get all sellers with store info
  const sellers = await prisma.user.findMany({
    where: { role: "SELLER", status: "ACTIVE" },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          isPremium: true,
          premiumOrder: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all buyers
  const buyers = await prisma.user.findMany({
    where: { role: "BUYER", status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sellers, buyers });
}

// PATCH — Toggle premium status
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
  const { action } = body as { action: string };

  if (action === "toggleSellerPremium") {
    const { storeId, isPremium } = body as { storeId: string; isPremium: boolean };
    await prisma.store.update({
      where: { id: storeId },
      data: { isPremium, premiumOrder: isPremium ? 999 : 0 },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "reorderPremium") {
    const { order } = body as { order: { storeId: string; premiumOrder: number }[] };
    await prisma.$transaction(
      order.map(({ storeId, premiumOrder }) =>
        prisma.store.update({ where: { id: storeId }, data: { premiumOrder } })
      )
    );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
