"use client";

import { Search } from "lucide-react";

interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
        />
      </div>
    </div>
  );
}
