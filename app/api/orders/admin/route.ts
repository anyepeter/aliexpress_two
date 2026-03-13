import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/admin — List all orders (admin view).
 * Query: ?status=PENDING|CONTACTED_ADMIN|SHIPPING|COMPLETED|REJECTED
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    const statusFilter = req.nextUrl.searchParams.get("status");
    const where = statusFilter
      ? { status: statusFilter as "PENDING" | "CONTACTED_ADMIN" | "SHIPPING" | "COMPLETED" | "REJECTED" }
      : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        buyer: { select: { firstName: true, lastName: true, email: true } },
        store: { select: { storeName: true, storeSlug: true, logoUrl: true, isVerified: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders/admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/admin — Admin manages order status.
 * Body: { orderId, action: "ship" | "complete" | "reject", adminNote?: string }
 *
 * Flow: CONTACTED_ADMIN → SHIPPING → COMPLETED
 *       Any non-completed → REJECTED
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    const { orderId, action, adminNote } = (await req.json()) as {
      orderId: string;
      action: "ship" | "complete" | "reject";
      adminNote?: string;
    };

    if (!["ship", "complete", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, store: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === "COMPLETED" || order.status === "REJECTED") {
      return NextResponse.json({ error: "Order already finalized" }, { status: 400 });
    }

    if (action === "ship") {
      if (order.status !== "PENDING" && order.status !== "CONTACTED_ADMIN") {
        return NextResponse.json({ error: "Order must be pending or contacted to ship" }, { status: 400 });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "SHIPPING",
          shippingAt: new Date(),
          adminNote: adminNote || null,
        },
      });

      return NextResponse.json({ order: updatedOrder });
    }

    if (action === "complete") {
      if (order.status !== "SHIPPING") {
        return NextResponse.json({ error: "Order must be in shipping to complete" }, { status: 400 });
      }

      // Update order + store analytics in a transaction
      const txOps = [
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            adminNote: adminNote || null,
            sellerRevenue: order.totalAmount,
          },
        }),
      ];

      // Only update store analytics if the order belongs to a store
      if (order.storeId) {
        txOps.push(
          prisma.storeAnalytics.upsert({
            where: { storeId: order.storeId },
            create: {
              storeId: order.storeId,
              totalOrders: 1,
              totalRevenue: order.totalAmount,
              totalProfit: order.profit,
            },
            update: {
              totalOrders: { increment: 1 },
              totalRevenue: { increment: order.totalAmount },
              totalProfit: { increment: order.profit },
            },
          }) as never,
        );
      }

      const [updatedOrder] = await prisma.$transaction(txOps);

      return NextResponse.json({ order: updatedOrder });
    }

    // action === "reject"
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        adminNote: adminNote || null,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/orders/admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
