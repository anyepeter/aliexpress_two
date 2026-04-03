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

  const { conversationId, isTyping } = await req.json();

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const event = isTyping ? "typing-start" : "typing-stop";
  const payload = {
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
  };

  try {
    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      event,
      payload
    );
  } catch (e) {
    console.error("Pusher typing trigger failed:", e);
  }

  return NextResponse.json({ ok: true });
}
