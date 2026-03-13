"use client";

import type { ConversationPreview } from "@/lib/types/messages";

interface ConversationRowProps {
  conversation: ConversationPreview;
  isActive: boolean;
  onClick: () => void;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return (
        <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 px-1.5 py-0.5 rounded-full">
          Admin
        </span>
      );
    case "SELLER":
      return (
        <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 px-1.5 py-0.5 rounded-full">
          Seller {"\u2713"}
        </span>
      );
    default:
      return (
        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
          Buyer
        </span>
      );
  }
}

export default function ConversationRow({
  conversation,
  isActive,
  onClick,
}: ConversationRowProps) {
  const { otherParticipant: other, lastMessage, lastMessageAt, unreadCount, subject } =
    conversation;

  if (!other) return null;

  const hasUnread = unreadCount > 0;
  const displayName = `${other.firstName} ${other.lastName}`;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${
        isActive
          ? "bg-[#E53935]/5 border-l-[3px] border-[#E53935]"
          : "hover:bg-[#F5F6FA] border-l-[3px] border-transparent"
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0">
        {other.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={other.avatarUrl}
            alt={displayName}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
            {other.firstName[0]?.toUpperCase()}
            {other.lastName[0]?.toUpperCase()}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            other.isOnline ? "bg-[#16A34A]" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-sm truncate ${
                hasUnread ? "font-bold text-[#1A1A1A]" : "font-medium text-gray-700"
              }`}
            >
              {displayName}
            </span>
            {getRoleBadge(other.role)}
          </div>
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            {formatTime(lastMessageAt)}
          </span>
        </div>

        {subject && (
          <p className="text-[11px] text-[#E53935] font-medium truncate mt-0.5">
            {subject}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              hasUnread ? "text-gray-700 font-medium" : "text-gray-400"
            }`}
          >
            {lastMessage ?? "No messages yet"}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center bg-[#E53935] text-white text-[10px] font-bold rounded-full px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
