"use client";

import { useUser } from "@clerk/nextjs";

export interface UserRoleData {
  role: "ADMIN" | "SELLER" | "BUYER" | null;
  status: string | null;
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  isLoading: boolean;
}

export function useUserRole(): UserRoleData {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return {
      role: null,
      status: null,
      isAdmin: false,
      isSeller: false,
      isBuyer: false,
      isLoading: true,
    };
  }

  const role = (user?.publicMetadata?.role as
    | "ADMIN"
    | "SELLER"
    | "BUYER"
    | null) ?? null;
  const status = (user?.publicMetadata?.status as string | null) ?? null;

  return {
    role,
    status,
    isAdmin: role === "ADMIN",
    isSeller: role === "SELLER",
    isBuyer: role === "BUYER",
    isLoading: false,
  };
}
