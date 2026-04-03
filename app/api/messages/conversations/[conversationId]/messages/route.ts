import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/server";

export async function GET(
  req: NextRequest,
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

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 50);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return NextResponse.json({
    messages: messages.reverse().map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt?.toISOString() ?? null,
    })),
    nextCursor: hasMore ? messages[0]?.id : null,
  });
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export async function POST(
  req: NextRequest,
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

  const body = await req.json();
  const { content, fileUrl, fileName, fileSize, audioDuration, type = "TEXT" } = body;

  // Validate at least content or fileUrl
  if (!content && !fileUrl) {
    return NextResponse.json(
      { error: "Message must have content or file" },
      { status: 400 }
    );
  }

  const sanitizedContent = content ? stripHtml(content) : null;

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      type,
      content: sanitizedContent,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      audioDuration: audioDuration ?? null,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  // Build preview text
  let preview = sanitizedContent ?? "";
  if (!preview) {
    if (type === "IMAGE") preview = "\ud83d\udcf7 Photo";
    else if (type === "FILE") preview = `\ud83d\udcce ${fileName ?? "File"}`;
    else if (type === "VOICE") preview = "\ud83c\udfa4 Voice message";
  }
  if (preview.length > 60) preview = preview.slice(0, 60) + "...";

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: preview,
      lastMessageAt: message.createdAt,
    },
  });

  // Fire Pusher event (non-blocking — don't crash if Pusher fails)
  try {
    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "new-message",
      {
        ...message,
        createdAt: message.createdAt.toISOString(),
        readAt: null,
      }
    );
  } catch (e) {
    console.error("Pusher trigger failed (message still saved):", e);
  }

  return NextResponse.json({
    ...message,
    createdAt: message.createdAt.toISOString(),
    readAt: null,
  });
}
