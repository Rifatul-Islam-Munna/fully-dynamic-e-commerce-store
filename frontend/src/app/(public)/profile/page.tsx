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
    return "bg-[#fdf3e7] text-[#92400e]";
  }

  if (status === "confirmed") {
    return "bg-primary-container text-on-primary-container";
  }

  return "bg-[#fde8e8] text-[#991b1b]";
}

export default async function ProfileDashboardPage() {
  const dashboard = await getAccountDashboard();
  const { summary, activeOrders, recentOrders } = dashboard;

  return (
    <div className="space-y-8">
      {/* ── Stats grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-container">
          <h2 className="font-headline text-lg font-extrabold tracking-tighter text-on-surface">
            Active orders
          </h2>
          <p className="mt-0.5 font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">
            Orders currently in progress
          </p>
        </div>
        <div className="p-6">
          {activeOrders.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl px-6 py-10 text-center">
              <p className="font-headline text-sm font-bold text-on-surface">
                No active orders
              </p>
              <p className="mt-1 font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">
                New orders will appear here after checkout.
              </p>
              <Button asChild size="sm" className="mt-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest shadow-none">
                <Link href="/search">Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-container-low/50 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-headline text-sm font-bold text-on-surface">
                          {order.orderNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            getStatusTone(order.status),
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">
                        {order.itemCount} items • {formatCurrency(order.total)}
                      </p>
                      <p className="font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {order.firstItem ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="shrink-0 rounded-full bg-surface-container-high px-4 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface"
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
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-surface-container">
          <div>
            <h2 className="font-headline text-lg font-extrabold tracking-tighter text-on-surface">
              Recent orders
            </h2>
            <p className="mt-0.5 font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">
              Your latest purchases
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary"
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
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl px-6 py-10 text-center">
              <p className="font-headline text-sm font-bold text-on-surface">
                No orders yet
              </p>
              <p className="mt-1 font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">
                Your order history will appear after your first checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={
                    order.firstItem
                      ? `/product/${order.firstItem.productSlug}`
                      : "/profile/orders"
                  }
                  className="flex items-center gap-4 bg-surface-container-low/30 rounded-xl p-4 transition-colors hover:bg-surface-container-low"
                >
                  {order.firstItem?.productThumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.firstItem.productThumbnailUrl}
                      alt={order.firstItem.productTitle}
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-lg bg-surface-container font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Order
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-headline text-sm font-bold text-on-surface">
                        {order.firstItem?.productTitle || order.orderNumber}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          getStatusTone(order.status),
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 font-body text-xs text-on-surface-variant">
                      {order.orderNumber} • {order.itemCount} items •{" "}
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-on-surface-variant" />
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
    <div className="bg-surface-container-lowest p-8 rounded-xl h-40 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
          <Icon className="size-4" />
        </div>
        <p className="font-label text-[0.65rem] uppercase tracking-widest text-on-surface-variant">{label}</p>
      </div>
      <div>
        <p className="font-headline text-3xl font-black tracking-tighter text-on-surface">
          {value}
        </p>
        <p className="mt-1 font-label text-[0.6rem] uppercase tracking-widest text-on-surface-variant">
          {sub}
        </p>
      </div>
    </div>
  );
}
