import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StoreInfo } from "@/lib/types/marketplace";

// GET /api/store/[storeSlug] — public, no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { storeSlug },
    include: { user: { select: { status: true, email: true, phone: true } } },
  });

  if (!store || store.user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const storeInfo: StoreInfo = {
    id: store.id,
    userId: store.userId,
    storeName: store.storeName,
    storeSlug: store.storeSlug,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    description: store.description,
    isVerified: store.isVerified,
    createdAt: store.createdAt.toISOString(),
    ownerEmail: store.user?.email ?? null,
    ownerPhone: store.user?.phone ?? null,
    country: store.country ?? null,
    city: store.city ?? null,
    socialLinks: (store.socialLinks as Record<string, string>) ?? null,
  };

  return NextResponse.json({ store: storeInfo });
}
