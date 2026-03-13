import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; storeName?: string };
    const { email, storeName } = body;

    let emailExists = false;
    let storeNameExists = false;

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      emailExists = !!user;
    }

    if (storeName) {
      const store = await prisma.store.findUnique({ where: { storeName } });
      storeNameExists = !!store;
    }

    return NextResponse.json({ emailExists, storeNameExists });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
