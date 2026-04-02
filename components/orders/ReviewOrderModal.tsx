"use client";

import { useState } from "react";
import { X, Star, Loader2, CheckCircle2 } from "lucide-react";

interface ReviewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  storeName: string;
  onReviewSubmitted: () => void;
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewOrderModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  storeName,
  onReviewSubmitted,
}: ReviewOrderModalProps) {
  const [itemRating, setItemRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [shippingRating, setShippingRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const canSubmit = itemRating > 0 && communicationRating > 0 && shippingRating > 0;
  const avgRating = canSubmit
    ? ((itemRating + communicationRating + shippingRating) / 3).toFixed(1)
    : "0.0";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/store-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          itemRating,
          communicationRating,
          shippingRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onReviewSubmitted();
        onClose();
      }, 1500);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[460px] max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-[#1A1A1A]">Rate Your Experience</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Order #{orderNumber} · {storeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-[#1A1A1A]">Thank you!</p>
            <p className="text-sm text-gray-500 mt-1">Your review has been submitted.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Rating categories */}
            <div className="space-y-4 bg-gray-50 rounded-xl p-4">
              <StarRating
                label="Item as Described"
                value={itemRating}
                onChange={setItemRating}
              />
              <StarRating
                label="Communication"
                value={communicationRating}
                onChange={setCommunicationRating}
              />
              <StarRating
                label="Shipping Speed"
                value={shippingRating}
                onChange={setShippingRating}
              />
            </div>

            {/* Average display */}
            {canSubmit && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-[#1A1A1A]">{avgRating}</span>
                <span className="text-gray-400">overall rating</span>
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Share your experience with this seller..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
              />
              <p className="text-[11px] text-gray-400 text-right mt-1">
                {comment.length}/500
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
