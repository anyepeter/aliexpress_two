"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, MessageSquare, ShieldCheck, Store, User } from "lucide-react";
import type { UserRole } from "@/lib/types/messages";

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  store?: { storeName: string; storeSlug: string; isVerified: boolean } | null;
}

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (conversationId: string) => void;
  currentRole: UserRole;
  prefillTargetId?: string | null;
  prefillSubject?: string | null;
}

const ALLOWED_TARGET_ROLES: Record<UserRole, UserRole[]> = {
  BUYER: ["SELLER", "ADMIN"],
  SELLER: ["ADMIN"],
  ADMIN: ["BUYER", "SELLER"],
};

const ROLE_CONFIG: Record<UserRole, { label: string; pluralLabel: string; icon: typeof User; color: string; bg: string }> = {
  ADMIN: { label: "Admin", pluralLabel: "Admins", icon: ShieldCheck, color: "text-[#E53935]", bg: "bg-[#E53935]/10" },
  SELLER: { label: "Seller", pluralLabel: "Sellers", icon: Store, color: "text-[#E53935]", bg: "bg-[#E53935]/10" },
  BUYER: { label: "Buyer", pluralLabel: "Buyers", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function StartConversationModal({
  isOpen,
  onClose,
  onStartConversation,
  currentRole,
  prefillTargetId,
  prefillSubject,
}: StartConversationModalProps) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(prefillSubject ?? "");
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (prefillSubject) setSubject(prefillSubject);
  }, [prefillSubject]);

  // Auto-start if prefillTargetId is provided
  useEffect(() => {
    if (isOpen && prefillTargetId) {
      handleStart(prefillTargetId);
    }
  }, [isOpen, prefillTargetId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all available contacts when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setAllUsers([]);
      return;
    }

    const loadContacts = async () => {
      setIsLoadingUsers(true);
      try {
        const allowedRoles = ALLOWED_TARGET_ROLES[currentRole];
        const res = await fetch(
          `/api/messages/conversations/search-users?all=true&roles=${allowedRoles.join(",")}`
        );
        if (res.ok) {
          setAllUsers(await res.json());
        }
      } catch {
        // silent
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadContacts();
  }, [isOpen, currentRole]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        (u.store?.storeName ?? "").toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  // Group users by role
  const groupedUsers = useMemo(() => {
    const groups: Record<string, UserResult[]> = {};
    const allowedRoles = ALLOWED_TARGET_ROLES[currentRole];
    for (const role of allowedRoles) {
      const usersForRole = filteredUsers.filter((u) => u.role === role);
      if (usersForRole.length > 0) {
        groups[role] = usersForRole;
      }
    }
    return groups;
  }, [filteredUsers, currentRole]);

  const handleStart = async (targetUserId: string) => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/messages/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          subject: subject.trim() || undefined,
        }),
      });
      if (res.ok) {
        const { conversationId } = await res.json();
        onStartConversation(conversationId);
        onClose();
      }
    } catch {
      // silent
    } finally {
      setIsStarting(false);
    }
  };

  if (!isOpen) return null;

  const roleKeys = Object.keys(groupedUsers) as UserRole[];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E53935]" />
            <h3 className="font-bold text-[#1A1A1A]">New Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search filter */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter contacts..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
              autoFocus
            />
          </div>

          {/* Subject input */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional) — e.g. Question about iPhone 15"
            className="w-full mt-3 px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
          />
        </div>

        {/* Contacts list */}
        <div className="max-h-[320px] overflow-y-auto px-5 py-3">
          {isLoadingUsers && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#E53935]/30 border-t-[#E53935] rounded-full animate-spin" />
            </div>
          )}

          {!isLoadingUsers && filteredUsers.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              {search ? "No contacts match your search" : "No contacts available"}
            </p>
          )}

          {!isLoadingUsers &&
            roleKeys.map((role) => {
              const config = ROLE_CONFIG[role];
              const RoleIcon = config.icon;
              const users = groupedUsers[role];

              return (
                <div key={role} className="mb-3 last:mb-0">
                  {/* Role group header */}
                  <div className="flex items-center gap-2 px-1 py-1.5 mb-1">
                    <RoleIcon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                      {config.pluralLabel}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({users.length})
                    </span>
                  </div>

                  {/* User rows */}
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStart(user.id)}
                      disabled={isStarting}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                    >
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
                          {user.firstName[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {user.firstName} {user.lastName}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}
                          >
                            {role}
                          </span>
                        </div>
                        {user.store?.storeName && (
                          <p className="text-xs text-gray-400 truncate">
                            {user.store.storeName}
                            {user.store.isVerified && " \u2713"}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
