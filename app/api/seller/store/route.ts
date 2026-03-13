import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// PATCH /api/seller/store — update store info (name, description, logo, banner)
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await req.json();
  const { storeName, description, logoUrl, bannerUrl } = body as {
    storeName?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
  };

  // Check uniqueness if store name is changing
  if (storeName && storeName.trim() !== user.store.storeName) {
    const taken = await prisma.store.findFirst({
      where: { storeName: storeName.trim(), NOT: { id: user.store.id } },
    });
    if (taken) {
      return NextResponse.json({ error: "Store name already taken" }, { status: 409 });
    }
  }

  const updated = await prisma.store.update({
    where: { id: user.store.id },
    data: {
      ...(storeName !== undefined && { storeName: storeName.trim() }),
      ...(description !== undefined && { description: description.trim() || null }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
    },
  });

  // Bust cached pages so store changes appear immediately
  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath(`/store/${updated.storeSlug}`);

  return NextResponse.json({ store: updated });
}
