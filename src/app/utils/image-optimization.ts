/**
 * Image URL utilities – returns DB URLs as-is, no transformation.
 */

/** Preset names for common use cases */
export type ImagePresetName = "thumbnail" | "card" | "full";

/** Default srcSet widths (kept for API compatibility) */
export const SRC_SET_WIDTHS = [200, 400, 800] as const;

/** Fallback placeholder for missing/broken images */
export const PLACEHOLDER_IMAGE = "/placeholder.png";

/**
 * Return the image URL from DB as-is.
 *
 * @param baseUrl - URL from DB
 * @returns Original URL or placeholder if empty
 */
export function getOptimizedImageUrl(baseUrl: string): string {
  if (!baseUrl || typeof baseUrl !== "string") return PLACEHOLDER_IMAGE;
  return baseUrl;
}

/**
 * Return the image URL using a preset name (same as getOptimizedImageUrl).
 *
 * @param baseUrl - URL from DB
 * @param presetName - "thumbnail" | "card" | "full"
 */
export function getImagePreset(baseUrl: string, presetName: ImagePresetName): string {
  return getOptimizedImageUrl(baseUrl);
}

/**
 * Return the image URL for blur placeholder.
 *
 * @param baseUrl - URL from DB
 */
export function getBlurImageUrl(baseUrl: string): string {
  return getOptimizedImageUrl(baseUrl);
}

/**
 * Generate srcSet – returns null (use single src; no responsive variants).
 *
 * @param baseUrl - URL from DB
 * @param widths - Array of widths (unused)
 */
export function getImageSrcSet(
  baseUrl: string,
  widths: readonly number[] = SRC_SET_WIDTHS
): string | null {
  return null;
}
