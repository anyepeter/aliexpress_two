import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — public: fetch all active ad plans
export async function GET() {
  const plans = await prisma.adPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(plans);
}
