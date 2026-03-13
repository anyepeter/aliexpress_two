import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/seller — List orders for current seller's store.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { store: { select: { id: true } } },
    });
    if (!user || user.role !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Not a seller" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: user.store.id },
      include: {
        items: true,
        buyer: { select: { firstName: true, lastName: true, email: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders/seller error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/seller — Seller marks order as "contacted admin".
 * Body: { orderId }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { store: { select: { id: true } } },
    });
    if (!user || user.role !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Not a seller" }, { status: 403 });
    }

    const { orderId } = (await req.json()) as { orderId: string };

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: user.store.id, status: "PENDING" },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found or not pending" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONTACTED_ADMIN", contactedAt: new Date() },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("PATCH /api/orders/seller error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
