"use client";

import { useRef, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, FileText, RefreshCw } from "lucide-react";

interface CloudinaryUploadProps {
  folder: string;
  accept?: string;
  maxSizeMB?: number;
  aspectRatio?: "1:1" | "16:9";
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  label: string;
  currentUrl?: string;
  helperText?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function CloudinaryUpload({
  folder,
  accept = "image/*",
  maxSizeMB = 5,
  aspectRatio = "1:1",
  onUploadComplete,
  onUploadError,
  label,
  currentUrl,
  helperText,
}: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(currentUrl ? "success" : "idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFile = (file: File) => {
    setErrorMsg(null);

    const acceptsPdf = accept.includes("pdf") || accept.includes("application");
    const allowedTypes = acceptsPdf
      ? ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
      : ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      const formats = acceptsPdf ? "JPG, PNG, WEBP, or PDF" : "JPG, PNG, or WEBP";
      const msg = `Invalid file type. Please upload ${formats}.`;
      setErrorMsg(msg);
      onUploadError(msg);
      setState("error");
      return;
    }

    if (file.size > maxSizeBytes) {
      const msg = `File too large. Maximum ${maxSizeMB} MB allowed.`;
      setErrorMsg(msg);
      onUploadError(msg);
      setState("error");
      return;
    }

    // Show local base64 preview while uploading (images only)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    setState("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.timeout = 60000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        // Cap at 90% until server confirms
        setProgress(Math.round((e.loaded / e.total) * 90));
      }
    };

    xhr.onload = () => {
      setProgress(100);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string };
          setState("success");
          setPreviewUrl(data.url); // Replace local preview with Cloudinary URL
          onUploadComplete(data.url);
        } catch {
          const msg = "Unexpected response from server. Please try again.";
          setErrorMsg(msg);
          onUploadError(msg);
          setState("error");
        }
      } else {
        let msg = "Upload failed. Please try again.";
        try {
          const data = JSON.parse(xhr.responseText) as { error?: string };
          if (data.error) msg = data.error;
        } catch { /* ignore parse errors */ }
        setErrorMsg(msg);
        onUploadError(msg);
        setState("error");
      }
    };

    xhr.onerror = () => {
      const msg = "Network error. Check your connection and try again.";
      setErrorMsg(msg);
      onUploadError(msg);
      setState("error");
    };

    xhr.ontimeout = () => {
      const msg = "Upload timed out. Try again with a smaller file.";
      setErrorMsg(msg);
      onUploadError(msg);
      setState("error");
    };

    xhr.send(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected after error
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setState("idle");
    setPreviewUrl(null);
    setErrorMsg(null);
    setProgress(0);
    onUploadComplete("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const containerAspect =
    aspectRatio === "16:9" ? "aspect-video" : "aspect-square max-h-40";

  const renderSuccessPreview = () => {
    if (!previewUrl) return null;

    const isPdf =
      previewUrl.includes("/raw/upload/") ||
      previewUrl.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      return (
        <div className="flex items-center gap-3 p-4 bg-gray-50">
          <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Document uploaded</p>
            <p className="text-xs text-gray-400">PDF file</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${containerAspect}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Uploaded image"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {state !== "success" ? (
        <div
          onClick={() => state !== "uploading" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (state !== "uploading") setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
            state === "uploading"
              ? "cursor-not-allowed border-[#E53935]/40 bg-blue-50/50"
              : isDragging
              ? "cursor-copy border-[#E53935] bg-blue-50"
              : state === "error"
              ? "cursor-pointer border-red-300 bg-red-50 hover:border-red-400"
              : "cursor-pointer border-gray-300 bg-gray-50 hover:border-[#E53935] hover:bg-blue-50/40"
          } ${containerAspect} flex flex-col items-center justify-center`}
        >
          {state === "uploading" ? (
            <div className="flex flex-col items-center gap-3 px-4 w-full">
              <div className="w-8 h-8 rounded-full border-2 border-[#E53935] border-t-transparent animate-spin" />
              <div className="w-full max-w-[160px] space-y-1">
                <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#E53935] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Uploading… {progress}%
                </p>
              </div>
            </div>
          ) : state === "error" ? (
            <div className="flex flex-col items-center gap-2 text-red-500 px-4 text-center">
              <AlertCircle className="w-8 h-8" />
              <span className="text-xs font-medium leading-snug">{errorMsg}</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <RefreshCw className="w-3 h-3" /> Click to try again
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 px-4 text-center">
              <Upload className="w-8 h-8" />
              <span className="text-xs font-medium text-gray-600">
                Click to upload or drag &amp; drop
              </span>
              <span className="text-[10px] text-gray-400">
                {accept.includes("pdf") ? "JPG, PNG, WEBP, PDF" : "JPG, PNG, WEBP"} — max{" "}
                {maxSizeMB} MB
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          {renderSuccessPreview()}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <div className="bg-green-500 text-white rounded-full p-1 shadow">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              title="Remove and re-upload"
              className="bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
