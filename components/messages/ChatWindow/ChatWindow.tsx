"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useConversation } from "@/lib/hooks/useConversation";
import type { ConversationParticipant } from "@/lib/types/messages";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  conversationId: string | null;
  currentUserId: string;
  onBack?: () => void;
  onMarkRead?: (id: string) => void;
}

interface ConversationDetail {
  id: string;
  type: string;
  subject: string | null;
  orderId: string | null;
  buyer: { id: string; firstName: string; lastName: string; avatarUrl: string | null; role: string; store?: { storeName: string; storeSlug: string; isVerified: boolean } | null } | null;
  seller: { id: string; firstName: string; lastName: string; avatarUrl: string | null; role: string; store?: { storeName: string; storeSlug: string; isVerified: boolean } | null } | null;
  admin: { id: string; firstName: string; lastName: string; avatarUrl: string | null; role: string } | null;
  presences: Record<string, { isOnline: boolean; lastSeenAt: string | null }>;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  onBack,
  onMarkRead,
}: ChatWindowProps) {
  const {
    messages,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    sendTyping,
    typingUsers,
  } = useConversation(conversationId, currentUserId);

  const [convoDetail, setConvoDetail] = useState<ConversationDetail | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConvoDetail(null);
      return;
    }

    fetch(`/api/messages/conversations/${conversationId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setConvoDetail);

    onMarkRead?.(conversationId);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#F5F6FA]">
        <div className="w-20 h-20 rounded-full bg-[#E53935]/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-9 h-9 text-[#E53935]" />
        </div>
        <p className="text-sm text-gray-500 text-center max-w-[260px]">
          Select a conversation to start messaging
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Or start a new conversation using the pencil button
        </p>
      </div>
    );
  }

  // Find other participant from convo detail
  let otherParticipant: ConversationParticipant | null = null;
  if (convoDetail) {
    const participants = [convoDetail.buyer, convoDetail.seller, convoDetail.admin].filter(Boolean);
    const other = participants.find((p) => p!.id !== currentUserId);
    if (other) {
      const presence = convoDetail.presences[other.id];
      const store = "store" in other ? (other as { store?: { storeName: string; storeSlug: string; isVerified: boolean } | null }).store : null;
      otherParticipant = {
        id: other.id,
        firstName: other.firstName,
        lastName: other.lastName,
        avatarUrl: other.avatarUrl,
        role: other.role as ConversationParticipant["role"],
        storeName: store?.storeName,
        storeSlug: store?.storeSlug,
        isVerified: store?.isVerified,
        isOnline: presence?.isOnline ?? false,
        lastSeenAt: presence?.lastSeenAt ?? null,
      };
    }
  }

  const handleSend = async (msg: {
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    audioDuration?: number;
    type?: string;
  }) => {
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6FA]">
      {otherParticipant && (
        <ChatHeader
          participant={otherParticipant}
          subject={convoDetail?.subject}
          orderId={convoDetail?.orderId}
          onBack={onBack}
        />
      )}

      <MessagesList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        otherParticipant={otherParticipant}
        hasMore={hasMore}
        onLoadMore={loadMore}
        isLoading={isLoading}
      />

      <MessageInput
        onSend={handleSend}
        onTyping={sendTyping}
        conversationId={conversationId}
      />
    </div>
  );
}
