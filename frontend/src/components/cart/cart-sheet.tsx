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
        size="icon"
        onClick={openCart}
        className="relative size-10 rounded-full text-[#001819] transition-all duration-300 hover:bg-[#eeeeee]"
      >
        <ShoppingBag className="size-[18px]" />
        {totals.quantity > 0 ? (
          <span className="absolute right-1 top-1 flex size-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
            {totals.quantity}
          </span>
        ) : null}
      </Button>

      <Sheet
        open={isOpen}
        onOpenChange={(nextOpen) => (nextOpen ? openCart() : closeCart())}
      >
        <SheetContent side="right" className="w-full border-l-0 bg-surface-container-low sm:max-w-md">
          <SheetHeader className="px-6 pb-6 pt-2">
            <SheetTitle className="font-headline text-2xl font-extrabold tracking-tighter text-on-surface">
              Your Bag
            </SheetTitle>
            <SheetDescription className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              {totals.quantity} item{totals.quantity === 1 ? "" : "s"} selected
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <ShoppingCart className="size-10 text-on-surface-variant/40" />
              <p className="font-body text-sm text-on-surface-variant">
                Your bag is empty. Start curating.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
                {items.map((item) => {
                  const unit = item.unitDiscountPrice ?? item.unitPrice;
                  return (
                    <article
                      key={item.key}
                      className="group flex gap-4 py-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="size-20 rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/product/${encodeURIComponent(item.slug)}`}
                              className="font-headline text-sm font-bold text-on-surface transition-colors hover:text-on-surface-variant"
                              onClick={closeCart}
                            >
                              {item.title}
                            </Link>
                            <p className="mt-1 font-body text-xs text-on-surface-variant">
                              {formatCurrency(Number(unit))}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-on-surface-variant transition-colors hover:text-error"
                            onClick={() => removeItem(item.key)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2">
                            <button
                              type="button"
                              className="text-on-surface-variant transition-colors hover:text-on-surface"
                              onClick={() =>
                                updateQuantity(
                                  item.key,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="mx-4 text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="text-on-surface-variant transition-colors hover:text-on-surface"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <p className="font-headline text-sm font-bold text-on-surface">
                            {formatCurrency(unit * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="bg-surface-container px-6 py-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Total</span>
                  <span className="font-headline text-xl font-extrabold text-on-surface">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button asChild className="h-12 w-full rounded-full bg-primary font-label text-xs font-bold uppercase tracking-[0.1em] text-on-primary hover:opacity-90">
                    <Link
                      href="/checkout"
                      onClick={() => {
                        resetCheckout();
                        clearCheckoutItems();
                        closeCart();
                      }}
                    >
                      <ReceiptText className="mr-2 size-4" />
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 w-full rounded-full bg-surface-container-high font-label text-xs font-bold uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high/80"
                    onClick={clearCart}
                  >
                    Clear Bag
                  </Button>
                  <p className="text-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Secure encrypted transaction
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
