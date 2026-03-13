"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export interface DbUser {
  id: string;
  clerkId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "SELLER" | "BUYER";
  status: string;
  avatarUrl: string | null;
  store: {
    storeName: string;
    storeSlug: string;
    isVerified: boolean;
    logoUrl: string | null;
  } | null;
}

export function useCurrentUser() {
  const { userId, isLoaded } = useAuth();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      setDbUser(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DbUser | null) => {
        if (!cancelled) {
          setDbUser(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded]);

  return { dbUser, isLoading };
}
