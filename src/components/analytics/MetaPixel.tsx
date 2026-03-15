"use client";

import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const DEFAULT_PIXEL_ID = "1603225247464427";
const FB_EVENTS_URL = "https://connect.facebook.net/en_US/fbevents.js";

export default function MetaPixel() {
  const pixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID ?? DEFAULT_PIXEL_ID;

  if (!pixelId) {
    return null;
  }

  const handleLoad = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
    }
  };

  return (
    <>
      <Script
        src={FB_EVENTS_URL}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <noscript>
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
