"use client";

import { MessageSquare } from "lucide-react";
import type { UserRole } from "@/lib/types/messages";

interface ConversationEmptyProps {
  role: UserRole;
  onNewConversation: () => void;
}

const EMPTY_MESSAGES: Record<UserRole, string> = {
  BUYER:
    "No conversations yet — browse products and message a seller, or contact customer support from your orders page.",
  SELLER:
    "No conversations yet — buyers will message you about your products. You can also contact customer support about payments.",
  ADMIN:
    "No conversations yet — buyers and sellers will reach you here.",
};

export default function ConversationEmpty({ role, onNewConversation }: ConversationEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E53935]/10 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-[#E53935]" />
      </div>
      <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed mb-5">
        {EMPTY_MESSAGES[role]}
      </p>
      <button
        onClick={onNewConversation}
        className="px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-lg hover:bg-[#C62828] transition-colors"
      >
        + Start Conversation
      </button>
    </div>
  );
}
