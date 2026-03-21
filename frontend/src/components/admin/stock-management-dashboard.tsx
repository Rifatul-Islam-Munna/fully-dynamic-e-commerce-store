"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { sileo } from "sileo";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Boxes,
  CircleHelp,
  Loader2,
  Package2,
  PackageSearch,
  RefreshCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  getAdminStockReport,
  type AdminStockInventoryItem,
  type AdminStockReport,
} from "@/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type StockFilter = "all" | "healthy" | "low-stock" | "out-of-stock" | "untracked";
type MovementFilter = "all" | "best-selling" | "steady" | "slow" | "new" | "no-sales";
type SortKey = "risk" | "sold" | "revenue" | "recent" | "stock-low" | "stock-high";

const moneyFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatMoney(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  return `BDT ${moneyFormatter.format(value)}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return dateFormatter.format(new Date(value));
}

function formatLastSale(item: AdminStockInventoryItem) {
  if (item.neverSold) {
    return item.daysInCatalog >= 1
      ? `Never sold • ${item.daysInCatalog}d in catalog`
      : "New in catalog";
  }

  if (item.daysSinceLastSale === 0) {
    return "Sold today";
  }

  return `${item.daysSinceLastSale ?? 0}d ago`;
}

function formatPriceRange(item: AdminStockInventoryItem) {
  const { min, max } = item.priceRange;

  if (min === max) {
    return formatMoney(min);
  }

  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

function getStockStatusMeta(status: AdminStockInventoryItem["stockStatus"]) {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      };
    case "low-stock":
      return {
        label: "Low stock",
        className:
          "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      };
    case "out-of-stock":
      return {
        label: "Out of stock",
        className:
          "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      };
    default:
      return {
        label: "Stock pending",
        className:
          "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
      };
  }
}

function getMovementMeta(status: AdminStockInventoryItem["movementStatus"]) {
  switch (status) {
    case "best-selling":
      return {
        label: "Best seller",
        className:
          "bg-primary/12 text-primary dark:bg-primary/18 dark:text-on-primary",
      };
    case "steady":
      return {
        label: "Steady",
        className:
          "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      };
    case "slow":
      return {
        label: "Cooling",
        className:
          "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      };
    case "new":
      return {
        label: "New",
        className:
          "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      };
    default:
      return {
        label: "No sales",
        className:
          "bg-surface-container text-on-surface-variant dark:bg-surface-container/60 dark:text-on-surface-variant",
      };
  }
}

function getRiskScore(item: AdminStockInventoryItem) {
  const stockRisk =
    item.stockStatus === "out-of-stock"
      ? 0
      : item.stockStatus === "low-stock"
        ? 1
        : item.stockStatus === "untracked"
          ? 2
          : 3;
  const salesRisk = item.isStale ? 0 : item.neverSold ? 1 : 2;

  return stockRisk * 10 + salesRisk;
}

function StatTile({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface-container-lowest/90 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
            {title}
          </p>
          <p className="text-xl font-semibold tracking-tight text-on-surface">
            {value}
          </p>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function HighlightCard({
  item,
  accent,
}: {
  item: AdminStockInventoryItem;
  accent: "top" | "stale" | "risk";
}) {
  const stockMeta = getStockStatusMeta(item.stockStatus);
  const movementMeta = getMovementMeta(item.movementStatus);

  return (
    <div className="rounded-2xl border border-border/50 bg-surface-container-lowest/90 p-4">
      <div className="flex gap-3">
        <ProductThumb src={item.thumbnailUrl} alt={item.title} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <p className="line-clamp-1 text-sm font-semibold text-on-surface">
              {item.title}
            </p>
            <p className="text-xs text-on-surface-variant">
              {item.hasVariants ? `${item.variantCount} variants` : "Simple product"} •{" "}
              {formatPriceRange(item)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border-0", stockMeta.className)}>
              {stockMeta.label}
            </Badge>
            <Badge className={cn("border-0", movementMeta.className)}>
              {movementMeta.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em]">Stock</p>
              <p className="mt-1 font-medium text-on-surface">
                {item.totalStock ?? "Pending"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em]">
                {accent === "top" ? "Units sold" : accent === "risk" ? "Revenue" : "Last sale"}
              </p>
              <p className="mt-1 font-medium text-on-surface">
                {accent === "top"
                  ? item.soldUnits
                  : accent === "risk"
                    ? formatMoney(item.revenue)
                    : formatLastSale(item)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-16 w-14 rounded-2xl object-cover sm:h-20 sm:w-16"
    />
  ) : (
    <div className="h-16 w-14 rounded-2xl bg-surface-container sm:h-20 sm:w-16" />
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low/35 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}

export function StockManagementDashboard() {
  const [report, setReport] = useState<AdminStockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [staleAfterDays, setStaleAfterDays] = useState("30");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const loadReport = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextReport = await getAdminStockReport(
        Number(staleAfterDays),
        Number(lowStockThreshold),
        8,
      );
      setReport(nextReport);
    } catch {
      sileo.error({ title: "Something went wrong", description: "Failed to load stock intelligence" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staleAfterDays, lowStockThreshold]);

  const filteredInventory = useMemo(() => {
    const rows = report?.inventory ?? [];

    const filtered = rows.filter((item) => {
      const matchesSearch =
        !deferredSearch ||
        item.title.toLowerCase().includes(deferredSearch) ||
        item.slug.toLowerCase().includes(deferredSearch) ||
        (item.mainNavUrl ?? "").toLowerCase().includes(deferredSearch) ||
        (item.subNavUrl ?? "").toLowerCase().includes(deferredSearch);
      const matchesStock =
        stockFilter === "all" ? true : item.stockStatus === stockFilter;
      const matchesMovement =
        movementFilter === "all" ? true : item.movementStatus === movementFilter;

      return matchesSearch && matchesStock && matchesMovement;
    });

    return filtered.sort((left, right) => {
      switch (sortKey) {
        case "sold":
          return right.soldUnits - left.soldUnits;
        case "revenue":
          return right.revenue - left.revenue;
        case "recent":
          return (
            new Date(right.lastSoldAt ?? 0).getTime() -
            new Date(left.lastSoldAt ?? 0).getTime()
          );
        case "stock-low":
          return (
            (left.totalStock ?? Number.MAX_SAFE_INTEGER) -
            (right.totalStock ?? Number.MAX_SAFE_INTEGER)
          );
        case "stock-high":
          return (right.totalStock ?? -1) - (left.totalStock ?? -1);
        default:
          return getRiskScore(left) - getRiskScore(right);
      }
    });
  }, [deferredSearch, movementFilter, report?.inventory, sortKey, stockFilter]);

  const lastUpdatedLabel = report ? formatDate(report.generatedAt) : "";

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-border/50 bg-surface-container-lowest/90 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                <BarChart3 className="size-3.5" />
                Stock Management
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
                  Inventory health, slow movers, and top sellers
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-on-surface-variant">
                  Track live stock against real checkout demand. Sales signals are
                  calculated from confirmed orders, so the page doubles as both
                  inventory control and merchandising review.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="rounded-2xl bg-surface-container/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                  Stale window
                </p>
                <Select value={staleAfterDays} onValueChange={setStaleAfterDays}>
                  <SelectTrigger className="mt-2 h-10 w-full border-0 bg-surface">
                    <SelectValue placeholder="Select stale window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="45">45 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl bg-surface-container/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                  Low stock line
                </p>
                <Select
                  value={lowStockThreshold}
                  onValueChange={setLowStockThreshold}
                >
                  <SelectTrigger className="mt-2 h-10 w-full border-0 bg-surface">
                    <SelectValue placeholder="Select low stock line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 units</SelectItem>
                    <SelectItem value="5">5 units</SelectItem>
                    <SelectItem value="10">10 units</SelectItem>
                    <SelectItem value="15">15 units</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-surface-container/40 px-3 py-3 sm:col-span-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                    Last sync
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    {report ? lastUpdatedLabel : "Loading"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => void loadReport(true)}
                  disabled={loading || refreshing}
                  className="h-10 rounded-xl px-4"
                >
                  {refreshing ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="mr-2 size-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </section>

        {loading && !report ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-border/50 bg-surface-container-lowest/90">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <Loader2 className="size-4 animate-spin" />
              Loading stock intelligence...
            </div>
          </div>
        ) : report ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <StatTile
                title="On-hand units"
                value={report.summary.totalUnitsInStock}
                description="Tracked units ready to sell"
                icon={Boxes}
              />
              <StatTile
                title="Inventory value"
                value={formatMoney(report.summary.totalInventoryValue)}
                description="Based on current sell price"
                icon={Package2}
              />
              <StatTile
                title="Units sold"
                value={report.summary.totalSoldUnits}
                description="Across confirmed orders"
                icon={TrendingUp}
              />
              <StatTile
                title="Revenue"
                value={formatMoney(report.summary.totalRevenue)}
                description="Captured checkout revenue"
                icon={BarChart3}
              />
              <StatTile
                title="Stale products"
                value={report.summary.staleProducts}
                description={`No sale in ${report.thresholds.staleAfterDays}+ days`}
                icon={Archive}
              />
              <StatTile
                title="At risk"
                value={`${report.summary.outOfStockProducts} / ${report.summary.lowStockProducts}`}
                description="Out of stock / low stock"
                icon={AlertTriangle}
              />
            </section>

            <section className="rounded-[28px] border border-border/50 bg-surface-container-lowest/90 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  {report.summary.outOfStockProducts} out of stock
                </Badge>
                <Badge className="border-0 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  {report.summary.lowStockProducts} low stock
                </Badge>
                <Badge className="border-0 bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300">
                  {report.summary.stockSetupPendingProducts} stock pending
                </Badge>
                <Badge className="border-0 bg-primary/10 text-primary">
                  {report.summary.neverSoldProducts} never sold
                </Badge>
                <div className="ml-auto inline-flex items-center gap-2 text-xs text-on-surface-variant">
                  <CircleHelp className="size-3.5" />
                  Review the highlighted groups first, then use the registry below for
                  the full product list.
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-border/50 bg-surface-container-lowest/90 p-4 sm:p-5">
              <Tabs defaultValue="top" className="gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-on-surface">
                      Priority views
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                      Start with what is moving, what is slowing down, and what needs
                      replenishment.
                    </p>
                  </div>
                  <TabsList
                    variant="line"
                    className="w-full justify-start p-0 lg:w-auto"
                  >
                    <TabsTrigger value="top">Top sellers</TabsTrigger>
                    <TabsTrigger value="stale">Stale inventory</TabsTrigger>
                    <TabsTrigger value="risk">Low stock</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="top">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {report.highlights.topSelling.length > 0 ? (
                      report.highlights.topSelling.map((item) => (
                        <HighlightCard key={item.productId} item={item} accent="top" />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-surface-container/40 p-5 text-sm text-on-surface-variant md:col-span-2 xl:col-span-4">
                        No sales yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stale">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {report.highlights.staleProducts.length > 0 ? (
                      report.highlights.staleProducts.map((item) => (
                        <HighlightCard key={item.productId} item={item} accent="stale" />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-surface-container/40 p-5 text-sm text-on-surface-variant md:col-span-2 xl:col-span-4">
                        No stale inventory for the selected window.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="risk">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {report.highlights.lowStockProducts.length > 0 ? (
                      report.highlights.lowStockProducts.map((item) => (
                        <HighlightCard key={item.productId} item={item} accent="risk" />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-surface-container/40 p-5 text-sm text-on-surface-variant md:col-span-2 xl:col-span-4">
                        Nothing is under the current low-stock threshold.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            <section className="rounded-[28px] border border-border/50 bg-surface-container-lowest/90 p-4 sm:p-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-on-surface">
                      Inventory registry
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                      Search the full catalog, then sort by stock pressure or sales
                      momentum.
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                    {filteredInventory.length} products
                  </Badge>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.7fr))]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by product, slug, or nav URL"
                      className="h-11 rounded-2xl border-border/60 bg-surface pl-9"
                    />
                  </div>

                  <Select
                    value={stockFilter}
                    onValueChange={(value) => setStockFilter(value as StockFilter)}
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-border/60 bg-surface">
                      <SelectValue placeholder="Stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stock states</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="low-stock">Low stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of stock</SelectItem>
                      <SelectItem value="untracked">Stock pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={movementFilter}
                    onValueChange={(value) =>
                      setMovementFilter(value as MovementFilter)
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-border/60 bg-surface">
                      <SelectValue placeholder="Movement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All movement</SelectItem>
                      <SelectItem value="best-selling">Best seller</SelectItem>
                      <SelectItem value="steady">Steady</SelectItem>
                      <SelectItem value="slow">Cooling</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="no-sales">No sales</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortKey}
                    onValueChange={(value) => setSortKey(value as SortKey)}
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-border/60 bg-surface">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="risk">Sort by risk</SelectItem>
                      <SelectItem value="sold">Most sold</SelectItem>
                      <SelectItem value="revenue">Highest revenue</SelectItem>
                      <SelectItem value="recent">Most recently sold</SelectItem>
                      <SelectItem value="stock-low">Lowest stock first</SelectItem>
                      <SelectItem value="stock-high">Highest stock first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {filteredInventory.length === 0 ? (
                  <div className="rounded-2xl bg-surface-container/40 p-5 text-sm text-on-surface-variant">
                    No products match the current filters.
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const stockMeta = getStockStatusMeta(item.stockStatus);
                    const movementMeta = getMovementMeta(item.movementStatus);

                    return (
                      <article
                        key={item.productId}
                        className="rounded-2xl border border-border/50 bg-surface/80 p-3"
                      >
                        <div className="flex gap-3">
                          <ProductThumb src={item.thumbnailUrl} alt={item.title} />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="space-y-1">
                              <p className="line-clamp-2 text-sm font-semibold text-on-surface">
                                {item.title}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {item.mainNavUrl || "No nav"} • {formatPriceRange(item)}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge className={cn("border-0", stockMeta.className)}>
                                {stockMeta.label}
                              </Badge>
                              <Badge className={cn("border-0", movementMeta.className)}>
                                {movementMeta.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <Metric label="Stock" value={item.totalStock ?? "Pending"} />
                              <Metric label="Sold" value={item.soldUnits} />
                              <Metric label="Revenue" value={formatMoney(item.revenue)} />
                              <Metric label="Last sale" value={formatLastSale(item)} />
                            </div>

                            {item.hasVariants && item.stockBreakdown.length > 0 ? (
                              <details className="rounded-2xl bg-surface-container-low/35 p-3 text-xs">
                                <summary className="cursor-pointer font-medium text-on-surface">
                                  Variant breakdown
                                </summary>
                                <div className="mt-3 space-y-2">
                                  {item.stockBreakdown.map((variant) => (
                                    <div
                                      key={variant.variantId}
                                      className="flex items-center justify-between gap-3"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-on-surface">
                                          {variant.title}
                                        </p>
                                        <p className="truncate text-on-surface-variant">
                                          {variant.sku || "No SKU"}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-on-surface">
                                          {variant.stock} in stock
                                        </p>
                                        <p className="text-on-surface-variant">
                                          {variant.soldUnits} sold
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="mt-4 hidden overflow-hidden rounded-[24px] border border-border/50 md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-surface-container/40">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Product
                        </th>
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Stock
                        </th>
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Sales
                        </th>
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Revenue
                        </th>
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Last sale
                        </th>
                        <th className="px-4 py-3 font-medium text-on-surface-variant">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-10 text-center text-on-surface-variant"
                          >
                            No products match the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item) => {
                          const stockMeta = getStockStatusMeta(item.stockStatus);
                          const movementMeta = getMovementMeta(item.movementStatus);

                          return (
                            <tr
                              key={item.productId}
                              className="border-t border-border/50 align-top"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <ProductThumb src={item.thumbnailUrl} alt={item.title} />
                                  <div className="min-w-0 space-y-1">
                                    <p className="line-clamp-1 font-medium text-on-surface">
                                      {item.title}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                      /{item.slug}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                      {item.mainNavUrl || "No main nav"}{" "}
                                      {item.subNavUrl ? `• ${item.subNavUrl}` : ""}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                      {item.hasVariants
                                        ? `${item.variantCount} variants • ${formatPriceRange(item)}`
                                        : `Simple product • ${formatPriceRange(item)}`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-2">
                                  <p className="font-medium text-on-surface">
                                    {item.totalStock ?? "Pending"}
                                  </p>
                                  <Badge className={cn("border-0", stockMeta.className)}>
                                    {stockMeta.label}
                                  </Badge>
                                  {item.hasVariants ? (
                                    <p className="text-xs text-on-surface-variant">
                                      {item.activeVariantCount} active variants
                                    </p>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-on-surface">
                                    {item.soldUnits} units
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    {item.orderCount} orders
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-on-surface">
                                    {formatMoney(item.revenue)}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    Value: {formatMoney(item.inventoryValue)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-on-surface">
                                    {formatDate(item.lastSoldAt)}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    {formatLastSale(item)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={cn("border-0", movementMeta.className)}>
                                    {movementMeta.label}
                                  </Badge>
                                  {item.isActive ? (
                                    <Badge variant="outline" className="border-border/60">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge className="border-0 bg-surface-container text-on-surface-variant">
                                      Inactive
                                    </Badge>
                                  )}
                                  {item.isStale ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className="border-0 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                          Aging
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>
                                        No sale within the current stale window.
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-[28px] border border-border/50 bg-surface-container-lowest/90 p-6">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <PackageSearch className="size-4" />
              Stock intelligence could not be loaded.
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}



