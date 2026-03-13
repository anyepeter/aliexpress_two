"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";

interface MessageButtonProps {
  targetUserId: string;
  subject?: string;
  orderId?: string;
  label?: string;
  variant?: "primary" | "secondary" | "gold" | "inline";
  className?: string;
}

export default function MessageButton({
  targetUserId,
  subject,
  orderId,
  label = "Message",
  variant = "secondary",
  className = "",
}: MessageButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/messages/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          subject,
          orderId,
        }),
      });
      if (res.ok) {
        const { conversationId } = await res.json();
        router.push(`/messages?c=${conversationId}`);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const variantClasses = {
    primary:
      "px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors",
    secondary:
      "px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors",
    gold:
      "px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors shadow-sm",
    inline:
      "flex items-center gap-1 text-xs font-medium text-[#E53935] hover:text-[#E53935] transition-colors",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageSquare className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
