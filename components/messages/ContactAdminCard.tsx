"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, ShieldCheck } from "lucide-react";

interface ContactAdminCardProps {
  subject?: string;
  orderId?: string;
}

export default function ContactAdminCard({ subject = "Payment & Support", orderId }: ContactAdminCardProps) {
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

  const handleContact = async () => {
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

  return (
    <div className="bg-gradient-to-r from-[#E53935]/5 to-[#E53935]/5 rounded-2xl border border-[#E53935]/20 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[#E53935]/10 flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#E53935]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Need to make a payment or have a question?
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Our customer support team is available to help with order funding, payments, and account support.
          </p>
          <button
            onClick={handleContact}
            disabled={isLoading}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-semibold rounded-xl hover:bg-[#C62828] transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
