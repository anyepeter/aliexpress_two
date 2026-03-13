import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Allowed redirect paths (must start with / and not contain protocol)
function isValidRedirect(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes(":");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const redirectTo = url.searchParams.get("redirect");

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/auth/login", origin));
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", origin));
    }

    // If a valid redirect path was provided, go there instead of the dashboard
    if (redirectTo && isValidRedirect(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo, origin));
    }

    // Default: send each role to their dashboard
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", origin));
    }
    if (user.role === "SELLER") {
      return NextResponse.redirect(new URL("/seller/dashboard", origin));
    }
    // BUYER
    return NextResponse.redirect(new URL("/buyer/dashboard", origin));
  } catch {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }
}
