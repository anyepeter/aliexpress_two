import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const roles = searchParams.get("roles")?.split(",") ?? [];
  const loadAll = searchParams.get("all") === "true";

  // If not loading all and search query is too short, return empty
  if (!loadAll && q.length < 2) {
    return NextResponse.json([]);
  }

  // Hide the super admin (system owner) from all users
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  const baseWhere = {
    id: { not: currentUser.id },
    status: "ACTIVE" as const,
    role: { in: roles as ("ADMIN" | "SELLER" | "BUYER")[] },
    ...(superAdminEmail ? { email: { not: superAdminEmail } } : {}),
  };

  const searchFilter = q.length >= 2
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { store: { storeName: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where: {
      ...baseWhere,
      ...searchFilter,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      store: {
        select: { storeName: true, storeSlug: true, isVerified: true },
      },
    },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
    take: loadAll ? 100 : 10,
  });

  return NextResponse.json(users);
}
