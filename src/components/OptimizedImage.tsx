"use client";

import { useState, useMemo, useEffect } from "react";
import {
  getOptimizedImageUrl,
  getImagePreset,
  getImageSrcSet,
  getBlurImageUrl,
  PLACEHOLDER_IMAGE,
  SRC_SET_WIDTHS,
  type ImagePresetName,
} from "@/app/utils/image-optimization";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  preset?: ImagePresetName;
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill";
  placeholderSrc?: string;
  onError?: () => void;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  /** Enable responsive srcSet for CDN images (default: true when fill or preset) */
  responsive?: boolean;
  /** Additional img attributes */
  style?: React.CSSProperties;
  priority?: boolean;
  draggable?: boolean;
};

const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/** Inline SVG placeholder for missing/broken images */
function PlaceholderSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  preset,
  className = "",
  loading = "lazy",
  sizes = DEFAULT_SIZES,
  fill = false,
  objectFit = "contain",
  placeholderSrc,
  onError,
  responsive = true,
  style,
  priority = false,
  onClick,
  draggable,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [src]);

  const { imageSrc, srcSet, blurPlaceholder } = useMemo(() => {
    const effectiveSrc = src?.trim() || "";
    if (!effectiveSrc) {
      return { imageSrc: PLACEHOLDER_IMAGE, srcSet: null, blurPlaceholder: null };
    }

    const resolvedSrc = preset
      ? getImagePreset(effectiveSrc, preset)
      : getOptimizedImageUrl(effectiveSrc, width ?? 800, 85);

    const shouldUseSrcSet = responsive && (fill || preset);
    const resolvedSrcSet = shouldUseSrcSet ? getImageSrcSet(effectiveSrc, SRC_SET_WIDTHS) : null;

    const blurSrc = fill && !placeholderSrc ? getBlurImageUrl(effectiveSrc) : null;
    const effectiveBlur = placeholderSrc ?? (blurSrc && blurSrc !== resolvedSrc ? blurSrc : null);

    return { imageSrc: resolvedSrc, srcSet: resolvedSrcSet, blurPlaceholder: effectiveBlur };
  }, [src, preset, fill, responsive, width, placeholderSrc]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Missing src or error: show placeholder
  if (!src?.trim() || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
        style={
          fill
            ? { position: "absolute", inset: 0, ...style }
            : width && height
              ? { width, height, ...style }
              : style
        }
        role="img"
        aria-label={alt}
      >
        <PlaceholderSvg className="w-20 h-20 text-gray-300" />
      </div>
    );
  }

  const imgStyle: React.CSSProperties = {
    objectFit: objectFit === "fill" ? "fill" : objectFit,
    ...style,
  };

  const baseImgProps = {
    src: imageSrc,
    alt,
    loading: priority ? "eager" : loading,
    decoding: "async" as const,
    className,
    onError: handleError,
    onLoad: () => setImageLoaded(true),
    onClick,
    ...(draggable !== undefined && { draggable }),
    ...(srcSet && { srcSet, sizes }),
  };

  if (fill) {
    return (
      <div className="relative w-full h-full overflow-hidden" style={style}>
        {blurPlaceholder && (
          <img
            src={blurPlaceholder}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
            style={{
              filter: "blur(12px)",
              transform: "scale(1.05)",
              opacity: imageLoaded ? 0 : 1,
              pointerEvents: imageLoaded ? "none" : "auto",
            }}
          />
        )}
        <img
          {...baseImgProps}
          className={className}
          style={{
            ...imgStyle,
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />
      </div>
    );
  }

  return (
    <img
      {...baseImgProps}
      style={imgStyle}
      {...(width != null && { width })}
      {...(height != null && { height })}
    />
  );
}
