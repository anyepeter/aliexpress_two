"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { MessageData, ConversationParticipant } from "@/lib/types/messages";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import TypingIndicator from "./TypingIndicator";
import ScrollToBottom from "./ScrollToBottom";

interface MessagesListProps {
  messages: MessageData[];
  currentUserId: string;
  typingUsers: Map<string, string>;
  otherParticipant: ConversationParticipant | null;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export default function MessagesList({
  messages,
  currentUserId,
  typingUsers,
  otherParticipant,
  hasMore,
  onLoadMore,
  isLoading,
}: MessagesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAutoScrolling = useRef(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAutoScrolling.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAutoScrolling.current = distFromBottom < 100;
    setShowScrollBtn(distFromBottom > 300);

    // Load more when scrolled near top
    if (el.scrollTop < 50 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-0 py-4"
      >
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#E53935]/30 border-t-[#E53935] rounded-full animate-spin" />
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt);
          const showAvatar =
            !prev ||
            prev.senderId !== msg.senderId ||
            showDate;

          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={msg.createdAt} />}
              <MessageBubble
                message={msg}
                isSent={msg.senderId === currentUserId}
                showAvatar={showAvatar}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.size > 0 && otherParticipant && (
          <TypingIndicator
            userName={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
            avatarUrl={otherParticipant.avatarUrl}
          />
        )}

        <div ref={bottomRef} />
      </div>

      <ScrollToBottom onClick={scrollToBottom} visible={showScrollBtn} />
    </div>
  );
}
