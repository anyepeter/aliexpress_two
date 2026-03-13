"use client";

import type { UserRole } from "@/lib/types/messages";

interface ConversationTabsProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS_BY_ROLE: Record<UserRole, { label: string; value: string }[]> = {
  BUYER: [
    { label: "All", value: "all" },
    { label: "Sellers", value: "sellers" },
    { label: "Admin", value: "admin" },
  ],
  SELLER: [
    { label: "All", value: "all" },
    { label: "Buyers", value: "buyers" },
    { label: "Admin", value: "admin" },
  ],
  ADMIN: [
    { label: "All", value: "all" },
    { label: "Buyers", value: "buyers" },
    { label: "Sellers", value: "sellers" },
  ],
};

export default function ConversationTabs({
  currentRole,
  activeTab,
  onTabChange,
}: ConversationTabsProps) {
  const tabs = TABS_BY_ROLE[currentRole];

  return (
    <div className="flex gap-1 px-3 py-2 border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeTab === tab.value
              ? "bg-[#E53935] text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
