"use client";

import { X, Play } from "lucide-react";

interface AttachmentPreviewProps {
  type: "image" | "file" | "voice";
  name?: string;
  size?: number;
  previewUrl?: string | null;
  voiceDuration?: number;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AttachmentPreview({
  type,
  name,
  size,
  previewUrl,
  voiceDuration,
  onRemove,
}: AttachmentPreviewProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
      {type === "image" && previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Preview"
          className="w-16 h-16 rounded-lg object-cover"
        />
      )}

      {type === "file" && (
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <span className="text-lg">📎</span>
          <div>
            <p className="text-xs font-medium text-[#1A1A1A] truncate max-w-[180px]">
              {name ?? "File"}
            </p>
            {size && (
              <p className="text-[10px] text-gray-400">{formatSize(size)}</p>
            )}
          </div>
        </div>
      )}

      {type === "voice" && (
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <Play className="w-4 h-4 text-[#E53935]" />
          <span className="text-xs font-medium text-[#1A1A1A]">
            Voice message
          </span>
          {voiceDuration !== undefined && (
            <span className="text-[10px] text-gray-400">
              {formatDuration(voiceDuration)}
            </span>
          )}
        </div>
      )}

      <span className="text-xs text-gray-400 flex-1">
        {type === "voice" ? "Voice message ready" : "Ready to send"}
      </span>

      <button
        onClick={onRemove}
        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
        type="button"
        aria-label="Remove attachment"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
