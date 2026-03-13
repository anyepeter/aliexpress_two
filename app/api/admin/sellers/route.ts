import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// GET — List all sellers with store info
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
    include: {
      store: {
        include: {
          _count: { select: { sellerProducts: { where: { status: "PUBLISHED" } } } },
          analytics: { select: { totalRevenue: true, totalOrders: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sellers });
}

// PATCH — Admin actions on a seller: archive, activate, set premium, reorder premium
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

  // Archive a seller (suspends user + hides store)
  if (action === "archive") {
    const { sellerId } = body as { sellerId: string };
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { store: true },
    });
    if (!seller || seller.role !== "SELLER") {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: sellerId },
      data: { status: "SUSPENDED" },
    });

    if (seller.store) {
      await prisma.store.update({
        where: { id: seller.store.id },
        data: { isPremium: false },
      });
    }

    revalidatePath("/");
    revalidatePath("/stores");
    revalidatePath("/shop");
    return NextResponse.json({ success: true });
  }

  // Activate (un-archive) a seller
  if (action === "activate") {
    const { sellerId } = body as { sellerId: string };
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller || seller.role !== "SELLER") {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: sellerId },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/");
    revalidatePath("/stores");
    revalidatePath("/shop");
    return NextResponse.json({ success: true });
  }

  // Toggle premium status for a store
  if (action === "togglePremium") {
    const { storeId, isPremium } = body as { storeId: string; isPremium: boolean };

    await prisma.store.update({
      where: { id: storeId },
      data: {
        isPremium,
        premiumOrder: isPremium ? 999 : 0, // new premiums go to end
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  }

  // Reorder premium sellers
  if (action === "reorderPremium") {
    const { order } = body as { order: { storeId: string; premiumOrder: number }[] };

    await prisma.$transaction(
      order.map(({ storeId, premiumOrder }) =>
        prisma.store.update({
          where: { id: storeId },
          data: { premiumOrder },
        })
      )
    );

    revalidatePath("/");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
