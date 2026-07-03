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
    startNavigation(() => router.push(nextUrl));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDialog]);

  useEffect(() => {
    if (!open) return;
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
        className="commerce-interactive hidden h-11 w-[clamp(220px,24vw,390px)] items-center gap-3 border border-border bg-muted/35 px-4 text-left text-sm text-muted-foreground lg:flex"
        aria-label="Search products"
      >
        <Search className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search products</span>
        <kbd className="border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
      </button>
      <button
        type="button"
        onClick={openDialog}
        className="commerce-interactive inline-flex size-10 items-center justify-center border border-border bg-background text-foreground lg:hidden"
        aria-label="Search products"
      >
        <Search className="size-4.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[94vw] rounded-md border-border bg-background p-0 sm:max-w-[620px]">
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="font-headline text-2xl font-semibold tracking-tight">
              Find your product
            </DialogTitle>
            <DialogDescription>
              Search the catalogue by product, collection, or keyword.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigateToSearch(query);
            }}
            className="space-y-5 p-6"
          >
            <div className="flex items-center gap-3 border border-border bg-muted/25 px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for?"
                className="h-14 border-0 bg-transparent px-0 text-base focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-sm px-5"
                onClick={() => navigateToSearch("")}
                disabled={isPending}
              >
                Browse all
              </Button>
              <Button type="submit" className="h-11 rounded-sm px-6" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Search
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
