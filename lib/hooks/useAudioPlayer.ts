"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function isFiniteDuration(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafId = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      // Some browsers resolve duration late (after loadedmetadata)
      if (duration === 0 && isFiniteDuration(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
    if (isPlaying) {
      rafId.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, duration]);

  useEffect(() => {
    if (isPlaying) {
      rafId.current = requestAnimationFrame(updateProgress);
    }
    return () => cancelAnimationFrame(rafId.current);
  }, [isPlaying, updateProgress]);

  const load = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);

    // Try to get duration from loadedmetadata
    audio.addEventListener("loadedmetadata", () => {
      if (isFiniteDuration(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    // Fallback: some formats (webm) report Infinity until fully loaded
    // The durationchange event fires when the real duration becomes available
    audio.addEventListener("durationchange", () => {
      if (isFiniteDuration(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Final chance to capture duration
      if (isFiniteDuration(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audioRef.current = audio;
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const safeDuration = isFiniteDuration(duration) ? duration : 0;
  const progress = safeDuration > 0 ? (currentTime / safeDuration) * 100 : 0;

  return { isPlaying, currentTime, duration: safeDuration, progress, load, play, pause, seek };
}
