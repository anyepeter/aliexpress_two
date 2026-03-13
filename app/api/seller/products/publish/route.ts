import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// POST /api/seller/products/publish
// Body: { productIds: string[], order: string[] }
// Publishes listed products in the given order, archives all others
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { productIds, order }: { productIds: string[]; order: string[] } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
  }

  const storeId = user.store.id;

  // Verify all products belong to this store
  const storeProducts = await prisma.sellerProduct.findMany({
    where: { storeId },
    select: { id: true },
  });
  const storeProductIds = new Set(storeProducts.map((p) => p.id));
  const validIds = productIds.filter((id) => storeProductIds.has(id));

  await prisma.$transaction([
    // Publish selected products with order
    ...validIds.map((id, idx) =>
      prisma.sellerProduct.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          sortOrder: order.indexOf(id) !== -1 ? order.indexOf(id) : idx,
          publishedAt: new Date(),
        },
      })
    ),
    // Archive all other products in the store
    prisma.sellerProduct.updateMany({
      where: { storeId, id: { notIn: validIds } },
      data: { status: "ARCHIVED" },
    }),
  ]);

  const published = await prisma.sellerProduct.findMany({
    where: { storeId, status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });

  // Bust cached pages so new products appear immediately
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/store/${user.store.storeSlug}`);

  return NextResponse.json({ published });
}
