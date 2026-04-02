import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// PATCH — Admin overrides store rating
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { storeId, ratingOverride } = body;

  if (!storeId) {
    return NextResponse.json({ error: "storeId required" }, { status: 400 });
  }

  // ratingOverride can be null (to remove override) or a number 0-5
  if (ratingOverride !== null && ratingOverride !== undefined) {
    if (typeof ratingOverride !== "number" || ratingOverride < 0 || ratingOverride > 5) {
      return NextResponse.json({ error: "Rating must be between 0 and 5" }, { status: 400 });
    }
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      ratingOverride: ratingOverride ?? null,
    },
    select: {
      id: true,
      storeName: true,
      storeSlug: true,
      ratingOverride: true,
      averageRating: true,
      totalReviews: true,
    },
  });

  // Revalidate all store-related pages so new rating shows immediately
  revalidatePath("/stores");
  revalidatePath(`/store/${store.storeSlug}`);
  revalidatePath("/");

  return NextResponse.json(store);
}
