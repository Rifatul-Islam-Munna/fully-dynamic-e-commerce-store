"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
const queryClient = new QueryClient();
const QueryClint = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        themes={["light", "dark", "sepia", "blue", "orange", "green"]}
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools buttonPosition="bottom-right" />

          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
};

export default QueryClint;
