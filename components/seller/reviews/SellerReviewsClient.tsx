"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, Loader2, Clock } from "lucide-react";

interface ReviewBuyer {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Review {
  id: string;
  storeId: string;
  buyerId: string;
  orderId: string;
  itemRating: number;
  communicationRating: number;
  shippingRating: number;
  overallRating: number;
  comment: string | null;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: ReviewBuyer;
}

interface StoreSummary {
  displayRating: number | null;
  averageRating: number | null;
  totalReviews: number;
  itemRatingAvg: number | null;
  commsRatingAvg: number | null;
  shippingRatingAvg: number | null;
}

interface Props {
  reviews: Review[];
  storeSummary: StoreSummary;
}

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
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
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
        {value?.toFixed(1) ?? "—"}
      </span>
    </div>
  );
}

export default function SellerReviewsClient({ reviews: initialReviews, storeSummary }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unreplied" | "replied">("all");

  const filtered = reviews.filter((r) => {
    if (filter === "unreplied") return !r.sellerReply;
    if (filter === "replied") return !!r.sellerReply;
    return true;
  });

  const unrepliedCount = reviews.filter((r) => !r.sellerReply).length;

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch("/api/store-reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, sellerReply: replyText }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, sellerReply: replyText, sellerRepliedAt: new Date().toISOString() }
              : r
          )
        );
        setReplyingTo(null);
        setReplyText("");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-gray-500 mt-1">
          {storeSummary.totalReviews} review{storeSummary.totalReviews !== 1 ? "s" : ""} total
          {unrepliedCount > 0 && (
            <span className="text-amber-600 ml-2">· {unrepliedCount} awaiting your reply</span>
          )}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Rating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-[#1A1A1A]">
            {storeSummary.displayRating?.toFixed(1) ?? "—"}
          </div>
          <Stars rating={storeSummary.displayRating ?? 0} size="w-5 h-5" />
          <p className="text-xs text-gray-400 mt-2">
            Based on {storeSummary.totalReviews} review{storeSummary.totalReviews !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Rating Breakdown</h3>
          <RatingBar label="Item as Described" value={storeSummary.itemRatingAvg} />
          <RatingBar label="Communication" value={storeSummary.commsRatingAvg} />
          <RatingBar label="Shipping Speed" value={storeSummary.shippingRatingAvg} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: "all", label: `All (${reviews.length})` },
          { key: "unreplied", label: `Needs Reply (${unrepliedCount})` },
          { key: "replied", label: `Replied (${reviews.length - unrepliedCount})` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {filter === "all" ? "No reviews yet" : `No ${filter} reviews`}
          </p>
          {filter === "all" && (
            <p className="text-gray-400 text-sm mt-1">
              Reviews will appear here after buyers rate completed orders.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.buyer.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.buyer.avatarUrl}
                      alt={review.buyer.firstName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                      {review.buyer.firstName[0]?.toUpperCase()}
                      {review.buyer.lastName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.buyer.firstName} {review.buyer.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars rating={review.overallRating} size="w-3.5 h-3.5" />
                      <span className="text-xs font-bold text-gray-700">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="flex gap-4 text-[11px] text-gray-500 mb-3">
                <span>
                  Item: <span className="font-semibold text-gray-700">{review.itemRating}/5</span>
                </span>
                <span>
                  Communication:{" "}
                  <span className="font-semibold text-gray-700">{review.communicationRating}/5</span>
                </span>
                <span>
                  Shipping:{" "}
                  <span className="font-semibold text-gray-700">{review.shippingRating}/5</span>
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3">
                  &quot;{review.comment}&quot;
                </p>
              )}

              {/* Seller Reply */}
              {review.sellerReply ? (
                <div className="bg-[#E53935]/5 border border-[#E53935]/10 rounded-xl p-3 ml-6">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3 h-3 text-[#E53935]" />
                    <span className="text-[11px] font-bold text-[#E53935]">Your Reply</span>
                    {review.sellerRepliedAt && (
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {new Date(review.sellerRepliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{review.sellerReply}</p>
                </div>
              ) : (
                <div className="ml-6">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        maxLength={500}
                        placeholder="Write your reply to this customer..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText.trim() || replyLoading}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#E53935] text-white text-xs font-semibold rounded-lg hover:bg-[#C62828] transition-colors disabled:opacity-50"
                        >
                          {replyLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#E53935] hover:text-[#C62828] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply to this review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
