import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      avatarUrl?: string | null;
    };

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { clerkId },
      data: {
        firstName,
        lastName,
        phone: body.phone?.trim() || null,
        avatarUrl: body.avatarUrl || null,
      },
    });

    const clerk = await clerkClient();
    await clerk.users.updateUser(clerkId, { firstName, lastName });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user/profile PUT] error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
