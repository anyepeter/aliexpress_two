"use client";

import { useState, useEffect, useMemo } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioPlayer } from "@/lib/hooks/useAudioPlayer";

interface VoiceMessageBubbleProps {
  fileUrl: string;
  audioDuration: number | null;
  isSent: boolean;
  messageId: string;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceMessageBubble({
  fileUrl,
  audioDuration,
  isSent,
  messageId,
}: VoiceMessageBubbleProps) {
  const { isPlaying, currentTime, duration, progress, load, play, pause, seek } =
    useAudioPlayer();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load(fileUrl);
    setLoaded(true);
  }, [fileUrl, load]);

  // Generate pseudo-random waveform bars based on messageId
  const bars = useMemo(() => {
    const arr: number[] = [];
    let seed = 0;
    for (let i = 0; i < messageId.length; i++) {
      seed = (seed + messageId.charCodeAt(i)) % 100;
    }
    for (let i = 0; i < 30; i++) {
      seed = (seed * 31 + 7) % 100;
      arr.push(20 + (seed / 100) * 80);
    }
    return arr;
  }, [messageId]);

  // Prefer the HTML audio element's duration, fall back to DB value
  const displayDuration =
    (Number.isFinite(duration) && duration > 0 ? duration : null) ??
    (Number.isFinite(audioDuration) && audioDuration && audioDuration > 0 ? audioDuration : null) ??
    0;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!loaded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * displayDuration);
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <button
        onClick={isPlaying ? pause : play}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          isSent
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-[#E53935]/10 hover:bg-[#C62828]/20 text-[#E53935]"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        {/* Waveform */}
        <div
          className="flex items-end gap-px h-6 cursor-pointer"
          onClick={handleBarClick}
        >
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors ${
                  isActive
                    ? isSent
                      ? "bg-white"
                      : "bg-[#E53935]"
                    : isSent
                      ? "bg-white/30"
                      : "bg-gray-300"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Duration */}
        <span
          className={`text-[10px] mt-0.5 block ${
            isSent ? "text-white/60" : "text-gray-400"
          }`}
        >
          {isPlaying ? formatDuration(currentTime) : formatDuration(displayDuration)}
        </span>
      </div>
    </div>
  );
}
