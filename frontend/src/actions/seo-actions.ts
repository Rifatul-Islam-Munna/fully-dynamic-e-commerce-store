"use server";

import { GetRequestNormal, PatchRequestAxios } from "@/api-hooks/api-hooks";
import type { PageSeoSetting } from "@/lib/page-seo";

export async function getAdminSeoSettings() {
  try {
    return await GetRequestNormal<PageSeoSetting[]>(
      "/web-settings/seo/admin",
      0,
      "admin-seo-settings",
    );
  } catch {
    return [];
  }
}

export async function saveSeoSetting(payload: Record<string, unknown>) {
  return PatchRequestAxios("/web-settings/seo", payload);
}
