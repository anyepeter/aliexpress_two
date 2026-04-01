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

  // Delete a seller and all related data
  if (action === "delete") {
    const { sellerId } = body as { sellerId: string };
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { store: true },
    });
    if (!seller || seller.role !== "SELLER") {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Delete in correct order to respect foreign keys
    if (seller.store) {
      const storeId = seller.store.id;

      // Delete deal section items referencing seller products
      await prisma.dealSectionItem.deleteMany({
        where: { product: { storeId } },
      });

      // Delete product views
      await prisma.productView.deleteMany({
        where: { product: { storeId } },
      });

      // Delete seller products
      await prisma.sellerProduct.deleteMany({ where: { storeId } });

      // Delete order analytics
      await prisma.orderAnalytics.deleteMany({ where: { storeId } });

      // Delete order items then orders
      const storeOrders = await prisma.order.findMany({
        where: { storeId },
        select: { id: true },
      });
      if (storeOrders.length > 0) {
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: storeOrders.map((o) => o.id) } },
        });
        await prisma.order.deleteMany({ where: { storeId } });
      }

      // Delete loan transactions and repayments then loan requests
      const loans = await prisma.loanRequest.findMany({
        where: { storeId },
        select: { id: true },
      });
      if (loans.length > 0) {
        const loanIds = loans.map((l) => l.id);
        await prisma.loanTransaction.deleteMany({ where: { loanId: { in: loanIds } } });
        await prisma.loanRepayment.deleteMany({ where: { loanId: { in: loanIds } } });
        await prisma.loanRequest.deleteMany({ where: { storeId } });
      }

      // Delete withdrawals
      await prisma.withdrawal.deleteMany({ where: { storeId } });

      // Delete store analytics
      await prisma.storeAnalytics.deleteMany({ where: { storeId } });

      // Delete the store
      await prisma.store.delete({ where: { id: storeId } });
    }

    // Delete conversations and messages
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ sellerId: sellerId }, { buyerId: sellerId }, { adminId: sellerId }] },
      select: { id: true },
    });
    if (conversations.length > 0) {
      await prisma.message.deleteMany({
        where: { conversationId: { in: conversations.map((c) => c.id) } },
      });
      await prisma.conversation.deleteMany({
        where: { id: { in: conversations.map((c) => c.id) } },
      });
    }

    // Delete user presence
    await prisma.userPresence.deleteMany({ where: { userId: sellerId } });

    // Delete addresses
    await prisma.address.deleteMany({ where: { userId: sellerId } });

    // Delete the user
    await prisma.user.delete({ where: { id: sellerId } });

    revalidatePath("/");
    revalidatePath("/stores");
    revalidatePath("/shop");
    revalidatePath("/admin/sellers");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
