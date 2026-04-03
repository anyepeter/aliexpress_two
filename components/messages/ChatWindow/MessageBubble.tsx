"use client";

import { useState } from "react";
import { Check, CheckCheck, Download } from "lucide-react";
import type { MessageData } from "@/lib/types/messages";
import VoiceMessageBubble from "./VoiceMessageBubble";
import ImageLightbox from "./ImageLightbox";

interface MessageBubbleProps {
  message: MessageData;
  isSent: boolean;
  showAvatar: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TickIcon({ status }: { status: string }) {
  if (status === "READ") {
    return <CheckCheck className="w-3.5 h-3.5 text-[#2196F3]" />;
  }
  if (status === "DELIVERED") {
    return <CheckCheck className="w-3.5 h-3.5 text-white/50" />;
  }
  return <Check className="w-3.5 h-3.5 text-white/50" />;
}

export default function MessageBubble({
  message,
  isSent,
  showAvatar,
}: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // SYSTEM messages
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-3 px-4">
        <span className="text-[11px] text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const sender = message.sender;

  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} px-4 mb-1 ${
        showAvatar ? "mt-2" : ""
      }`}
    >
      {/* Avatar for received messages */}
      {!isSent && (
        <div className="w-7 mr-2 flex-shrink-0">
          {showAvatar ? (
            sender.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sender.avatarUrl}
                alt={sender.firstName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E53935] flex items-center justify-center text-white text-[10px] font-bold">
                {sender.firstName[0]?.toUpperCase()}
              </div>
            )
          ) : null}
        </div>
      )}

      <div
        className={`max-w-[65%] rounded-2xl px-3 py-2 ${
          isSent
            ? "bg-[#0F2540] text-white rounded-br"
            : "bg-[#E4E6EB] text-[#1A1A1A] rounded-bl"
        }`}
      >
        {/* Admin badge for received admin messages */}
        {!isSent && sender.role === "ADMIN" && showAvatar && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[9px] font-bold text-[#E53935] bg-[#E53935]/10 px-1.5 py-0.5 rounded-full">
              Customer Support
            </span>
          </div>
        )}

        {/* IMAGE */}
        {message.type === "IMAGE" && message.fileUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-[240px] rounded-xl cursor-pointer mb-1"
              onClick={() => setLightboxOpen(true)}
            />
            {lightboxOpen && (
              <ImageLightbox
                src={message.fileUrl}
                alt="Shared image"
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </>
        )}

        {/* FILE */}
        {message.type === "FILE" && message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg mb-1 transition-colors ${
              isSent ? "bg-white/10 hover:bg-white/20" : "bg-white hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">📎</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${isSent ? "text-white" : "text-[#1A1A1A]"}`}>
                {message.fileName ?? "File"}
              </p>
              <p className={`text-[10px] ${isSent ? "text-white/50" : "text-gray-400"}`}>
                {formatFileSize(message.fileSize)}
              </p>
            </div>
            <Download className={`w-4 h-4 ${isSent ? "text-white/60" : "text-gray-400"}`} />
          </a>
        )}

        {/* VOICE */}
        {message.type === "VOICE" && message.fileUrl && (
          <VoiceMessageBubble
            fileUrl={message.fileUrl}
            audioDuration={message.audioDuration}
            isSent={isSent}
            messageId={message.id}
          />
        )}

        {/* TEXT content */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Time + ticks */}
        <div className={`flex items-center gap-1 mt-1 ${isSent ? "justify-end" : "justify-end"}`}>
          <span className={`text-[10px] ${isSent ? "text-white/50" : "text-gray-400"}`}>
            {formatTime(message.createdAt)}
          </span>
          {isSent && <TickIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
