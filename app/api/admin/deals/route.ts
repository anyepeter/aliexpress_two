import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return user?.role === "ADMIN" ? user : null;
}

// GET — fetch both deal sections with their items
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const sections = await prisma.dealSection.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { type: "asc" },
  });

  return NextResponse.json({ sections });
}

// POST — create or update a deal section + items
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { type, title, subtitle, isActive, items } = body as {
    type: "DOLLAR_EXPRESS" | "SUPER_DEALS";
    title: string;
    subtitle?: string;
    isActive?: boolean;
    items: {
      dummyProductId: number;
      productId?: string;
      customTitle?: string;
      customPrice?: number;
      customOldPrice?: number;
      customBadge?: string;
      sortOrder?: number;
    }[];
  };

  if (!type || !title) {
    return NextResponse.json(
      { error: "type and title are required" },
      { status: 400 }
    );
  }

  // Upsert the section
  const section = await prisma.dealSection.upsert({
    where: { type },
    create: {
      type,
      title,
      subtitle: subtitle ?? null,
      isActive: isActive ?? true,
    },
    update: {
      title,
      subtitle: subtitle ?? null,
      isActive: isActive ?? true,
    },
  });

  // Replace all items: delete old ones, create new
  await prisma.dealSectionItem.deleteMany({
    where: { sectionId: section.id },
  });

  if (items?.length) {
    await prisma.dealSectionItem.createMany({
      data: items.map((item, idx) => ({
        sectionId: section.id,
        dummyProductId: item.dummyProductId,
        productId: item.productId ?? null,
        customTitle: item.customTitle ?? null,
        customPrice: item.customPrice ?? null,
        customOldPrice: item.customOldPrice ?? null,
        customBadge: item.customBadge ?? null,
        sortOrder: item.sortOrder ?? idx,
      })),
    });
  }

  const updated = await prisma.dealSection.findUnique({
    where: { id: section.id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ section: updated });
}

// DELETE — remove a deal section entirely
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json({ error: "type param required" }, { status: 400 });
  }

  await prisma.dealSection.deleteMany({
    where: { type: type as "DOLLAR_EXPRESS" | "SUPER_DEALS" },
  });

  return NextResponse.json({ ok: true });
}
