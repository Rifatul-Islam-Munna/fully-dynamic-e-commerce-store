"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SitePreferencesProvider } from "@/components/site/site-preferences-provider";
import {
  SITE_THEME_OPTIONS,
  type SiteAppearanceSettings,
} from "@/lib/site-appearance";
const queryClient = new QueryClient();
const QueryClint = ({
  children,
  appearance,
}: {
  children: React.ReactNode;
  appearance: SiteAppearanceSettings;
}) => {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme={appearance.siteTheme}
        forcedTheme={appearance.siteTheme}
        enableSystem={false}
        disableTransitionOnChange
        themes={SITE_THEME_OPTIONS.map((item) => item.value)}
      >
        <SitePreferencesProvider initialSettings={appearance}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools buttonPosition="bottom-right" />

            {children}
          </QueryClientProvider>
        </SitePreferencesProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
};

export default QueryClint;
