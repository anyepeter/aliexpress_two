import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import MessagesLayout from "@/components/messages/MessagesLayout";

export const metadata: Metadata = {
  title: "Messages — AliExpress",
};

export default async function MessagesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      store: {
        select: { storeName: true, logoUrl: true },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const role = user.role as "ADMIN" | "SELLER" | "BUYER";

  return (
    <DashboardLayout
      role={role}
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        store: user.store
          ? { storeName: user.store.storeName, logoUrl: user.store.logoUrl }
          : null,
      }}
    >
      <MessagesLayout />
    </DashboardLayout>
  );
}
