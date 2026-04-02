import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      status: "ACTIVE",
      ...(superAdminEmail ? { email: { not: superAdminEmail } } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "No admin found" }, { status: 404 });
  }

  return NextResponse.json(admin, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" },
  });
}
