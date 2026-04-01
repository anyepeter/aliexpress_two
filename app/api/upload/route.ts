import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB hard cap

// Per-folder upload config: transformations + max size
const FOLDER_CONFIG: Record<string, {
  maxSizeBytes: number;
  transformation?: object[];
  resourceType?: "image" | "raw" | "auto";
}> = {
  "store-logos": {
    maxSizeBytes: 2 * 1024 * 1024,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:best", fetch_format: "auto" },
    ],
  },
  "store-banners": {
    maxSizeBytes: 5 * 1024 * 1024,
    transformation: [
      { width: 1200, height: 675, crop: "fill" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
  },
  "seller-documents/id": {
    maxSizeBytes: 10 * 1024 * 1024,
    resourceType: "auto",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  "seller-documents/tax": {
    maxSizeBytes: 10 * 1024 * 1024,
    resourceType: "auto",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine allowed types based on folder
    const isDocFolder = folder.includes("document");
    const allowed = isDocFolder ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;

    if (!allowed.includes(file.type)) {
      const formats = isDocFolder ? "JPG, PNG, WEBP, or PDF" : "JPG, PNG, or WEBP";
      return NextResponse.json(
        { error: `Invalid file type. Please upload ${formats}.` },
        { status: 400 }
      );
    }

    const config = FOLDER_CONFIG[folder];
    const maxSize = config?.maxSizeBytes ?? MAX_SIZE_BYTES;

    if (file.size > maxSize) {
      const mb = (maxSize / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `File too large. Maximum size for this upload is ${mb} MB.` },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `aliexpress/${folder}`,
          transformation: config?.transformation ?? [
            { quality: "auto", fetch_format: "auto" },
          ],
          resource_type: config?.resourceType ?? "auto",
          image_metadata: false, // strip EXIF for privacy
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message ?? "Cloudinary upload failed"));
          } else {
            resolve(result as {
              secure_url: string;
              public_id: string;
              width?: number;
              height?: number;
              format?: string;
              bytes?: number;
            });
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("[upload] error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
