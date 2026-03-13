import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { isOnline } = await req.json();

  await prisma.userPresence.upsert({
    where: { userId: user.id },
    update: {
      isOnline: !!isOnline,
      lastSeenAt: new Date(),
    },
    create: {
      userId: user.id,
      isOnline: !!isOnline,
      lastSeenAt: new Date(),
    },
  });

  // Find all conversations this user is in
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { sellerId: user.id },
        { adminId: user.id },
      ],
    },
    select: { id: true },
  });

  // Notify all conversation channels
  const event = isOnline ? "user-online" : "user-offline";
  const payload = {
    userId: user.id,
    lastSeenAt: new Date().toISOString(),
  };

  await Promise.all(
    conversations.map((c) =>
      pusherServer.trigger(`private-conversation-${c.id}`, event, payload)
    )
  );

  return NextResponse.json({ ok: true });
}
