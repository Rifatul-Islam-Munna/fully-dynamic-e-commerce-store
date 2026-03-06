"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable)
  );
}

function normalizeQuery(value: string) {
  return value.trim();
}

export function SearchDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startNavigation] = useTransition();

  const currentSearch = normalizeQuery(searchParams.get("search") ?? "");

  const openDialog = useCallback(() => {
    setQuery(pathname === "/search" ? currentSearch : "");
    setOpen(true);
  }, [currentSearch, pathname]);

  const navigateToSearch = (rawQuery: string) => {
    const trimmedQuery = normalizeQuery(rawQuery);
    const nextUrl = trimmedQuery
      ? `/search?search=${encodeURIComponent(trimmedQuery)}`
      : "/search";

    setOpen(false);
    setQuery(trimmedQuery);
    startNavigation(() => {
      router.push(nextUrl);
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDialog]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Open search dialog"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px] rounded-2xl border border-border/70 p-0">
          <DialogHeader className="border-b border-border/60 px-6 py-5">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Search products
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Search with a query or go straight to the full search page.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigateToSearch(query);
            }}
            className="space-y-4 px-6 py-5"
          >
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, collections, or brands"
                className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                style={{ boxShadow: "none" }}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigateToSearch("")}
                disabled={isPending}
              >
                Browse all
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Search
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
