"use client";

import { useState, useTransition } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CircleHelp,
  Filter,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import type { NavbarItem } from "@/components/navbar/navbar.types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/currency";
import {
  PRODUCT_FLAG_CONFIG,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SORT_VALUES,
  SEARCH_RESULTS_LIMIT,
  buildStorefrontSearchUrl,
  normalizeSearchPathLabel,
  normalizeSearchText,
  type ProductFlagKey,
  type ProductSort,
  type StorefrontProductSearchResponse,
  type StorefrontSearchFilters,
} from "@/lib/storefront-search";

const ALL_VALUE = "__all__";

const searchParsers = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  page: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(1),
  mainNavUrl: parseAsString,
  subNavUrl: parseAsString,
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,
  sort: parseAsStringEnum([...PRODUCT_SORT_VALUES])
    .withOptions({ clearOnDefault: true })
    .withDefault("newest"),
  isHotSells: parseAsBoolean.withDefault(false),
  isWeeklySell: parseAsBoolean.withDefault(false),
  isSummerSell: parseAsBoolean.withDefault(false),
  isWinterSell: parseAsBoolean.withDefault(false),
  isBestSell: parseAsBoolean.withDefault(false),
};

const PRICE_PRESETS = [
  { label: "Under 1,000", min: null, max: 1000 },
  { label: "1,000 - 5,000", min: 1000, max: 5000 },
  { label: "5,000 - 10,000", min: 5000, max: 10000 },
  { label: "10,000+", min: 10000, max: null },
] as const;

function formatPriceRange(minPrice: number | null, maxPrice: number | null) {
  if (typeof minPrice === "number" && typeof maxPrice === "number") {
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  }

  if (typeof minPrice === "number") {
    return `${formatCurrency(minPrice)}+`;
  }

  if (typeof maxPrice === "number") {
    return `Up to ${formatCurrency(maxPrice)}`;
  }

  return null;
}

function parseDraftPrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizePriceDrafts(minDraft: string, maxDraft: string) {
  let minPrice = parseDraftPrice(minDraft);
  let maxPrice = parseDraftPrice(maxDraft);

  if (
    typeof minPrice === "number" &&
    typeof maxPrice === "number" &&
    minPrice > maxPrice
  ) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return { minPrice, maxPrice };
}

function FilterLabel({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-on-surface">{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-4 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label={`Explain ${label}`}
          >
            <CircleHelp className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function PriceControls({
  initialMin,
  initialMax,
  onApply,
  onPreset,
}: {
  initialMin: number | null;
  initialMax: number | null;
  onApply: (minPrice: number | null, maxPrice: number | null) => void;
  onPreset: (minPrice: number | null, maxPrice: number | null) => void;
}) {
  const [minDraft, setMinDraft] = useState(initialMin?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(initialMax?.toString() ?? "");

  const applyDrafts = () => {
    const { minPrice, maxPrice } = normalizePriceDrafts(minDraft, maxDraft);
    setMinDraft(minPrice?.toString() ?? "");
    setMaxDraft(maxPrice?.toString() ?? "");
    onApply(minPrice, maxPrice);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          inputMode="decimal"
          placeholder="Min"
          value={minDraft}
          onChange={(event) => setMinDraft(event.target.value)}
          onBlur={applyDrafts}
          className="h-10 rounded-2xl border-0 bg-surface"
        />
        <Input
          inputMode="decimal"
          placeholder="Max"
          value={maxDraft}
          onChange={(event) => setMaxDraft(event.target.value)}
          onBlur={applyDrafts}
          className="h-10 rounded-2xl border-0 bg-surface"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setMinDraft(preset.min?.toString() ?? "");
              setMaxDraft(preset.max?.toString() ?? "");
              onPreset(preset.min, preset.max);
            }}
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({
  navbarItems,
  filters,
  onSortChange,
  onMainNavChange,
  onSubNavChange,
  onPriceChange,
  onFlagToggle,
  onResetAll,
}: {
  navbarItems: NavbarItem[];
  filters: StorefrontSearchFilters;
  onSortChange: (value: ProductSort) => void;
  onMainNavChange: (value: string | null) => void;
  onSubNavChange: (value: string | null) => void;
  onPriceChange: (minPrice: number | null, maxPrice: number | null) => void;
  onFlagToggle: (key: ProductFlagKey, checked: boolean) => void;
  onResetAll: () => void;
}) {
  const selectedMainNav =
    navbarItems.find((item) => item.url === filters.mainNavUrl) ?? null;

  return (
    <div className="rounded-sm bg-surface-container-low p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Filter & sort
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-full px-3 text-on-surface-variant hover:text-on-surface"
          onClick={onResetAll}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <section className="space-y-2">
          <FilterLabel
            label="Sort"
            hint="Controls the order of products in the result grid."
          />
          <Select
            value={filters.sort}
            onValueChange={(value) => onSortChange(value as ProductSort)}
          >
            <SelectTrigger className="h-10 w-full rounded-sm border-0 bg-surface">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-on-surface-variant" />
                <SelectValue placeholder="Newest first" />
              </div>
            </SelectTrigger>
            <SelectContent align="start">
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2.5">
          <FilterLabel
            label="Department"
            hint="Matches the product's main navigation assignment."
          />
          <Select
            value={filters.mainNavUrl ?? ALL_VALUE}
            onValueChange={(value) =>
              onMainNavChange(value === ALL_VALUE ? null : value)
            }
          >
            <SelectTrigger className="h-10 w-full rounded-sm border-0 bg-surface">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value={ALL_VALUE}>All departments</SelectItem>
              {navbarItems.map((item) => (
                <SelectItem key={item.url} value={item.url}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2.5">
          <FilterLabel
            label="Section"
            hint="Matches the product's sub-navigation assignment."
          />
          <Select
            value={filters.subNavUrl ?? ALL_VALUE}
            onValueChange={(value) =>
              onSubNavChange(value === ALL_VALUE ? null : value)
            }
            disabled={!selectedMainNav || selectedMainNav.subNav.length === 0}
          >
            <SelectTrigger className="h-10 w-full rounded-sm border-0 bg-surface">
              <SelectValue placeholder="All sections" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value={ALL_VALUE}>All sections</SelectItem>
              {(selectedMainNav?.subNav ?? []).map((item) => (
                <SelectItem key={item.url} value={item.url}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2.5">
          <FilterLabel
            label="Price"
            hint="Filters by current storefront price, including discounts."
          />
          <PriceControls
            key={`${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`}
            initialMin={filters.minPrice}
            initialMax={filters.maxPrice}
            onApply={onPriceChange}
            onPreset={onPriceChange}
          />
        </section>

        <section className="space-y-2.5">
          <FilterLabel
            label="Collections"
            hint="Direct toggles for the public product campaign flags."
          />
          <div className="space-y-2">
            {PRODUCT_FLAG_CONFIG.map((flag) => (
              <label
                key={flag.key}
                className="flex items-center gap-3 rounded-sm bg-surface px-3 py-2.5"
              >
                <Checkbox
                  checked={filters[flag.key]}
                  onCheckedChange={(checked) =>
                    onFlagToggle(flag.key, checked === true)
                  }
                />
                <span className="text-sm text-on-surface">{flag.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SearchPageShell({
  navbarItems,
}: {
  navbarItems: NavbarItem[];
}) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useQueryStates(searchParsers, {
    history: "replace",
    scroll: false,
    shallow: true,
    startTransition,
  });

  const typedFilters: StorefrontSearchFilters = {
    search: filters.search,
    page: filters.page,
    mainNavUrl: filters.mainNavUrl,
    subNavUrl: filters.subNavUrl,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort as ProductSort,
    isHotSells: filters.isHotSells,
    isWeeklySell: filters.isWeeklySell,
    isSummerSell: filters.isSummerSell,
    isWinterSell: filters.isWinterSell,
    isBestSell: filters.isBestSell,
  };

  const searchResults = useQuery({
    queryKey: ["storefront-search", typedFilters],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        buildStorefrontSearchUrl({
          ...typedFilters,
          limit: SEARCH_RESULTS_LIMIT,
        }),
        { cache: "no-store", signal },
      );

      const payload = (await response.json().catch(() => null)) as
        | StorefrontProductSearchResponse
        | { message?: string }
        | null;

      const message =
        payload && "message" in payload ? payload.message : undefined;

      if (!response.ok) {
        throw new Error(message || "Failed to load search results");
      }

      return payload as StorefrontProductSearchResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const products = searchResults.data?.data ?? [];
  const pagination = searchResults.data?.pagination;
  const totalResults = pagination?.total ?? 0;
  const currentStart =
    totalResults > 0
      ? (typedFilters.page - 1) * SEARCH_RESULTS_LIMIT + 1
      : 0;
  const currentEnd = Math.min(
    totalResults,
    typedFilters.page * SEARCH_RESULTS_LIMIT,
  );
  const isBusy = searchResults.isFetching;
  const activePriceLabel = formatPriceRange(
    typedFilters.minPrice,
    typedFilters.maxPrice,
  );
  const searchLabel = typedFilters.search.trim();

  const activeChips: Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }> = [];

  if (typedFilters.mainNavUrl) {
    activeChips.push({
      key: "department",
      label:
        normalizeSearchPathLabel(typedFilters.mainNavUrl) ||
        typedFilters.mainNavUrl,
      onRemove: () => {
        void setFilters({ mainNavUrl: null, subNavUrl: null, page: 1 });
      },
    });
  }

  if (typedFilters.subNavUrl) {
    activeChips.push({
      key: "section",
      label:
        normalizeSearchPathLabel(typedFilters.subNavUrl) ||
        typedFilters.subNavUrl,
      onRemove: () => {
        void setFilters({ subNavUrl: null, page: 1 });
      },
    });
  }

  if (activePriceLabel) {
    activeChips.push({
      key: "price",
      label: `Price: ${activePriceLabel}`,
      onRemove: () => {
        void setFilters({ minPrice: null, maxPrice: null, page: 1 });
      },
    });
  }

  for (const flag of PRODUCT_FLAG_CONFIG) {
    if (typedFilters[flag.key]) {
      activeChips.push({
        key: flag.key,
        label: flag.label,
        onRemove: () => {
          setFlagValue(flag.key, false);
        },
      });
    }
  }

  function setFlagValue(key: ProductFlagKey, checked: boolean) {
    switch (key) {
      case "isHotSells":
        void setFilters({ isHotSells: checked, page: 1 });
        return;
      case "isWeeklySell":
        void setFilters({ isWeeklySell: checked, page: 1 });
        return;
      case "isSummerSell":
        void setFilters({ isSummerSell: checked, page: 1 });
        return;
      case "isWinterSell":
        void setFilters({ isWinterSell: checked, page: 1 });
        return;
      case "isBestSell":
        void setFilters({ isBestSell: checked, page: 1 });
    }
  }

  const activeFilterCount = activeChips.length;

  const filterPanelProps = {
    navbarItems,
    filters: typedFilters,
    onSortChange: (value: ProductSort) => {
      void setFilters({ sort: value, page: 1 });
    },
    onMainNavChange: (value: string | null) => {
      const nextMain = value ? normalizeSearchText(value) : null;
      void setFilters({
        mainNavUrl: nextMain,
        subNavUrl: null,
        page: 1,
      });
    },
    onSubNavChange: (value: string | null) => {
      void setFilters({
        subNavUrl: value ? normalizeSearchText(value) : null,
        page: 1,
      });
    },
    onPriceChange: (minPrice: number | null, maxPrice: number | null) => {
      void setFilters({
        minPrice,
        maxPrice,
        page: 1,
      });
    },
    onFlagToggle: setFlagValue,
    onResetAll: () => {
      void setFilters({
        search: "",
        page: 1,
        mainNavUrl: null,
        subNavUrl: null,
        minPrice: null,
        maxPrice: null,
        sort: "newest",
        isHotSells: false,
        isWeeklySell: false,
        isSummerSell: false,
        isWinterSell: false,
        isBestSell: false,
      });
    },
  };

  return (
    <TooltipProvider>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          <section className="space-y-4">
            <div className="rounded-sm bg-surface-container-low px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-headline text-lg font-extrabold tracking-tighter text-primary">
                    {searchLabel ? (
                      <>
                        Results for{" "}
                        <span className="text-primary">
                          &ldquo;{searchLabel}&rdquo;
                        </span>
                      </>
                    ) : (
                      "All products"
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                    <span>
                      {totalResults > 0
                        ? `Showing ${currentStart}-${currentEnd} of ${totalResults}`
                        : "No products found"}
                    </span>
                    {pagination && pagination.totalPages > 1 ? (
                      <span>
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                    ) : null}
                    {isBusy ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" />
                        Updating
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 ? (
                    <span className="inline-flex h-9 items-center rounded-full bg-surface px-3 text-xs font-medium text-on-surface">
                      {activeFilterCount} filters
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 rounded-full px-4 lg:hidden"
                    onClick={() => setIsFilterSheetOpen(true)}
                  >
                    <Filter className="size-4" />
                    Filter
                  </Button>
                </div>
              </div>

              {activeChips.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-on-surface"
                    >
                      {chip.label}
                      <X className="size-3.5 text-on-surface-variant" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetContent
                side="left"
                className="w-[92vw] max-w-sm overflow-y-auto bg-surface p-0"
              >
                <SheetHeader className="px-5 py-4">
                  <SheetTitle>Filter & sort</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <FilterPanel {...filterPanelProps} />
                </div>
              </SheetContent>
            </Sheet>

            {searchResults.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: SEARCH_RESULTS_LIMIT }).map((_, index) => (
                  <div
                    key={`search-skeleton-${index}`}
                    className="overflow-hidden rounded-sm bg-surface-container-low p-3"
                  >
                    <div className="h-52 animate-pulse rounded-xl bg-surface-container/70" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 animate-pulse rounded bg-surface-container/70" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container/60" />
                      <div className="h-10 animate-pulse rounded-xl bg-surface-container/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.isError ? (
              <div className="rounded-sm bg-surface-container-low px-6 py-14 text-center">
                <h2 className="font-headline text-2xl font-extrabold tracking-tighter text-primary">
                  Search service error
                </h2>
                <p className="mt-3 text-sm text-on-surface-variant">
                  {searchResults.error.message}
                </p>
                <Button
                  type="button"
                  className="mt-6 rounded-full font-headline text-xs font-bold uppercase tracking-widest shadow-none"
                  onClick={() => {
                    void searchResults.refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-sm bg-surface-container-low px-6 py-14 text-center">
                <h2 className="font-headline text-2xl font-extrabold tracking-tighter text-primary">
                  No matching products
                </h2>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Try clearing one or two filters, or browse the full catalog.
                </p>
                <Button
                  type="button"
                  className="mt-6 rounded-full font-headline text-xs font-bold uppercase tracking-widest shadow-none"
                  onClick={() => {
                    void setFilters({
                      search: "",
                      page: 1,
                      mainNavUrl: null,
                      subNavUrl: null,
                      minPrice: null,
                      maxPrice: null,
                      sort: "newest",
                      isHotSells: false,
                      isWeeklySell: false,
                      isSummerSell: false,
                      isWinterSell: false,
                      isBestSell: false,
                    });
                  }}
                >
                  Reset search
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-col gap-3 rounded-sm bg-surface-container-low px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full px-4"
                    disabled={typedFilters.page <= 1 || isBusy}
                    onClick={() =>
                      void setFilters(
                        { page: typedFilters.page - 1 },
                        { history: "push", scroll: false },
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full px-4"
                    disabled={typedFilters.page >= pagination.totalPages || isBusy}
                    onClick={() =>
                      void setFilters(
                        { page: typedFilters.page + 1 },
                        { history: "push", scroll: false },
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}
