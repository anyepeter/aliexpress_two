"use client";

interface TypingIndicatorProps {
  userName: string;
  avatarUrl?: string | null;
}

export default function TypingIndicator({ userName, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 px-4 mb-2">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={userName}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-[#E53935] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {userName[0]?.toUpperCase()}
        </div>
      )}
      <div className="bg-[#F0F2F5] rounded-2xl rounded-bl px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400"
              style={{
                animation: "typingBounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
