import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is admin
  const caller = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!caller || caller.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sellerId, action } = await req.json() as {
    sellerId: string;
    action: "approve" | "reject";
  };

  if (!sellerId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    include: { store: true },
  });

  if (!seller || seller.role !== "SELLER") {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "ACTIVE" : "REJECTED";

  // Update Prisma
  await prisma.user.update({
    where: { id: sellerId },
    data: { status: newStatus },
  });

  if (seller.store) {
    await prisma.store.update({
      where: { id: seller.store.id },
      data: {
        isVerified: action === "approve",
        approvedAt: action === "approve" ? new Date() : null,
        approvedBy: caller.id,
      },
    });
  }

  // Sync Clerk publicMetadata
  if (seller.clerkId) {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(seller.clerkId, {
      publicMetadata: { role: "SELLER", status: newStatus },
    });
  }

  // Bust cached pages so the new store appears immediately
  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/shop");
  if (seller.store) {
    revalidatePath(`/store/${seller.store.storeSlug}`);
  }

  return NextResponse.json({ success: true, status: newStatus });
}
