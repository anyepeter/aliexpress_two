import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sellerId = req.nextUrl.searchParams.get("sellerId");
  if (!sellerId)
    return NextResponse.json({ error: "sellerId required" }, { status: 400 });

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      password: true,
      avatarUrl: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          description: true,
          logoUrl: true,
          bannerUrl: true,
          businessType: true,
          businessRegNo: true,
          idDocumentUrl: true,
          taxDocumentUrl: true,
          country: true,
          city: true,
          state: true,
          postalCode: true,
          websiteUrl: true,
          socialLinks: true,
          isVerified: true,
          adminNotes: true,
          approvedAt: true,
          approvedBy: true,
          createdAt: true,
        },
      },
    },
  });

  if (!seller)
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  return NextResponse.json(seller);
}
