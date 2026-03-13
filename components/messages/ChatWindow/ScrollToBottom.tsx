"use client";

import { ChevronDown } from "lucide-react";

interface ScrollToBottomProps {
  onClick: () => void;
  visible: boolean;
}

export default function ScrollToBottom({ onClick, visible }: ScrollToBottomProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#E53935] hover:shadow-xl transition-all"
      aria-label="Scroll to bottom"
    >
      <ChevronDown className="w-5 h-5" />
    </button>
  );
}
