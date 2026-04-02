import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sellerId = req.nextUrl.searchParams.get("sellerId");
  if (!sellerId)
    return NextResponse.json({ error: "sellerId required" }, { status: 400 });

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      password: true,
      avatarUrl: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          description: true,
          logoUrl: true,
          bannerUrl: true,
          businessType: true,
          businessRegNo: true,
          idDocumentUrl: true,
          taxDocumentUrl: true,
          country: true,
          city: true,
          state: true,
          postalCode: true,
          websiteUrl: true,
          socialLinks: true,
          isVerified: true,
          isPremium: true,
          adminNotes: true,
          averageRating: true,
          totalReviews: true,
          ratingOverride: true,
          approvedAt: true,
          approvedBy: true,
          createdAt: true,
          analytics: {
            select: {
              totalViews: true,
              totalOrders: true,
              totalRevenue: true,
              totalProfit: true,
              revenueAdjustment: true,
            },
          },
          _count: {
            select: {
              sellerProducts: { where: { status: "PUBLISHED" } },
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              sellerRevenue: true,
              paymentMethod: true,
              createdAt: true,
              buyer: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
          },
          withdrawals: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              requestedAt: true,
              reviewedAt: true,
              adminNote: true,
            },
            orderBy: { requestedAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  if (!seller)
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  // Compute order stats
  const orders = seller.store?.orders ?? [];
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING" || o.status === "CONTACTED_ADMIN").length,
    shipping: orders.filter((o) => o.status === "SHIPPING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    rejected: orders.filter((o) => o.status === "REJECTED").length,
  };

  // Compute withdrawal stats
  const withdrawals = seller.store?.withdrawals ?? [];
  const withdrawalStats = {
    total: withdrawals.length,
    approved: withdrawals.filter((w) => w.status === "APPROVED").reduce((s, w) => s + w.amount, 0),
    pending: withdrawals.filter((w) => w.status === "PENDING").reduce((s, w) => s + w.amount, 0),
    rejected: withdrawals.filter((w) => w.status === "REJECTED").length,
  };

  return NextResponse.json({
    ...seller,
    orderStats,
    withdrawalStats,
  });
}
