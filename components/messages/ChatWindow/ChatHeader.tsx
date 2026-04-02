"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import type { ConversationParticipant } from "@/lib/types/messages";

interface ChatHeaderProps {
  participant: ConversationParticipant;
  subject?: string | null;
  orderId?: string | null;
  onBack?: () => void;
}

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return "Offline";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Last seen just now";
  if (diffMin < 60) return `Last seen ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  return `Last seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

export default function ChatHeader({
  participant,
  subject,
  orderId,
  onBack,
}: ChatHeaderProps) {
  const displayName = participant.role === "ADMIN" ? "Customer Support" : `${participant.firstName} ${participant.lastName}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {participant.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={participant.avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
            {participant.role === "ADMIN" ? "CS" : `${participant.firstName[0]?.toUpperCase()}${participant.lastName[0]?.toUpperCase()}`}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            participant.isOnline ? "bg-[#16A34A]" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#1A1A1A] truncate">
            {displayName}
          </span>
          {participant.role === "ADMIN" && (
            <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Customer Support
            </span>
          )}
          {participant.role === "SELLER" && participant.isVerified && (
            <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Verified Seller
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>
            {participant.isOnline
              ? "Online"
              : formatLastSeen(participant.lastSeenAt)}
          </span>
          {participant.storeName && (
            <>
              <span className="text-gray-300">|</span>
              <span className="truncate">{participant.storeName}</span>
            </>
          )}
        </div>
        {subject && (
          <p className="text-[11px] text-[#E53935] font-medium truncate mt-0.5">
            {subject}
            {orderId && (
              <span className="text-gray-400 ml-1">#{orderId.slice(0, 8)}</span>
            )}
          </p>
        )}
      </div>

      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="More options">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
