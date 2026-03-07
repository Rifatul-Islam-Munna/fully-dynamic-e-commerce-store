"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";

function parseAmount(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PaymentResultShell({
  status,
}: {
  status: "successful" | "failed";
}) {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const clearCheckoutItems = useCartStore((state) => state.clearCheckoutItems);
  const closeCart = useCartStore((state) => state.closeCart);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const orderNumber = searchParams.get("orderNumber");
  const total = parseAmount(searchParams.get("total"));
  const paidAmount = parseAmount(searchParams.get("paidAmount"));
  const dueAmount = parseAmount(searchParams.get("dueAmount"));
  const message =
    searchParams.get("message") ||
    (status === "successful"
      ? "Your bKash payment was captured and the order was created."
      : "The bKash payment was not completed. You can return to checkout and try again.");

  useEffect(() => {
    closeCart();

    if (status === "successful") {
      clearCart();
      clearCheckoutItems();
      resetCheckout();
    }
  }, [clearCart, clearCheckoutItems, closeCart, resetCheckout, status]);

  const isSuccess = status === "successful";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden rounded-[36px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.48)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <div className="flex items-start gap-4">
              <div
                className={
                  isSuccess
                    ? "flex size-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600"
                    : "flex size-14 items-center justify-center rounded-full bg-amber-500/12 text-amber-600"
                }
              >
                {isSuccess ? (
                  <CheckCircle2 className="size-7" />
                ) : (
                  <CircleAlert className="size-7" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  bKash checkout
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {isSuccess ? "Payment successful" : "Payment not completed"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {message}
                </p>
              </div>
            </div>

            {orderNumber ? (
              <div className="mt-6 rounded-[28px] border border-border/60 bg-background/90 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ReceiptText className="size-4 text-primary" />
                  Order reference
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {orderNumber}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {isSuccess ? (
                <>
                  <Button asChild className="rounded-full px-5">
                    <Link href="/search">Continue shopping</Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-full px-5">
                    <Link href="/">Go home</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="rounded-full px-5">
                    <Link href="/checkout">Return to checkout</Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-full px-5">
                    <Link href="/search">Back to catalog</Link>
                  </Button>
                </>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-[32px] border border-border/60 bg-background/92 p-5">
            <p className="text-sm font-medium text-foreground">
              Payment summary
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {total !== null ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Order total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              ) : null}
              {paidAmount !== null ? (
                <div className="flex items-center justify-between text-[#B10F57]">
                  <span>Paid with bKash</span>
                  <span>{formatCurrency(paidAmount)}</span>
                </div>
              ) : null}
              {dueAmount !== null ? (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Remaining due</span>
                  <span>{formatCurrency(dueAmount)}</span>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
