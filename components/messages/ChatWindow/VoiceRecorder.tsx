"use client";

import { Mic, MicOff, Square, X } from "lucide-react";

interface VoiceRecorderProps {
  isRecording: boolean;
  duration: number;
  permissionDenied?: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceRecorder({
  isRecording,
  duration,
  permissionDenied,
  onStart,
  onStop,
  onCancel,
}: VoiceRecorderProps) {
  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          type="button"
          title="Cancel recording"
          aria-label="Cancel recording"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs font-medium text-red-500 min-w-[40px]">
          {formatDuration(duration)}
        </span>

        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

        <button
          onClick={onStop}
          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          type="button"
          title="Stop recording"
          aria-label="Stop recording"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <button
        onClick={onStart}
        className="p-2 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        type="button"
        title="Microphone access denied — click to retry"
        aria-label="Microphone access denied, click to retry"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      className="p-2 rounded-lg text-gray-400 hover:text-[#E53935] hover:bg-gray-100 transition-colors"
      type="button"
      title="Click to record voice message"
      aria-label="Record voice message"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}
