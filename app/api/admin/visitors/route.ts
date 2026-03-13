import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH — Admin sets visitor count for a store
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { storeId, totalViews } = body as { storeId: string; totalViews: number };

  if (!storeId || totalViews === undefined) {
    return NextResponse.json({ error: "storeId and totalViews required" }, { status: 400 });
  }

  const views = Math.max(0, Math.floor(totalViews));

  // Upsert analytics record
  const analytics = await prisma.storeAnalytics.upsert({
    where: { storeId },
    update: { totalViews: views },
    create: { storeId, totalViews: views },
  });

  return NextResponse.json({ analytics });
}
