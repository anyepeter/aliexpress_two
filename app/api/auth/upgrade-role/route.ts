import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { store: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Only buyers can upgrade to seller." },
        { status: 403 }
      );
    }
    if (user.store) {
      return NextResponse.json(
        { error: "You already have a store." },
        { status: 409 }
      );
    }

    const body = await req.json() as {
      storeName: string;
      description: string;
      businessRegNo?: string;
      logoUrl?: string;
      bannerUrl?: string;
      country: string;
      city: string;
      state?: string;
      postalCode?: string;
      street: string;
      idDocumentUrl: string;
      taxDocumentUrl?: string;
    };

    // Validate required fields
    if (!body.storeName || !body.description || !body.country || !body.city || !body.street || !body.idDocumentUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Check store name uniqueness
    const existingStore = await prisma.store.findUnique({
      where: { storeName: body.storeName },
    });
    if (existingStore) {
      return NextResponse.json({ error: "STORE_NAME_EXISTS" }, { status: 409 });
    }

    // Transaction: update user role + create store + create address
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { role: "SELLER", status: "PENDING_APPROVAL" },
      });

      await tx.store.create({
        data: {
          userId: user.id,
          storeName: body.storeName,
          storeSlug: generateSlug(body.storeName),
          description: body.description,
          businessType: "Individual",
          businessRegNo: body.businessRegNo || null,
          logoUrl: body.logoUrl || null,
          bannerUrl: body.bannerUrl || null,
          idDocumentUrl: body.idDocumentUrl,
          taxDocumentUrl: body.taxDocumentUrl || null,
          country: body.country,
          city: body.city,
          state: body.state || null,
          postalCode: body.postalCode || null,
        },
      });

      await tx.address.create({
        data: {
          userId: user.id,
          label: "Store",
          street: body.street,
          city: body.city,
          state: body.state || null,
          country: body.country,
          postalCode: body.postalCode || null,
          isDefault: false,
        },
      });
    });

    // Update Clerk publicMetadata to reflect new role
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: { role: "SELLER", status: "PENDING_APPROVAL" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[upgrade-role] error:", error);
    return NextResponse.json(
      { error: "Upgrade failed. Please try again." },
      { status: 500 }
    );
  }
}
