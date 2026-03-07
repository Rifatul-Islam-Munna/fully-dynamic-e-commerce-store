import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CheckoutOrderResponse } from "@/lib/checkout";
import { formatCurrency } from "@/lib/currency";

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CheckoutLoadingState() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.8),rgba(255,255,255,1))] p-6 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.45)]">
        <div className="h-6 w-32 animate-pulse rounded-full bg-muted/70" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/60" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/60" />
            <div className="h-32 animate-pulse rounded-[24px] bg-muted/60" />
          </div>
          <div className="h-64 animate-pulse rounded-[24px] bg-muted/60" />
        </div>
      </div>
    </main>
  );
}

export function CheckoutOrderCompleteState({
  order,
  isDirectCheckout,
  onResetNavigation,
}: {
  order: CheckoutOrderResponse;
  isDirectCheckout: boolean;
  onResetNavigation: () => void;
}) {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_30%),linear-gradient(180deg,rgba(248,250,252,0.95),rgba(248,250,252,0))]" />

      <div className="overflow-hidden rounded-[38px] border border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.82),rgba(255,255,255,1)_24%,rgba(255,255,255,1))] p-6 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.48)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
                  <CheckCircle2 className="size-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="rounded-full border border-border/60 bg-background/85 px-3 py-1.5">
                      Order received
                    </span>
                    <span className="rounded-full border border-border/60 bg-background/65 px-3 py-1.5">
                      {order.checkoutMode === "member"
                        ? "Member checkout"
                        : "Guest checkout"}
                    </span>
                    {isDirectCheckout ? (
                      <span className="rounded-full border border-border/60 bg-background/65 px-3 py-1.5">
                        Direct checkout
                      </span>
                    ) : null}
                  </div>

                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
                    {order.orderNumber}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Your order has been recorded as pending. The team can now
                    review the items, address, and total before confirming it.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/60 bg-background/90 px-4 py-4 lg:min-w-[220px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Submitted
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {formatOrderDate(order.createdAt)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Status: pending
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-border/60 bg-background/90 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPinned className="size-4 text-primary" />
                  Delivery details
                </div>
                <div className="mt-4 space-y-2 text-sm text-foreground">
                  <p className="font-medium">{order.customerPhoneNumber}</p>
                  {order.customerEmail ? (
                    <p className="text-muted-foreground">{order.customerEmail}</p>
                  ) : null}
                  <p>{order.customerDistrict}</p>
                  <p className="text-muted-foreground">{order.customerAddress}</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-border/60 bg-background/90 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock3 className="size-4 text-primary" />
                  What happens next
                </div>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>The order stays pending until the admin team confirms it.</p>
                  <p>
                    Keep the order number handy in case you need follow-up or
                    support.
                  </p>
                  <div className="flex items-start gap-2 rounded-[22px] bg-muted/35 px-3 py-3 text-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>Submitted totals and delivery details are now locked in for review.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ReceiptText className="size-4 text-primary" />
                Ordered items
              </div>

              <div className="mt-4 space-y-3">
                {order.items.map((item) => {
                  const unitPrice = item.unitDiscountPrice ?? item.unitPrice;

                  return (
                    <article
                      key={item.id}
                      className="rounded-[28px] border border-border/60 bg-background/92 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4">
                          {item.productThumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productThumbnailUrl}
                              alt={item.productTitle}
                              className="size-20 rounded-[22px] object-cover"
                            />
                          ) : (
                            <div className="flex size-20 items-center justify-center rounded-[22px] bg-muted text-muted-foreground">
                              <ShoppingBag className="size-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-base font-semibold text-foreground">
                              {item.productTitle}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                                Qty {item.quantity}
                              </span>
                              {item.variantTitle ? (
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                                  {item.variantTitle}
                                </span>
                              ) : null}
                              <span className="rounded-full bg-background px-2.5 py-1 text-muted-foreground">
                                Unit {formatCurrency(unitPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:ml-auto sm:text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Line total
                          </p>
                          <p className="mt-1 text-lg font-semibold text-foreground">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-[32px] border border-border/60 bg-background/92 p-5 shadow-[0_24px_72px_-54px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ReceiptText className="size-4 text-primary" />
              Confirmation summary
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.couponCode ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Coupon</span>
                  <span className="font-medium text-primary">
                    {order.couponCode}
                  </span>
                </div>
              ) : null}
              {order.discountAmount > 0 ? (
                <div className="flex items-center justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-muted/35 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Reference
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {order.orderNumber}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep this number for support or status follow-up.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Button asChild className="rounded-full px-5">
                <Link href="/search" onClick={onResetNavigation}>
                  Continue shopping
                </Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-full px-5">
                <Link href="/" onClick={onResetNavigation}>
                  Go home
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function CheckoutEmptyState({
  onResetNavigation,
}: {
  onResetNavigation: () => void;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.82),rgba(255,255,255,1))] p-6 text-center shadow-[0_28px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]">
          <ShoppingBag className="size-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products first, then come back here to complete checkout.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/search" onClick={onResetNavigation}>
            Browse products
          </Link>
        </Button>
      </div>
    </main>
  );
}
