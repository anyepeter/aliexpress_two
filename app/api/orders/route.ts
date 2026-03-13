import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/orders — Create orders from cart (one order per store).
 * Body: { addressId, paymentMethod, groups: StoreCartGroup[] }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { addressId, paymentMethod, groups } = body as {
      addressId: string;
      paymentMethod: "BANK_TRANSFER" | "BITCOIN";
      groups: Array<{
        storeId: string | null;
        storeName: string;
        items: Array<{
          id: string;
          dummyProductId: number;
          title: string;
          thumbnail: string;
          price: number;
          discountPercentage: number;
          quantity: number;
        }>;
        subtotal: number;
      }>;
    };

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    if (!["BANK_TRANSFER", "BITCOIN"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Generate order number prefix: MH-YYYYMMDD
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");

    const createdOrders = [];

    for (const group of groups) {
      // If group has a storeId, verify the store exists
      if (group.storeId) {
        const store = await prisma.store.findUnique({ where: { id: group.storeId } });
        if (!store) continue;
      }

      // Generate unique order number
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `MH-${dateStr}-${randomSuffix}`;

      // Look up all SellerProducts for this group to get basePrice
      const productIds = group.items
        .filter((item) => !item.id.startsWith("dummy-"))
        .map((item) => item.id);

      const sellerProducts = productIds.length > 0
        ? await prisma.sellerProduct.findMany({
            where: { id: { in: productIds } },
            select: { id: true, basePrice: true },
          })
        : [];

      const basePriceMap = new Map(
        sellerProducts.map((sp) => [sp.id, sp.basePrice])
      );

      // Calculate item totals with discount + basePrice lookup
      // IMPORTANT: Apply the same discount % to BOTH sellingPrice and basePrice
      // so the seller's margin percentage is preserved.
      // Example: basePrice=$300, sellingPrice=$345 (15% margin), discount=5%
      //   discountedSelling = $345 * 0.95 = $327.75
      //   discountedBase    = $300 * 0.95 = $285.00
      //   profit per unit   = $327.75 - $285 = $42.75 (still 15% margin)
      const orderItems = group.items.map((item) => {
        const dp = item.discountPercentage;
        const discountMultiplier = dp > 0 ? 1 - dp / 100 : 1;

        const discountedPrice = item.price * discountMultiplier;

        // Get the raw basePrice from DB, or fall back to sellingPrice (for dummy products)
        const rawBasePrice = basePriceMap.get(item.id) ?? discountedPrice;

        // Apply the SAME discount to basePrice so margin % stays constant
        const itemBasePrice = dp > 0 ? rawBasePrice * discountMultiplier : rawBasePrice;

        return {
          productId: item.id,
          dummyProductId: item.dummyProductId,
          title: item.title,
          thumbnail: item.thumbnail,
          price: discountedPrice,
          basePrice: itemBasePrice,
          discountPct: dp,
          quantity: item.quantity,
          total: discountedPrice * item.quantity,
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);
      const baseCost = orderItems.reduce(
        (sum, i) => sum + i.basePrice * i.quantity, 0
      );
      const profit = subtotal - baseCost;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId: user.id,
          storeId: group.storeId ?? undefined,
          addressId,
          paymentMethod,
          subtotal,
          totalAmount: subtotal,
          baseCost,
          profit,
          sellerRevenue: 0,
          items: { create: orderItems },
        },
        include: { items: true, store: { select: { storeName: true } } },
      });

      createdOrders.push(order);
    }

    if (createdOrders.length === 0) {
      return NextResponse.json(
        { error: "No valid store orders could be created" },
        { status: 400 }
      );
    }

    return NextResponse.json({ orders: createdOrders }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/orders — List orders for current user (buyer view).
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        items: true,
        store: { select: { storeName: true, storeSlug: true, logoUrl: true, isVerified: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
