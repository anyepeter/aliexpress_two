"use client";

import { useState, useMemo } from "react";
import { Edit3 } from "lucide-react";
import type { ConversationPreview, UserRole } from "@/lib/types/messages";
import ConversationTabs from "./ConversationTabs";
import ConversationSearch from "./ConversationSearch";
import ConversationRow from "./ConversationRow";
import ConversationEmpty from "./ConversationEmpty";

interface ConversationListProps {
  conversations: ConversationPreview[];
  isLoading: boolean;
  activeConversationId: string | null;
  currentRole: UserRole;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  conversations,
  isLoading,
  activeConversationId,
  currentRole,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = conversations;

    // Filter by tab
    if (activeTab !== "all") {
      list = list.filter((c) => {
        const otherRole = c.otherParticipant?.role;
        if (activeTab === "buyers") return otherRole === "BUYER";
        if (activeTab === "sellers") return otherRole === "SELLER";
        if (activeTab === "admin") return otherRole === "ADMIN";
        return true;
      });
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const name = `${c.otherParticipant?.firstName ?? ""} ${c.otherParticipant?.lastName ?? ""}`.toLowerCase();
        const subject = c.subject?.toLowerCase() ?? "";
        return name.includes(q) || subject.includes(q);
      });
    }

    return list;
  }, [conversations, activeTab, search]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2">
          <span>Messages</span>
        </h2>
        <button
          onClick={onNewConversation}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#E53935] transition-colors"
          title="New conversation"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      <ConversationSearch value={search} onChange={setSearch} />
      <ConversationTabs
        currentRole={currentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <ConversationEmpty role={currentRole} onNewConversation={onNewConversation} />
        ) : (
          filtered.map((convo) => (
            <ConversationRow
              key={convo.id}
              conversation={convo}
              isActive={convo.id === activeConversationId}
              onClick={() => onSelect(convo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
