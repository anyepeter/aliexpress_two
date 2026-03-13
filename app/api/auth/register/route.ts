import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/clerk-react/errors";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractClerkError(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (!first) return "Registration failed. Please try again.";
    switch (first.code) {
      case "form_identifier_exists":
        return "EMAIL_EXISTS";
      case "form_password_pwned":
        return "This password appeared in a data breach. Please choose a different one.";
      case "form_password_too_short":
        return "Password is too short. Use at least 8 characters.";
      case "form_password_no_uppercase":
        return "Password must contain an uppercase letter.";
      case "form_password_no_digit":
        return "Password must contain a number.";
      case "form_password_no_special_char":
        return "Password must contain a special character.";
      default:
        return first.longMessage ?? first.message ?? "Registration failed. Please try again.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Registration failed. Please try again.";
}

export async function POST(req: NextRequest) {
  let clerkUserId: string | null = null;

  try {
    const body = await req.json() as {
      role?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
      storeName?: string;
      // Extended seller fields (optional — from multi-step form)
      description?: string;
      businessRegNo?: string;
      logoUrl?: string;
      bannerUrl?: string;
      country?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      street?: string;
      idDocumentUrl?: string;
      taxDocumentUrl?: string;
    };

    const { role, firstName, lastName, email, password, phone } = body;

    // Validate required base fields
    if (!role || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (role === "SELLER" && !body.storeName) {
      return NextResponse.json(
        { error: "Store name is required for seller accounts." },
        { status: 400 }
      );
    }

    // Check for existing email in DB
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    }

    // Check for duplicate store name
    if (role === "SELLER" && body.storeName) {
      const existingStore = await prisma.store.findUnique({
        where: { storeName: body.storeName },
      });
      if (existingStore) {
        return NextResponse.json({ error: "STORE_NAME_EXISTS" }, { status: 409 });
      }
    }

    // Create Clerk user
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: {
        role,
        status: role === "SELLER" ? "PENDING_APPROVAL" : "ACTIVE",
      },
    });
    clerkUserId = clerkUser.id;

    // Create Prisma user + optional store
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        firstName,
        lastName,
        phone: phone || null,
        password,
        role: role as Role,
        status: role === "SELLER" ? "PENDING_APPROVAL" : "ACTIVE",
        ...(role === "SELLER" && body.storeName
          ? {
              store: {
                create: {
                  storeName: body.storeName,
                  storeSlug: generateSlug(body.storeName),
                  description: body.description ?? "",
                  businessType: "Individual",
                  businessRegNo: body.businessRegNo || null,
                  logoUrl: body.logoUrl || null,
                  bannerUrl: body.bannerUrl || null,
                  idDocumentUrl: body.idDocumentUrl || null,
                  taxDocumentUrl: body.taxDocumentUrl || null,
                  country: body.country ?? "CM",
                  city: body.city ?? "",
                  state: body.state || null,
                  postalCode: body.postalCode || null,
                },
              },
              ...(body.street
                ? {
                    addresses: {
                      create: {
                        label: "Store",
                        street: body.street,
                        city: body.city ?? "",
                        state: body.state || null,
                        country: body.country ?? "CM",
                        postalCode: body.postalCode || null,
                        isDefault: true,
                      },
                    },
                  }
                : {}),
            }
          : {}),
      },
      include: { store: true },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      clerkId: clerkUser.id,
    });
  } catch (error) {
    // Rollback Clerk user if Prisma fails
    if (clerkUserId) {
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(clerkUserId);
      } catch {
        console.error("[register] Clerk rollback failed for:", clerkUserId);
      }
    }

    console.error("[register] error:", error);
    const message = extractClerkError(error);

    if (message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    }

    const status = isClerkAPIResponseError(error) ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
