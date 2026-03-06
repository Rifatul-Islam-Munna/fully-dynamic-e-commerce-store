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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total orders"
          value={String(summary.totalOrders)}
          description={`${summary.totalItems} items purchased`}
        />
        <StatCard
          icon={Clock3}
          label="Active orders"
          value={String(summary.activeOrders)}
          description={`${summary.pendingOrders} pending review`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Confirmed spend"
          value={formatCurrency(summary.confirmedSpend)}
          description={`Active order value ${formatCurrency(summary.activeValue)}`}
        />
        <StatCard
          icon={PackageCheck}
          label="Last order"
          value={formatDate(summary.lastOrderAt)}
          description={`${summary.cancelledOrders} cancelled orders`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="border-border/70 bg-background/95 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.2)]">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-xl">Active order status</CardTitle>
            <CardDescription>
              These are the latest orders that still need your attention or are
              currently moving through the order flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {activeOrders.length === 0 ? (
              <div className="rounded-[24px] bg-muted/18 px-5 py-8 text-center">
                <p className="text-base font-semibold text-foreground">
                  No active orders right now
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  When you place a new order, its status will appear here so you
                  can quickly see what is happening.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/search">Continue shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[24px] border border-border/70 bg-muted/10 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {order.orderNumber}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("rounded-full", getStatusTone(order.status))}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {order.itemCount} items • {formatCurrency(order.total)} •{" "}
                          {order.customerDistrict}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Ordered on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {order.firstItem ? (
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href={`/product/${order.firstItem.productSlug}`}>
                            Open item
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/95 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.2)]">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-xl">Account shortcuts</CardTitle>
            <CardDescription>
              Use these pages when you want to update your information or improve
              account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <ShortcutCard
              href="/profile/edit"
              title="Edit profile information"
              description="Update your name, email, phone number, or avatar."
              buttonLabel="Open profile settings"
            />
            <ShortcutCard
              href="/profile/password"
              title="Change password"
              description="Choose a new sign-in password and keep your account secure."
              buttonLabel="Open password page"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-background/95 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.2)]">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-xl">Recent orders</CardTitle>
          <CardDescription>
            Your latest orders are listed here so you can quickly recognize them
            and jump back to the related products.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {recentOrders.length === 0 ? (
            <div className="rounded-[24px] bg-muted/18 px-5 py-8 text-center">
              <p className="text-base font-semibold text-foreground">
                No orders yet
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your order history will appear here after your first checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {order.firstItem?.productThumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.firstItem.productThumbnailUrl}
                        alt={order.firstItem.productTitle}
                        className="size-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-muted-foreground">
                        Order
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {order.orderNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn("rounded-full", getStatusTone(order.status))}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-foreground">
                        {order.firstItem?.productTitle || "Order items"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {order.itemCount} items • {formatCurrency(order.total)} •{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {order.firstItem ? (
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href={`/product/${order.firstItem.productSlug}`}>
                          Shop this item
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-[0_16px_50px_-44px_rgba(15,23,42,0.2)]">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ShortcutCard({
  href,
  title,
  description,
  buttonLabel,
}: {
  href: string;
  title: string;
  description: string;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-muted/12 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Button asChild variant="outline" className="mt-4 rounded-full">
        <Link href={href} className="inline-flex items-center gap-2">
          <span>{buttonLabel}</span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

