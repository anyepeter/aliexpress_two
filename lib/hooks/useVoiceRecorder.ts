"use client";

import { useState, useRef, useCallback } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const cancelled = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const start = useCallback(async () => {
    try {
      // Clear any previous state
      setAudioBlob(null);
      setPreviewUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionDenied(false);
      cancelled.current = false;

      chunks.current = [];

      // Pick a supported mimeType — Safari doesn't support webm
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ""; // let the browser pick
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();

        // If user cancelled, don't create a blob
        if (cancelled.current) {
          chunks.current = [];
          return;
        }

        const blob = new Blob(chunks.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunks.current = [];

        if (blob.size > 0) {
          setAudioBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      };

      mediaRecorder.current = recorder;
      recorder.start(250);
      startTime.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      timerInterval.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 200);
    } catch {
      setPermissionDenied(true);
    }
  }, []);

  const stop = useCallback(() => {
    cancelled.current = false;
    clearTimer();
    setDuration(Math.floor((Date.now() - startTime.current) / 1000));
    setIsRecording(false);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    clearTimer();
    setIsRecording(false);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    } else {
      stopStream();
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAudioBlob(null);
    setPreviewUrl(null);
    setDuration(0);
    chunks.current = [];
  }, [previewUrl]);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAudioBlob(null);
    setPreviewUrl(null);
    setDuration(0);
  }, [previewUrl]);

  return {
    isRecording,
    duration,
    audioBlob,
    previewUrl,
    permissionDenied,
    start,
    stop,
    cancel,
    reset,
  };
}
