"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import type { MessageData } from "@/lib/types/messages";

export function useConversation(conversationId: string | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const channelRef = useRef<string | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/messages/conversations/${conversationId}/messages?limit=30`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setNextCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!conversationId || !nextCursor) return;
    try {
      const res = await fetch(
        `/api/messages/conversations/${conversationId}/messages?cursor=${nextCursor}&limit=30`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...data.messages, ...prev]);
        setNextCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch {
      // silent
    }
  }, [conversationId, nextCursor]);

  // Mark as read on open + poll for new messages as Pusher fallback
  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
    fetch(`/api/messages/conversations/${conversationId}`, { method: "PATCH" });

    // Poll every 4 seconds as fallback when Pusher isn't working
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages/conversations/${conversationId}/messages?limit=30`
        );
        if (res.ok) {
          const data = await res.json();
          const serverMessages = data.messages as MessageData[];
          setMessages((prev) => {
            const serverMap = new Map(serverMessages.map((m) => [m.id, m]));
            // Update existing messages (status changes like SENT→READ) + add new ones
            const updated = prev.map((m) => {
              const serverVersion = serverMap.get(m.id);
              if (serverVersion && serverVersion.status !== m.status) {
                return { ...m, status: serverVersion.status, readAt: serverVersion.readAt };
              }
              return m;
            });
            // Add truly new messages
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = serverMessages.filter((m) => !existingIds.has(m.id));
            if (newMsgs.length === 0 && updated.every((m, i) => m === prev[i])) return prev;
            return [...updated, ...newMsgs];
          });
        }
      } catch { /* silent */ }
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  // Subscribe to Pusher
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const pusher = getPusherClient();
    const channelName = `private-conversation-${conversationId}`;
    channelRef.current = channelName;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (message: MessageData) => {
      setMessages((prev) => {
        // Deduplicate
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Auto-mark as read if message is from other party
      if (message.senderId !== currentUserId) {
        fetch(`/api/messages/conversations/${conversationId}`, {
          method: "PATCH",
        });
      }
    });

    channel.bind(
      "message-read",
      (data: { messageIds: string[]; readAt: string }) => {
        const idSet = new Set(data.messageIds);
        setMessages((prev) =>
          prev.map((m) =>
            idSet.has(m.id)
              ? { ...m, status: "READ" as const, readAt: data.readAt }
              : m
          )
        );
      }
    );

    channel.bind("typing-start", (data: { userId: string; userName: string }) => {
      if (data.userId === currentUserId) return;
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.userName));

      // Clear any existing timeout
      const existing = typingTimeouts.current.get(data.userId);
      if (existing) clearTimeout(existing);

      // Auto-clear after 3s
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }, 3000);
      typingTimeouts.current.set(data.userId, timeout);
    });

    channel.bind("typing-stop", (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
      const existing = typingTimeouts.current.get(data.userId);
      if (existing) clearTimeout(existing);
    });

    return () => {
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      typingTimeouts.current.forEach((t) => clearTimeout(t));
      typingTimeouts.current.clear();
    };
  }, [conversationId, currentUserId]);

  // Send message
  const sendMessage = useCallback(
    async (body: {
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      audioDuration?: number;
      type?: string;
    }) => {
      if (!conversationId) return null;
      try {
        const res = await fetch(
          `/api/messages/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // silent
      }
      return null;
    },
    [conversationId]
  );

  // Typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, isTyping }),
      });
    },
    [conversationId]
  );

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    sendTyping,
    typingUsers,
  };
}
