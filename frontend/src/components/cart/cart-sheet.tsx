"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/currency";
import { useCheckoutStore } from "@/store/checkout-store";
import { getCartTotals, useCartStore } from "@/store/cart-store";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const clearCheckoutItems = useCartStore((state) => state.clearCheckoutItems);
  const isOpen = useCartStore((state) => state.isOpen);
  const needsSync = useCartStore((state) => state.needsSync);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const markSynced = useCartStore((state) => state.markSynced);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const totals = useMemo(() => getCartTotals(items), [items]);

  useEffect(() => {
    if (!needsSync || items.length === 0) {
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId ?? undefined,
              quantity: item.quantity,
            })),
          }),
        });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json().catch(() => null)) as {
          failedCount?: number;
        } | null;

        if ((payload?.failedCount ?? 0) === 0) {
          markSynced();
        }
      } catch {
        // ignore sync failures; local cart remains source of truth
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [isOpen, items, markSynced, needsSync]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openCart}
        className="relative h-9 gap-2 rounded-full border border-border/60 px-3 text-sm"
      >
        <ShoppingCart className="size-4" />
        <span className="hidden sm:inline">Cart</span>
        {totals.quantity > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {totals.quantity}
          </span>
        ) : null}
      </Button>

      <Sheet
        open={isOpen}
        onOpenChange={(nextOpen) => (nextOpen ? openCart() : closeCart())}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="border-b border-border/60 pb-3">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Your Cart
            </SheetTitle>
            <SheetDescription>
              Fast local cart with automatic session sync when logged in.
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
              <ShoppingCart className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Your cart is empty. Add products to see them here.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {items.map((item) => {
                  const unit = item.unitDiscountPrice ?? item.unitPrice;
                  return (
                    <article
                      key={item.key}
                      className="rounded-lg border border-border/70 bg-card p-3"
                    >
                      <div className="flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="size-16 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link
                            href={`/product/${encodeURIComponent(item.slug)}`}
                            className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary"
                            onClick={closeCart}
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(Number(unit))}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-md border border-border/70 p-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(unit * item.quantity)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="border-t border-border/60 px-4 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-base font-bold">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button asChild className="h-10 w-full">
                    <Link
                      href="/checkout"
                      onClick={() => {
                        resetCheckout();
                        clearCheckoutItems();
                        closeCart();
                      }}
                    >
                      <ReceiptText className="size-4" />
                      Checkout
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
