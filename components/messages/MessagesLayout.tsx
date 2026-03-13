"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useConversationList } from "@/lib/hooks/useConversationList";
import { usePresence } from "@/lib/hooks/usePresence";
import type { UserRole } from "@/lib/types/messages";
import ConversationList from "./ConversationList/ConversationList";
import ChatWindow from "./ChatWindow/ChatWindow";
import StartConversationModal from "./StartConversationModal";

export default function MessagesLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dbUser, isLoading: userLoading } = useCurrentUser();

  const activeConvoId = searchParams.get("c");
  const [showModal, setShowModal] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const { conversations, isLoading: convosLoading, markAsRead, refetch } =
    useConversationList(dbUser?.id ?? null);

  // Set presence online
  usePresence(dbUser?.id ?? null);

  // If c= param set, go to chat on mobile
  useEffect(() => {
    if (activeConvoId) {
      setMobileView("chat");
    }
  }, [activeConvoId]);

  const handleSelectConversation = (id: string) => {
    router.push(`/messages?c=${id}`, { scroll: false });
    setMobileView("chat");
  };

  const handleBack = () => {
    router.push("/messages", { scroll: false });
    setMobileView("list");
  };

  const handleNewConversation = (conversationId: string) => {
    refetch();
    handleSelectConversation(conversationId);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#E53935]/30 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  if (!dbUser) return null;

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Left panel: Conversation list */}
        <div
          className={`w-full md:w-[320px] md:border-r border-gray-100 flex-shrink-0 ${
            mobileView === "chat" ? "hidden md:flex md:flex-col" : "flex flex-col"
          }`}
        >
          <ConversationList
            conversations={conversations}
            isLoading={convosLoading}
            activeConversationId={activeConvoId}
            currentRole={dbUser.role as UserRole}
            onSelect={handleSelectConversation}
            onNewConversation={() => setShowModal(true)}
          />
        </div>

        {/* Right panel: Chat window */}
        <div
          className={`flex-1 min-w-0 ${
            mobileView === "list" ? "hidden md:flex md:flex-col" : "flex flex-col"
          }`}
        >
          <ChatWindow
            conversationId={activeConvoId}
            currentUserId={dbUser.id}
            onBack={handleBack}
            onMarkRead={markAsRead}
          />
        </div>
      </div>

      <StartConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStartConversation={handleNewConversation}
        currentRole={dbUser.role as UserRole}
      />
    </>
  );
}
