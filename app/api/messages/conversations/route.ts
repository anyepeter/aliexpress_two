import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build role-based query
  const whereClause =
    user.role === "ADMIN"
      ? { adminId: user.id }
      : user.role === "SELLER"
        ? { OR: [{ sellerId: user.id }] }
        : { OR: [{ buyerId: user.id }] };

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    include: {
      buyer: {
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true, role: true,
          store: { select: { storeName: true, storeSlug: true, isVerified: true } },
        },
      },
      seller: {
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true, role: true,
          store: { select: { storeName: true, storeSlug: true, isVerified: true } },
        },
      },
      admin: {
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true, role: true,
        },
      },
      messages: {
        where: {
          senderId: { not: user.id },
          status: { not: "READ" },
        },
        select: { id: true },
      },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  // Get presence for all other participants
  const otherUserIds = conversations.map((c) => {
    if (c.buyerId && c.buyerId !== user.id) return c.buyerId;
    if (c.sellerId && c.sellerId !== user.id) return c.sellerId;
    if (c.adminId && c.adminId !== user.id) return c.adminId;
    return null;
  }).filter(Boolean) as string[];

  const presences = await prisma.userPresence.findMany({
    where: { userId: { in: otherUserIds } },
  });
  const presenceMap = new Map(presences.map((p) => [p.userId, p]));

  const result = conversations.map((c) => {
    // Determine the "other" participant
    let other: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      role: string;
      store?: { storeName: string; storeSlug: string; isVerified: boolean } | null;
    } | null = null;

    if (c.type === "BUYER_SELLER") {
      other = user.role === "BUYER" ? c.seller : c.buyer;
    } else if (c.type === "SELLER_ADMIN") {
      other = user.role === "SELLER" ? c.admin : c.seller;
    } else if (c.type === "BUYER_ADMIN") {
      other = user.role === "BUYER" ? c.admin : c.buyer;
    }

    // For admin with multiple types, figure out who the other is
    if (!other && user.role === "ADMIN") {
      other = c.buyer ?? c.seller;
    }

    const presence = other ? presenceMap.get(other.id) : null;

    return {
      id: c.id,
      type: c.type,
      subject: c.subject,
      orderId: c.orderId,
      otherParticipant: other
        ? {
            id: other.id,
            firstName: other.firstName,
            lastName: other.lastName,
            avatarUrl: other.avatarUrl,
            role: other.role,
            storeName: other.store?.storeName,
            storeSlug: other.store?.storeSlug,
            isVerified: other.store?.isVerified,
            isOnline: presence?.isOnline ?? false,
            lastSeenAt: presence?.lastSeenAt?.toISOString() ?? null,
          }
        : null,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
      unreadCount: c.messages.length,
    };
  });

  return NextResponse.json(result);
}
