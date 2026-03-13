"use client";

import { useEffect, useRef } from "react";

export function usePresence(userId: string | null) {
  const hasSetOnline = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const setPresence = (isOnline: boolean) => {
      fetch("/api/pusher/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline }),
      });
    };

    if (!hasSetOnline.current) {
      setPresence(true);
      hasSetOnline.current = true;
    }

    const handleVisibility = () => {
      setPresence(!document.hidden);
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability on page close
      navigator.sendBeacon(
        "/api/pusher/presence",
        new Blob([JSON.stringify({ isOnline: false })], {
          type: "application/json",
        })
      );
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setPresence(false);
    };
  }, [userId]);
}
