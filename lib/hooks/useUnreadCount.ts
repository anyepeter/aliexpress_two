"use client";

import { useState, useEffect, useCallback } from "react";
import type { ConversationPreview } from "@/lib/types/messages";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data: ConversationPreview[] = await res.json();
        const total = data.reduce((sum, c) => sum + c.unreadCount, 0);
        setUnreadCount(total);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    // Poll every 30 seconds as a fallback
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { unreadCount, refetch: fetchUnread };
}
