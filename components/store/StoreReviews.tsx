"use client";

import { useState, useEffect } from "react";
import { Star, ChevronDown, MessageSquare, ThumbsUp } from "lucide-react";

interface ReviewBuyer {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Review {
  id: string;
  itemRating: number;
  communicationRating: number;
  shippingRating: number;
  overallRating: number;
  comment: string | null;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  createdAt: string;
  buyer: ReviewBuyer;
}

interface ReviewSummary {
  displayRating: number | null;
  averageRating: number | null;
  totalReviews: number;
  itemRatingAvg: number | null;
  commsRatingAvg: number | null;
  shippingRatingAvg: number | null;
}

interface Props {
  storeId: string;
  storeName: string;
}

function Stars({ rating, size = "w-3.5 h-3.5" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-gray-600 w-6 text-right">
        {value?.toFixed(1) ?? "—"}
      </span>
    </div>
  );
}

export default function StoreReviews({ storeId, storeName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReviews = async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/store-reviews?storeId=${storeId}&page=${pageNum}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => append ? [...prev, ...data.reviews] : data.reviews);
        setSummary(data.summary);
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!summary || summary.totalReviews === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <h2 className="text-base font-bold text-[#1A1A1A] mb-4">
        Customer Reviews ({summary.totalReviews})
      </h2>

      {/* Summary Row */}
      <div className="flex gap-6 items-start mb-6 pb-5 border-b border-gray-100">
        {/* Big Rating */}
        <div className="text-center shrink-0">
          <div className="text-3xl font-bold text-[#1A1A1A]">
            {summary.displayRating?.toFixed(1) ?? "—"}
          </div>
          <Stars rating={summary.displayRating ?? 0} size="w-4 h-4" />
          <p className="text-[10px] text-gray-400 mt-1">{summary.totalReviews} reviews</p>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-2">
          <RatingBar label="Item as Described" value={summary.itemRatingAvg} />
          <RatingBar label="Communication" value={summary.commsRatingAvg} />
          <RatingBar label="Shipping Speed" value={summary.shippingRatingAvg} />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            {/* Buyer header */}
            <div className="flex items-center gap-2.5 mb-2">
              {review.buyer.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.buyer.avatarUrl}
                  alt={review.buyer.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                  {review.buyer.firstName[0]?.toUpperCase()}
                  {review.buyer.lastName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">
                    {review.buyer.firstName} {review.buyer.lastName[0]}.
                  </span>
                  <Stars rating={review.overallRating} size="w-3 h-3" />
                  <span className="text-[10px] font-bold text-gray-600">{review.overallRating.toFixed(1)}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-gray-400">
                  <span>Item: {review.itemRating}/5</span>
                  <span>Comms: {review.communicationRating}/5</span>
                  <span>Ship: {review.shippingRating}/5</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">
                {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-gray-700 ml-[42px] mb-2 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Seller Reply */}
            {review.sellerReply && (
              <div className="ml-[42px] bg-gray-50 rounded-lg p-3 border-l-2 border-[#E53935]">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3 h-3 text-[#E53935]" />
                  <span className="text-[10px] font-bold text-[#E53935]">{storeName} replied</span>
                  {review.sellerRepliedAt && (
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(review.sellerRepliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{review.sellerReply}</p>
              </div>
            )}

            {/* Helpful button */}
            {review.comment && (
              <div className="ml-[42px] mt-2">
                <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  Helpful
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={() => fetchReviews(page + 1, true)}
          disabled={loadingMore}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loadingMore ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Show More Reviews
            </>
          )}
        </button>
      )}
    </div>
  );
}
