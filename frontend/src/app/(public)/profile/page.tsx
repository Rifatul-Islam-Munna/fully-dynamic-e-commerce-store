import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { getAccountDashboard } from "@/lib/account";
import { cn } from "@/lib/utils";

function formatDate(value?: string | null) {
  if (!value) {
    return "No orders yet";
  }

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

export default async function ProfileDashboardPage() {
  const dashboard = await getAccountDashboard();
  const { summary, activeOrders, recentOrders } = dashboard;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Stats grid ── */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total orders"
          value={String(summary.totalOrders)}
          sub={`${summary.totalItems} items`}
        />
        <StatCard
          icon={Clock3}
          label="Active"
          value={String(summary.activeOrders)}
          sub={`${summary.pendingOrders} pending`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Spent"
          value={formatCurrency(summary.confirmedSpend)}
          sub={`${formatCurrency(summary.activeValue)} active`}
        />
        <StatCard
          icon={PackageCheck}
          label="Last order"
          value={formatDate(summary.lastOrderAt)}
          sub={`${summary.cancelledOrders} cancelled`}
        />
      </section>

      {/* ── Active orders ── */}
      <section className="rounded-xl border border-border/60 bg-background sm:rounded-2xl">
        <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Active orders
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Orders currently in progress
          </p>
        </div>
        <div className="p-3 sm:p-4">
          {activeOrders.length === 0 ? (
            <div className="rounded-xl bg-muted/30 px-4 py-6 text-center sm:py-8">
              <p className="text-sm font-medium text-foreground">
                No active orders
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                New orders will appear here after checkout.
              </p>
              <Button asChild size="sm" className="mt-3 rounded-full">
                <Link href="/search">Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border/50 bg-muted/10 p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">
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
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {order.itemCount} items • {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {order.firstItem ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full text-xs"
                      >
                        <Link href={`/product/${order.firstItem.productSlug}`}>
                          View
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Recent orders ── */}
      <section className="rounded-xl border border-border/60 bg-background sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Recent orders
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Your latest purchases
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-primary"
          >
            <Link
              href="/profile/orders"
              className="inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
        <div className="p-3 sm:p-4">
          {recentOrders.length === 0 ? (
            <div className="rounded-xl bg-muted/30 px-4 py-6 text-center sm:py-8">
              <p className="text-sm font-medium text-foreground">
                No orders yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Your order history will appear after your first checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={
                    order.firstItem
                      ? `/product/${order.firstItem.productSlug}`
                      : "/profile/orders"
                  }
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-2.5 transition-colors hover:bg-muted/20 sm:p-3"
                >
                  {order.firstItem?.productThumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.firstItem.productThumbnailUrl}
                      alt={order.firstItem.productTitle}
                      className="size-12 rounded-lg object-cover sm:size-14"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground sm:size-14">
                      Order
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {order.firstItem?.productTitle || order.orderNumber}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px]",
                          getStatusTone(order.status),
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.orderNumber} • {order.itemCount} items •{" "}
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3 shadow-sm sm:p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
          <Icon className="size-3.5 sm:size-4" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
        {sub}
      </p>
    </div>
  );
}
