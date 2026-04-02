import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/shared/DashboardLayout";
import SellerReviewsClient from "@/components/seller/reviews/SellerReviewsClient";

export default async function SellerReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth?tab=login");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { store: { select: { id: true, averageRating: true, totalReviews: true, itemRatingAvg: true, commsRatingAvg: true, shippingRatingAvg: true, ratingOverride: true } } },
  });

  if (!user) redirect("/auth?tab=login");
  if (user.role !== "SELLER") redirect("/");
  if (!user.store) redirect("/seller/become-seller");

  const reviews = await prisma.storeReview.findMany({
    where: { storeId: user.store.id },
    include: {
      buyer: { select: { firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    sellerRepliedAt: r.sellerRepliedAt?.toISOString() ?? null,
  }));

  return (
    <DashboardLayout
      role="SELLER"
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
      }}
    >
      <SellerReviewsClient
        reviews={serializedReviews}
        storeSummary={{
          displayRating: user.store.ratingOverride ?? user.store.averageRating ?? null,
          averageRating: user.store.averageRating ?? null,
          totalReviews: user.store.totalReviews,
          itemRatingAvg: user.store.itemRatingAvg ?? null,
          commsRatingAvg: user.store.commsRatingAvg ?? null,
          shippingRatingAvg: user.store.shippingRatingAvg ?? null,
        }}
      />
    </DashboardLayout>
  );
}
