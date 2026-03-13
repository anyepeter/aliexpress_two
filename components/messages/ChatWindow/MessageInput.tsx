"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Paperclip, Send, Image as ImageIcon, FileText } from "lucide-react";
import { useVoiceRecorder } from "@/lib/hooks/useVoiceRecorder";
import EmojiPicker from "./EmojiPicker";
import AttachmentPreview from "./AttachmentPreview";
import VoiceRecorder from "./VoiceRecorder";

interface MessageInputProps {
  onSend: (msg: {
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    audioDuration?: number;
    type?: string;
  }) => void;
  onTyping: (isTyping: boolean) => void;
  conversationId: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
];

export default function MessageInput({
  onSend,
  onTyping,
  conversationId,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{
    type: "image" | "file";
    file: File;
    previewUrl?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const voice = useVoiceRecorder();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTyping = useCallback(() => {
    onTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 2000);
  }, [onTyping]);

  const uploadFile = async (file: File): Promise<{ url: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `markethub/messages/${conversationId}`);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return { url: data.url };
      }
    } catch {
      // silent
    }
    return null;
  };

  const uploadVoice = async (blob: Blob, dur: number): Promise<{ url: string; duration: number } | null> => {
    const ext = blob.type.includes("mp4") ? "voice.mp4" : "voice.webm";
    const formData = new FormData();
    formData.append("audio", blob, ext);
    formData.append("conversationId", conversationId);
    formData.append("duration", dur.toString());
    try {
      const res = await fetch("/api/messages/voice", {
        method: "POST",
        body: formData,
      });
      if (res.ok) return res.json();
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      console.error("Voice upload failed:", err);
    } catch (e) {
      console.error("Voice upload error:", e);
    }
    return null;
  };

  const handleSend = async () => {
    if (disabled || isUploading) return;

    // Voice message
    if (voice.audioBlob && voice.previewUrl) {
      setIsUploading(true);
      const result = await uploadVoice(voice.audioBlob, voice.duration);
      setIsUploading(false);
      if (result) {
        onSend({
          type: "VOICE",
          fileUrl: result.url,
          audioDuration: result.duration,
        });
      }
      voice.reset();
      return;
    }

    // Image or file attachment
    if (attachment) {
      setIsUploading(true);
      const result = await uploadFile(attachment.file);
      setIsUploading(false);
      if (result) {
        onSend({
          type: attachment.type === "image" ? "IMAGE" : "FILE",
          content: text.trim() || undefined,
          fileUrl: result.url,
          fileName: attachment.file.name,
          fileSize: attachment.file.size,
        });
      }
      setAttachment(null);
      setText("");
      return;
    }

    // Text only
    if (text.trim()) {
      onSend({ content: text.trim(), type: "TEXT" });
      setText("");
      onTyping(false);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (file: File, type: "image" | "file") => {
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large (max 5MB)");
      return;
    }
    const previewUrl = type === "image" ? URL.createObjectURL(file) : undefined;
    setAttachment({ type, file, previewUrl });
    setShowAttachMenu(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev + emoji);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
    voice.cancel();
  };

  const canSend = !disabled && !isUploading && (text.trim() || attachment || voice.audioBlob);

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Attachment preview */}
      {attachment && (
        <AttachmentPreview
          type={attachment.type}
          name={attachment.file.name}
          size={attachment.file.size}
          previewUrl={attachment.previewUrl}
          onRemove={removeAttachment}
        />
      )}

      {/* Voice preview */}
      {voice.audioBlob && !voice.isRecording && (
        <AttachmentPreview
          type="voice"
          voiceDuration={voice.duration}
          onRemove={() => voice.cancel()}
        />
      )}

      {/* Input row */}
      <div className="flex items-end gap-1 px-3 py-2">
        <EmojiPicker onSelect={handleEmojiSelect} />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled || voice.isRecording}
          className="flex-1 resize-none text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none py-2 px-1 max-h-[120px] leading-relaxed"
        />

        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-lg text-gray-400 hover:text-[#E53935] hover:bg-gray-100 transition-colors"
            type="button"
            disabled={voice.isRecording}
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {showAttachMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
              <div className="absolute bottom-12 right-0 z-20 w-44 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden py-1">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <ImageIcon className="w-4 h-4 text-[#E53935]" />
                  Send Image
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <FileText className="w-4 h-4 text-[#E53935]" />
                  Send File
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && IMAGE_TYPES.includes(file.type)) {
              handleFileSelect(file, "image");
            }
            e.target.value = "";
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && FILE_TYPES.includes(file.type)) {
              handleFileSelect(file, "file");
            }
            e.target.value = "";
          }}
        />

        {/* Voice / Send */}
        {canSend ? (
          <button
            onClick={handleSend}
            disabled={isUploading}
            className="p-2 rounded-lg bg-[#E53935] text-white hover:bg-[#C62828] transition-colors disabled:opacity-50"
            type="button"
            aria-label="Send message"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        ) : (
          <VoiceRecorder
            isRecording={voice.isRecording}
            duration={voice.duration}
            permissionDenied={voice.permissionDenied}
            onStart={voice.start}
            onStop={voice.stop}
            onCancel={voice.cancel}
          />
        )}
      </div>
    </div>
  );
}
