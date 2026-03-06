"use client";

import { createContext, useContext, useMemo } from "react";
import {
  buildSiteAppearanceSettings,
  type SiteAppearanceSettings,
} from "@/lib/site-appearance";

const SitePreferencesContext = createContext<SiteAppearanceSettings>(
  buildSiteAppearanceSettings(),
);

export function SitePreferencesProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<SiteAppearanceSettings>;
}) {
  const value = useMemo(
    () => buildSiteAppearanceSettings(initialSettings),
    [initialSettings],
  );

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  return useContext(SitePreferencesContext);
}
