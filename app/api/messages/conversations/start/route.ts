import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { ConversationType } from "@prisma/client";

const ALLOWED_TARGET_ROLES: Record<string, string[]> = {
  BUYER: ["SELLER", "ADMIN"],
  SELLER: ["BUYER", "ADMIN"],
  ADMIN: ["BUYER", "SELLER"],
};

function getConversationType(roleA: string, roleB: string): ConversationType | null {
  const pair = [roleA, roleB].sort().join("_");
  if (pair === "BUYER_SELLER") return "BUYER_SELLER";
  if (pair === "ADMIN_SELLER") return "SELLER_ADMIN";
  if (pair === "ADMIN_BUYER") return "BUYER_ADMIN";
  return null;
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { targetUserId, subject, orderId } = await req.json();

  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, firstName: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 });
  }

  // Role pairing validation
  if (!ALLOWED_TARGET_ROLES[user.role]?.includes(targetUser.role)) {
    return NextResponse.json(
      { error: "This conversation type is not allowed" },
      { status: 403 }
    );
  }

  const conversationType = getConversationType(user.role, targetUser.role);
  if (!conversationType) {
    return NextResponse.json({ error: "Invalid pairing" }, { status: 400 });
  }

  // Determine buyer/seller/admin IDs
  let buyerId: string | null = null;
  let sellerId: string | null = null;
  let adminId: string | null = null;

  const participants = [
    { id: user.id, role: user.role },
    { id: targetUser.id, role: targetUser.role },
  ];

  for (const p of participants) {
    if (p.role === "BUYER") buyerId = p.id;
    else if (p.role === "SELLER") sellerId = p.id;
    else if (p.role === "ADMIN") adminId = p.id;
  }

  // Check if conversation already exists using unique constraints
  let existing = null;

  if (conversationType === "BUYER_SELLER" && buyerId && sellerId) {
    existing = await prisma.conversation.findUnique({
      where: { buyerId_sellerId: { buyerId, sellerId } },
    });
  } else if (conversationType === "SELLER_ADMIN" && sellerId && adminId) {
    existing = await prisma.conversation.findUnique({
      where: { sellerId_adminId: { sellerId, adminId } },
    });
  } else if (conversationType === "BUYER_ADMIN" && buyerId && adminId) {
    existing = await prisma.conversation.findUnique({
      where: { buyerId_adminId: { buyerId, adminId } },
    });
  }

  if (existing) {
    // Update subject/orderId if provided and not already set
    if ((subject || orderId) && (!existing.subject || !existing.orderId)) {
      await prisma.conversation.update({
        where: { id: existing.id },
        data: {
          ...(subject && !existing.subject ? { subject } : {}),
          ...(orderId && !existing.orderId ? { orderId } : {}),
        },
      });
    }
    return NextResponse.json({ conversationId: existing.id });
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: conversationType,
      buyerId,
      sellerId,
      adminId,
      subject: subject ?? null,
      orderId: orderId ?? null,
    },
  });

  // Insert SYSTEM message if subject/order provided
  if (subject || orderId) {
    const systemContent = orderId
      ? `Conversation started about Order #${orderId.slice(0, 8)}`
      : `Conversation started: ${subject}`;

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        type: "SYSTEM",
        content: systemContent,
        status: "READ",
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: systemContent,
        lastMessageAt: new Date(),
      },
    });
  }

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
