const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dttoxoje9";

/**
 * Wraps any remote image URL through Cloudinary's fetch proxy
 * for automatic format conversion (WebP/AVIF) and resizing.
 */
export function cloudinaryFetch(
  url: string,
  { width, quality }: { width?: number; quality?: number } = {}
): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;

  // Don't double-wrap if it's already a Cloudinary URL
  if (url.includes("res.cloudinary.com")) return url;

  const transforms = ["f_auto", `q_${quality ?? "auto"}`];
  if (width) transforms.push(`w_${width}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms.join(",")}/${encodeURIComponent(url)}`;
}
