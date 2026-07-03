import { cache } from "react";
import { GetRequestNormal } from "@/api-hooks/api-hooks";

export type PageSeoSetting = {
  id?: string;
  path: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  canonicalUrl?: string | null;
  keywords?: string[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  structuredData?: Record<string, unknown> | null;
  gtmEnabled?: boolean;
  gtmContainerId?: string | null;
  isActive?: boolean;
};

export function normalizeSeoPath(value?: string | null) {
  const trimmed = value?.trim() || "/";
  let rawPath = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      rawPath = new URL(trimmed).pathname;
    } catch {
      rawPath = "/";
    }
  }

  const path = rawPath.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, "/");
  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}

export const getPageSeoSetting = cache(async (pathValue?: string | null) => {
  const path = normalizeSeoPath(pathValue);
  try {
    return await GetRequestNormal<PageSeoSetting | null>(
      `/web-settings/seo?path=${encodeURIComponent(path)}`,
      0,
      `page-seo-${path}`,
    );
  } catch {
    return null;
  }
});

export function normalizeSeoText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function resolveGtmContainerId(setting?: PageSeoSetting | null) {
  if (!setting?.gtmEnabled) return null;
  const containerId = normalizeSeoText(setting.gtmContainerId)?.toUpperCase();
  return containerId && /^GTM-[A-Z0-9]+$/.test(containerId)
    ? containerId
    : null;
}
