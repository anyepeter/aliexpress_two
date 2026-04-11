import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/orders/admin/place
 * Admin places an order on behalf of a buyer to a specific store.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { clerkId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { buyerId, storeId, paymentMethod, items } = body as {
      buyerId: string;
      storeId: string;
      paymentMethod: "BANK_TRANSFER" | "BITCOIN";
      items: Array<{
        sellerProductId: string;
        dummyProductId: number;
        title: string;
        thumbnail: string;
        price: number;
        basePrice: number;
        discountPercentage: number;
        quantity: number;
      }>;
    };

    // Validate buyer
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { addresses: { orderBy: { isDefault: "desc" }, take: 1 } },
    });
    if (!buyer || buyer.role !== "BUYER") {
      return NextResponse.json({ error: "Invalid buyer" }, { status: 400 });
    }

    // Validate store
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    if (!["BANK_TRANSFER", "BITCOIN"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Use buyer's default address, or create a placeholder
    let addressId = buyer.addresses[0]?.id;
    if (!addressId) {
      const newAddress = await prisma.address.create({
        data: {
          userId: buyerId,
          label: "Default",
          street: "Admin-placed order",
          city: "N/A",
          country: "N/A",
          isDefault: true,
        },
      });
      addressId = newAddress.id;
    }

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `MH-${dateStr}-${randomSuffix}`;

    // Calculate items with discount applied
    const orderItems = items.map((item) => {
      const dp = item.discountPercentage;
      const discountMultiplier = dp > 0 ? 1 - dp / 100 : 1;
      const discountedPrice = item.price * discountMultiplier;
      const discountedBase = item.basePrice * discountMultiplier;

      return {
        productId: item.sellerProductId,
        dummyProductId: item.dummyProductId,
        title: item.title,
        thumbnail: item.thumbnail,
        price: discountedPrice,
        basePrice: discountedBase,
        discountPct: dp,
        quantity: item.quantity,
        total: discountedPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);
    const baseCost = orderItems.reduce((sum, i) => sum + i.basePrice * i.quantity, 0);
    const profit = subtotal - baseCost;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        storeId,
        addressId,
        paymentMethod,
        subtotal,
        totalAmount: subtotal,
        baseCost,
        profit,
        sellerRevenue: 0,
        adminNote: `Order placed by admin (${admin.firstName} ${admin.lastName})`,
        items: { create: orderItems },
      },
      include: {
        items: true,
        buyer: { select: { firstName: true, lastName: true, email: true } },
        store: { select: { storeName: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders/admin/place error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
