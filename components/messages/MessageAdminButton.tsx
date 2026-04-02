"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";

interface MessageAdminButtonProps {
  subject?: string;
  orderId?: string;
  label?: string;
  variant?: "primary" | "secondary" | "inline";
  className?: string;
}

export default function MessageAdminButton({
  subject,
  orderId,
  label = "Message Support",
  variant = "secondary",
  className = "",
}: MessageAdminButtonProps) {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/info")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAdminId(data.id);
      });
  }, []);

  const handleClick = async () => {
    if (!adminId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/messages/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: adminId,
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

  if (!adminId) return null;

  const variantClasses = {
    primary:
      "px-4 py-2 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors",
    secondary:
      "px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors",
    inline:
      "text-xs font-medium text-[#E53935] hover:text-[#E53935] transition-colors",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-1.5 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <MessageSquare className="w-3.5 h-3.5" />
      )}
      {label}
    </button>
  );
}
