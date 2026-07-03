"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function DynamicGtm({ containerId }: { containerId?: string | null }) {
  const normalized = containerId?.trim().toUpperCase();
  const valid = Boolean(normalized && /^GTM-[A-Z0-9]+$/.test(normalized));

  useEffect(() => {
    if (!valid) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
  }, [valid, normalized]);

  if (!valid || !normalized) return null;

  return (
    <Script
      id="dynamic-google-tag-manager"
      src={`https://www.googletagmanager.com/gtm.js?id=${normalized}`}
      strategy="afterInteractive"
    />
  );
}
