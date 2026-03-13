"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀", "😂", "🥹", "😊", "😍", "🤩", "😘", "😜",
    "🤔", "😎", "🥳", "😇", "🫡", "🤗", "😶", "🙄",
  ],
  Gestures: [
    "👍", "👎", "👋", "🤝", "🙏", "💪", "✌️", "🤞",
    "👏", "🤲", "🫶", "❤️", "🔥", "⭐", "✅", "💯",
  ],
  Objects: [
    "📦", "💰", "💳", "🛒", "📱", "💻", "📧", "🔔",
    "📋", "✏️", "📎", "🔗", "📷", "🎤", "🔒", "⏰",
  ],
  Symbols: [
    "✨", "💫", "🎉", "🎊", "🏷️", "🚀", "💡", "⚡",
    "🔴", "🟢", "🔵", "⚠️", "❌", "❓", "💬", "👀",
  ],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Smileys");

  const categories = Object.keys(EMOJI_CATEGORIES) as (keyof typeof EMOJI_CATEGORIES)[];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        type="button"
        aria-label="Open emoji picker"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-12 left-0 z-20 w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Category tabs */}
            <div className="flex border-b border-gray-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-2 text-[10px] font-medium transition-colors ${
                    activeCategory === cat
                      ? "text-[#E53935] border-b-2 border-[#E53935]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[160px] overflow-y-auto">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map(
                (emoji, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelect(emoji);
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-md transition-colors"
                    type="button"
                    aria-label={`Emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
