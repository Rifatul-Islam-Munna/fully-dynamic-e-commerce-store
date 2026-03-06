import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CheckoutOrderResponse } from "@/lib/checkout";
import { formatCurrency } from "@/lib/currency";

export function CheckoutLoadingState() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-muted/35 p-6">
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
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-muted/35 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className="rounded-full bg-background px-3 py-1.5">
            Order placed
          </span>
          <span>
            {order.checkoutMode === "member"
              ? "Member checkout"
              : "Guest checkout"}
          </span>
          {isDirectCheckout ? <span>Direct checkout</span> : null}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {order.orderNumber}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your order has been recorded as pending. Keep this reference for
          follow-up.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Delivery
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {order.customerPhoneNumber}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customerDistrict}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customerAddress}
            </p>
          </div>

          <div className="rounded-[24px] bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Summary
            </p>
            <div className="mt-2 space-y-2 text-sm text-foreground">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              {order.couponCode ? (
                <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
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
      <div className="rounded-[32px] bg-muted/35 p-6 text-center sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background text-foreground">
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
