// Worker endpoint for image transformation
const TRANSFORM_WORKER_URL = "https://transfer.mytest.cc/";

/**
 * Cloudflare Worker image transform options
 */
interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
}

/**
 * Transform image URL to Cloudflare Worker transform URL
 * URL format: https://transfer.mytest.cc/?image=<SOURCE>&width=400&quality=75
 */
export function transformImageUrl(
  originalUrl: string,
  options: TransformOptions = {}
): string {
  if (!originalUrl) return originalUrl;

  try {
    const params = new URLSearchParams();
    params.set("image", originalUrl);

    if (options.width) params.set("width", options.width.toString());
    if (options.height) params.set("height", options.height.toString());
    if (options.quality) params.set("quality", options.quality.toString());
    if (options.fit) params.set("fit", options.fit);

    return `${TRANSFORM_WORKER_URL}?${params.toString()}`;
  } catch {
    return originalUrl;
  }
}

/**
 * Default thumbnail options for waterfall grid
 */
export const THUMBNAIL_OPTIONS: TransformOptions = {
  width: 400,
  quality: 75,
  fit: "scale-down",
};

/**
 * Get thumbnail URL for waterfall display
 */
export function getThumbnailUrl(originalUrl: string): string {
  return transformImageUrl(originalUrl, THUMBNAIL_OPTIONS);
}
