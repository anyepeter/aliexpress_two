import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET — admin: all plans
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const plans = await prisma.adPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

// PATCH — admin: update a plan
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await req.json();
  const { planId, name, price, durationDays, minVisitorsDay, maxVisitorsDay, description, features, isActive } = body;

  if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (price !== undefined) data.price = price;
  if (durationDays !== undefined) data.durationDays = durationDays;
  if (minVisitorsDay !== undefined) data.minVisitorsDay = minVisitorsDay;
  if (maxVisitorsDay !== undefined) data.maxVisitorsDay = maxVisitorsDay;
  if (description !== undefined) data.description = description;
  if (features !== undefined) data.features = features;
  if (isActive !== undefined) data.isActive = isActive;

  const plan = await prisma.adPlan.update({
    where: { id: planId },
    data,
  });

  return NextResponse.json(plan);
}
