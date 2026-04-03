"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import type { ConversationPreview, MessageData } from "@/lib/types/messages";

export function useConversationList(currentUserId: string | null) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscribedChannels = useRef<Set<string>>(new Set());

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Poll every 5 seconds as fallback when Pusher isn't working
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Subscribe to Pusher channels for each conversation
  useEffect(() => {
    if (!currentUserId || conversations.length === 0) return;

    const pusher = getPusherClient();

    conversations.forEach((convo) => {
      const channelName = `private-conversation-${convo.id}`;
      if (subscribedChannels.current.has(channelName)) return;

      const channel = pusher.subscribe(channelName);
      subscribedChannels.current.add(channelName);

      channel.bind("new-message", (message: MessageData) => {
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== convo.id) return c;

            // Build preview text
            let preview = message.content ?? "";
            if (!preview) {
              if (message.type === "IMAGE") preview = "\ud83d\udcf7 Photo";
              else if (message.type === "FILE") preview = `\ud83d\udcce ${message.fileName ?? "File"}`;
              else if (message.type === "VOICE") preview = "\ud83c\udfa4 Voice message";
            }
            if (preview.length > 60) preview = preview.slice(0, 60) + "...";

            return {
              ...c,
              lastMessage: preview,
              lastMessageAt: message.createdAt,
              unreadCount:
                message.senderId !== currentUserId
                  ? c.unreadCount + 1
                  : c.unreadCount,
            };
          });
          // Re-sort by lastMessageAt desc
          return updated.sort((a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });
        });
      });

      channel.bind(
        "user-online",
        (data: { userId: string }) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.otherParticipant?.id === data.userId
                ? { ...c, otherParticipant: { ...c.otherParticipant, isOnline: true } }
                : c
            )
          );
        }
      );

      channel.bind(
        "user-offline",
        (data: { userId: string; lastSeenAt: string }) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.otherParticipant?.id === data.userId
                ? {
                    ...c,
                    otherParticipant: {
                      ...c.otherParticipant,
                      isOnline: false,
                      lastSeenAt: data.lastSeenAt,
                    },
                  }
                : c
            )
          );
        }
      );
    });

    return () => {
      subscribedChannels.current.forEach((ch) => {
        pusher.unsubscribe(ch);
      });
      subscribedChannels.current.clear();
    };
  }, [conversations.length, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    isLoading,
    totalUnread,
    markAsRead,
    refetch: fetchConversations,
  };
}
