import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // Check not already taken by another user
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { clerkId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email address is already in use." },
        { status: 409 }
      );
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);

    // Create new email address as verified + primary
    const newEmailObj = await clerk.emailAddresses.createEmailAddress({
      userId: clerkId,
      emailAddress: email,
      verified: true,
      primary: true,
    });

    // Set as primary
    await clerk.users.updateUser(clerkId, {
      primaryEmailAddressID: newEmailObj.id,
    });

    // Remove all old email addresses
    for (const ea of clerkUser.emailAddresses) {
      if (ea.id !== newEmailObj.id) {
        try {
          await clerk.emailAddresses.deleteEmailAddress(ea.id);
        } catch {
          // Best-effort cleanup
        }
      }
    }

    // Update DB
    await prisma.user.update({
      where: { clerkId },
      data: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user/email PUT] error:", error);
    return NextResponse.json(
      { error: "Failed to update email address." },
      { status: 500 }
    );
  }
}
