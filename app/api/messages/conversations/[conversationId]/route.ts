import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
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
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isParticipant =
    conversation.buyerId === user.id ||
    conversation.sellerId === user.id ||
    conversation.adminId === user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get presence for all participants
  const participantIds = [conversation.buyerId, conversation.sellerId, conversation.adminId].filter(Boolean) as string[];
  const presences = await prisma.userPresence.findMany({
    where: { userId: { in: participantIds } },
  });
  const presenceMap = new Map(presences.map((p) => [p.userId, p]));

  return NextResponse.json({
    ...conversation,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    presences: Object.fromEntries(
      participantIds.map((id) => [
        id,
        {
          isOnline: presenceMap.get(id)?.isOnline ?? false,
          lastSeenAt: presenceMap.get(id)?.lastSeenAt?.toISOString() ?? null,
        },
      ])
    ),
  });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isParticipant =
    conversation.buyerId === user.id ||
    conversation.sellerId === user.id ||
    conversation.adminId === user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark all unread messages from other parties as READ
  const now = new Date();
  const updated = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      status: { not: "READ" },
    },
    data: {
      status: "READ",
      readAt: now,
    },
  });

  if (updated.count > 0) {
    // Get the IDs of updated messages for Pusher event
    const readMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        readAt: now,
      },
      select: { id: true },
    });

    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "message-read",
      {
        messageIds: readMessages.map((m) => m.id),
        readAt: now.toISOString(),
      }
    );
  }

  // Update presence
  await prisma.userPresence.upsert({
    where: { userId: user.id },
    update: { lastSeenAt: now },
    create: { userId: user.id, isOnline: true, lastSeenAt: now },
  });

  return NextResponse.json({ ok: true, readCount: updated.count });
}
