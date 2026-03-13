import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// MediaRecorder outputs varying types across browsers
function isAllowedAudioType(type: string): boolean {
  if (!type) return true; // empty type = browser didn't label it, accept it
  const lower = type.toLowerCase();
  return (
    lower.startsWith("audio/") ||
    lower === "video/webm" || // Chrome sometimes labels audio-only webm as video/webm
    lower === "application/octet-stream"
  );
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  const conversationId = formData.get("conversationId") as string | null;
  const clientDuration = formData.get("duration") as string | null;

  if (!audio || !conversationId) {
    return NextResponse.json(
      { error: "audio and conversationId required" },
      { status: 400 }
    );
  }

  if (!isAllowedAudioType(audio.type)) {
    return NextResponse.json(
      { error: `Invalid audio format: ${audio.type}` },
      { status: 400 }
    );
  }

  if (audio.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 }
    );
  }

  try {
    const bytes = await audio.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; duration?: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video", // cloudinary uses "video" for audio
              folder: `markethub/messages/${conversationId}/voice`,
            },
            (error, uploadResult) => {
              if (error) reject(error);
              else
                resolve(
                  uploadResult as { secure_url: string; duration?: number }
                );
            }
          )
          .end(buffer);
      }
    );

    const duration = result.duration
      ? Math.round(result.duration)
      : clientDuration
        ? parseInt(clientDuration)
        : 0;

    return NextResponse.json({
      url: result.secure_url,
      duration,
    });
  } catch (err) {
    console.error("Voice upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload voice message" },
      { status: 500 }
    );
  }
}
