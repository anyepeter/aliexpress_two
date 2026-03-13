import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/seller/products/[id] — update single product (margin, status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Ensure the product belongs to this seller's store
  const existing = await prisma.sellerProduct.findFirst({
    where: { id, storeId: user.store.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updated = await prisma.sellerProduct.update({
    where: { id },
    data: {
      ...(body.marginPercent !== undefined && {
        marginPercent: body.marginPercent,
        sellingPrice: existing.basePrice * (1 + body.marginPercent / 100),
      }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });

  return NextResponse.json({ product: updated });
}

// DELETE /api/seller/products/[id] — remove product from store
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const existing = await prisma.sellerProduct.findFirst({
    where: { id, storeId: user.store.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.sellerProduct.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
