import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * POST /api/admin/login-as
 * Admin impersonation: generates a sign-in token for a target user
 * so the admin can view their dashboard.
 */
export async function POST(req: Request) {
  try {
    const { userId: adminClerkId } = await auth();
    if (!adminClerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the requester is an admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: adminClerkId },
    });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true, role: true, email: true },
    });

    if (!targetUser || !targetUser.clerkId) {
      return NextResponse.json({ error: "User not found or has no Clerk account" }, { status: 404 });
    }

    // Determine the dashboard URL based on role
    let dashboardUrl = "/";
    switch (targetUser.role) {
      case "SELLER":
        dashboardUrl = "/seller/dashboard";
        break;
      case "BUYER":
        dashboardUrl = "/buyer/dashboard";
        break;
      case "ADMIN":
        dashboardUrl = "/admin/dashboard";
        break;
    }

    // Use Clerk's impersonation - generate a sign-in token
    const clerk = await clerkClient();
    const token = await clerk.signInTokens.createSignInToken({
      userId: targetUser.clerkId,
      expiresInSeconds: 300, // 5 minutes to use the token
    });

    return NextResponse.json({
      signInToken: token.token,
      dashboardUrl,
      email: targetUser.email,
      role: targetUser.role,
    });
  } catch (error) {
    console.error("Login-as error:", error);
    return NextResponse.json({ error: "Failed to create impersonation session" }, { status: 500 });
  }
}
