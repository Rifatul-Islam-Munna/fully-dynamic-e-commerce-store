"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { AccountOrderCard } from "@/lib/account";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusTone(status: string) {
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

type OrderHistoryListProps = {
  orders: AccountOrderCard[];
};

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  return (
    <div className="rounded-xl border border-border/60 bg-surface sm:rounded-2xl">
      {/* ── Header + filter tabs ── */}
      <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-on-surface sm:text-lg">
          Order history
        </h2>
        <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
          All your past and current orders
        </p>

        {/* ── Filter tabs ── */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count =
              filter.value === "all"
                ? orders.length
                : orders.filter((o) => o.status === filter.value).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container/60 text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-white/20 text-on-primary"
                      : "bg-surface text-on-surface-variant",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Order list ── */}
      <div className="p-3 sm:p-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl bg-surface-container-low px-4 py-8 text-center sm:py-10">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-container/60 text-on-surface-variant">
              <Package className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-on-surface">
              {activeFilter === "all"
                ? "No orders yet"
                : `No ${activeFilter} orders`}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {activeFilter === "all"
                ? "Your order history will appear after your first checkout."
                : "Orders with this status will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-border/40 bg-surface p-3 transition-colors hover:bg-surface-container-low/30 sm:p-4"
              >
                <div className="flex items-start gap-3">
                  {/* ── Thumbnail ── */}
                  {order.firstItem?.productThumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.firstItem.productThumbnailUrl}
                      alt={order.firstItem.productTitle}
                      className="size-14 shrink-0 rounded-lg object-cover sm:size-16"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-container text-xs font-medium text-on-surface-variant sm:size-16">
                      Order
                    </div>
                  )}

                  {/* ── Order info ── */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-on-surface">
                        {order.orderNumber}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px]",
                          getStatusTone(order.status),
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    {order.firstItem && (
                      <p className="mt-1 truncate text-sm text-on-surface">
                        {order.firstItem.productTitle}
                        {order.firstItem.variantTitle
                          ? ` — ${order.firstItem.variantTitle}`
                          : ""}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-on-surface-variant">
                      <span>{order.itemCount} items</span>
                      <span>{formatCurrency(order.total)}</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    {order.customerDistrict && (
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        📍 {order.customerDistrict}
                      </p>
                    )}
                  </div>

                  {/* ── Action ── */}
                  {order.firstItem && (
                    <Link
                      href={`/product/${order.firstItem.productSlug}`}
                      className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface sm:size-9"
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
