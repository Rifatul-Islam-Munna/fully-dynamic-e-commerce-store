"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPinned,
  ReceiptText,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import {
  buildCouponPreviewPayload,
  buildCheckoutPayload,
  type CheckoutFormState,
  type CheckoutPricingResponse,
  type CheckoutOrderResponse,
  type CheckoutPageUser,
} from "@/lib/checkout";
import {
  useCheckoutStore,
  type CheckoutFieldErrors,
} from "@/store/checkout-store";
import { getCartTotals, useCartStore } from "@/store/cart-store";

function validateCheckoutForm(form: CheckoutFormState) {
  const errors: CheckoutFieldErrors = {};
  const trimmedEmail = form.email.trim();

  if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
    errors.email = "Use a valid email address or leave it empty.";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (!form.district.trim()) {
    errors.district = "District is required.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  }

  return errors;
}

const FLAT_FIELD_STYLE = { boxShadow: "none" } as const;
const SECTION_CLASS_NAME =
  "rounded-[28px] bg-background p-4 sm:p-5";
const FIELD_SHELL_CLASS_NAME =
  "rounded-[22px] border border-border/70 bg-muted/30 px-4 py-3 transition-colors focus-within:border-foreground/20 focus-within:bg-muted/15";
const INPUT_CLASS_NAME =
  "mt-1 h-auto border-0 bg-transparent px-0 py-0 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/65 focus-visible:ring-0";
const TEXTAREA_CLASS_NAME =
  "mt-1 min-h-28 border-0 bg-transparent px-0 py-0 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/65 focus-visible:ring-0";

export function CheckoutPageShell({
  initialUser,
}: {
  initialUser: CheckoutPageUser | null;
}) {
  const cartItems = useCartStore((state) => state.items);
  const checkoutItems = useCartStore((state) => state.checkoutItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearCheckoutItems = useCartStore((state) => state.clearCheckoutItems);
  const closeCart = useCartStore((state) => state.closeCart);
  const form = useCheckoutStore((state) => state.form);
  const fieldErrors = useCheckoutStore((state) => state.fieldErrors);
  const order = useCheckoutStore((state) => state.order);
  const pricing = useCheckoutStore((state) => state.pricing);
  const hydrateFromUser = useCheckoutStore((state) => state.hydrateFromUser);
  const setField = useCheckoutStore((state) => state.setField);
  const setFieldErrors = useCheckoutStore((state) => state.setFieldErrors);
  const clearFieldError = useCheckoutStore((state) => state.clearFieldError);
  const setOrder = useCheckoutStore((state) => state.setOrder);
  const setPricing = useCheckoutStore((state) => state.setPricing);
  const resetPricing = useCheckoutStore((state) => state.resetPricing);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const [isHydrated, setIsHydrated] = useState(() =>
    useCartStore.persist.hasHydrated(),
  );
  const [isPending, startTransition] = useTransition();
  const [isCouponPending, startCouponTransition] = useTransition();
  const previousCartSignatureRef = useRef<string | null>(null);
  const items = checkoutItems ?? cartItems;
  const isDirectCheckout = checkoutItems !== null;

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    hydrateFromUser(initialUser);
  }, [hydrateFromUser, initialUser]);

  const cartSignature = useMemo(
    () =>
      items
        .map(
          (item) =>
            `${item.key}:${item.quantity}:${item.unitDiscountPrice ?? item.unitPrice}`,
        )
        .join("|"),
    [items],
  );

  useEffect(() => {
    if (
      previousCartSignatureRef.current !== null &&
      previousCartSignatureRef.current !== cartSignature &&
      pricing
    ) {
      resetPricing();
    }
    previousCartSignatureRef.current = cartSignature;
  }, [cartSignature, pricing, resetPricing]);

  const totals = getCartTotals(items);
  const displaySubtotal = pricing?.subtotal ?? totals.total;
  const displayDiscount = pricing?.discountAmount ?? 0;
  const displayTotal = pricing?.total ?? totals.total;

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setField(field, value);
    clearFieldError(field);
    if (field === "couponCode" && pricing) {
      resetPricing();
    }
  };

  const applyCoupon = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!form.couponCode.trim()) {
      resetPricing();
      toast.error("Enter a coupon code first.");
      return;
    }

    startCouponTransition(() => {
      void (async () => {
        const response = await fetch("/api/checkout/coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildCouponPreviewPayload(form.couponCode, items)),
        });

        const payload = (await response.json().catch(() => null)) as
          | (CheckoutPricingResponse & { message?: string })
          | { message?: string }
          | null;

        if (!response.ok) {
          resetPricing();
          toast.error(payload?.message || "Coupon is not valid.");
          return;
        }

        const nextPricing = payload as CheckoutPricingResponse;
        setPricing(nextPricing);
        setField("couponCode", nextPricing.coupon?.code ?? form.couponCode);
        toast.success("Coupon applied.");
      })();
    });
  };

  const submitCheckout = () => {
    const nextErrors = validateCheckoutForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the checkout form.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildCheckoutPayload(form, items)),
        });

        const payload = (await response.json().catch(() => null)) as
          | (CheckoutOrderResponse & { message?: string })
          | { message?: string }
          | null;

        if (!response.ok) {
          toast.error(payload?.message || "Checkout failed.");
          return;
        }

        if (isDirectCheckout) {
          clearCheckoutItems();
        } else {
          clearCart();
        }
        closeCart();
        setOrder(payload as CheckoutOrderResponse);
        toast.success("Checkout created successfully.");
      })();
    });
  };

  if (!isHydrated) {
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

  if (order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-muted/35 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1.5">
              Order placed
            </span>
            <span>{order.checkoutMode === "member" ? "Member checkout" : "Guest checkout"}</span>
            {isDirectCheckout ? <span>Direct checkout</span> : null}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {order.orderNumber}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your order has been recorded as pending. Keep this reference for follow-up.
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
              <Link
                href="/search"
                onClick={() => {
                  resetCheckout();
                  clearCheckoutItems();
                }}
              >
                Continue shopping
              </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full px-5">
              <Link
                href="/"
                onClick={() => {
                  resetCheckout();
                  clearCheckoutItems();
                }}
              >
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
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
            <Link
              href="/search"
              onClick={() => {
                resetCheckout();
                clearCheckoutItems();
              }}
            >
              Browse products
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-10 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/search"
          onClick={() => {
            resetCheckout();
            clearCheckoutItems();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-muted/35 px-3 py-2 transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[32px] bg-muted/35 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1.5">
              {initialUser ? "Member checkout" : "Guest checkout"}
            </span>
            <span>
              {initialUser
                ? "Your order will be linked to your account."
                : "You can checkout without logging in."}
            </span>
            {isDirectCheckout ? <span>Direct checkout for selected item</span> : null}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Checkout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Fill in the visible fields below, apply a coupon if you have one, and place the order.
          </p>

          <form
            className="mt-5 space-y-3 sm:space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitCheckout();
            }}
          >
            <div className="rounded-[28px] bg-background p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Ready to place order
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    Review the total, then submit once the fields are complete.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-[22px] border border-border/70 bg-muted/30 px-4 py-3 sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Payable total
                    </p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {formatCurrency(displayTotal)}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full px-6 sm:w-auto"
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Place order
                  </Button>
                </div>
              </div>
            </div>

            <div className={SECTION_CLASS_NAME}>
              <div className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-muted/50 text-foreground">
                  <ReceiptText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Contact details</p>
                  <p className="text-sm text-muted-foreground">
                    These are the main fields the customer needs to complete.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className={FIELD_SHELL_CLASS_NAME}>
                    <Label
                      htmlFor="checkout-email"
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Email (optional)
                    </Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder={initialUser?.email || "name@example.com"}
                      className={INPUT_CLASS_NAME}
                      style={FLAT_FIELD_STYLE}
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Leave empty to checkout without email.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className={FIELD_SHELL_CLASS_NAME}>
                    <Label
                      htmlFor="checkout-phone"
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Phone number
                    </Label>
                    <Input
                      id="checkout-phone"
                      value={form.phoneNumber}
                      onChange={(event) =>
                        updateField("phoneNumber", event.target.value)
                      }
                      placeholder="+8801700000000"
                      className={INPUT_CLASS_NAME}
                      style={FLAT_FIELD_STYLE}
                    />
                  </div>
                  {fieldErrors.phoneNumber ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Use the number the delivery team should call.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={SECTION_CLASS_NAME}>
              <div className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-muted/50 text-foreground">
                  <MapPinned className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Delivery address</p>
                  <p className="text-sm text-muted-foreground">
                    Add the exact district and full address for delivery.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className={FIELD_SHELL_CLASS_NAME}>
                    <Label
                      htmlFor="checkout-district"
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      District
                    </Label>
                    <Input
                      id="checkout-district"
                      value={form.district}
                      onChange={(event) => updateField("district", event.target.value)}
                      placeholder="Dhaka"
                      className={INPUT_CLASS_NAME}
                      style={FLAT_FIELD_STYLE}
                    />
                  </div>
                  {fieldErrors.district ? (
                    <p className="text-xs text-destructive">{fieldErrors.district}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Enter the district or delivery zone.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className={FIELD_SHELL_CLASS_NAME}>
                    <Label
                      htmlFor="checkout-address"
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Address
                    </Label>
                    <Textarea
                      id="checkout-address"
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      placeholder="House, road, area, landmark"
                      className={TEXTAREA_CLASS_NAME}
                      style={FLAT_FIELD_STYLE}
                    />
                  </div>
                  {fieldErrors.address ? (
                    <p className="text-xs text-destructive">{fieldErrors.address}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Include house, road, area, and any useful landmark.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={SECTION_CLASS_NAME}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-muted/50 text-foreground">
                  <TicketPercent className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Coupon code
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type a coupon here and apply it before submitting the order.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className={`${FIELD_SHELL_CLASS_NAME} sm:flex-1`}>
                      <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Coupon
                      </Label>
                      <Input
                        value={form.couponCode}
                        onChange={(event) =>
                          updateField("couponCode", event.target.value)
                        }
                        placeholder="Enter coupon code"
                        className={INPUT_CLASS_NAME}
                        style={FLAT_FIELD_STYLE}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-12 rounded-full px-5 sm:self-end"
                      onClick={applyCoupon}
                      disabled={isCouponPending}
                    >
                      {isCouponPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Apply
                    </Button>
                  </div>

                  {pricing?.coupon ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                        {pricing.coupon.code}
                      </span>
                      <span className="text-muted-foreground">
                        {pricing.coupon.type === "percentage"
                          ? `${pricing.coupon.amount}% off`
                          : `${formatCurrency(pricing.coupon.amount)} off`}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-background p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Final action
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    Use the bottom button if you review the form from top to bottom.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full px-6 sm:w-auto"
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Place order
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="h-12 w-full rounded-full px-6 sm:w-auto"
                  >
                    <Link
                      href="/search"
                      onClick={() => {
                        resetCheckout();
                        clearCheckoutItems();
                      }}
                    >
                      Back to catalog
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[32px] bg-muted/35 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ReceiptText className="size-4" />
              Order summary
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const unit = item.unitDiscountPrice ?? item.unitPrice;

                return (
                  <article
                    key={item.key}
                    className="rounded-[24px] bg-background p-3"
                  >
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="size-16 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Qty {item.quantity}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {formatCurrency(unit * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 rounded-[24px] bg-background p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Items</span>
                <span>{totals.quantity}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(displaySubtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Discount</span>
                <span className={displayDiscount > 0 ? "text-primary" : ""}>
                  {displayDiscount > 0
                    ? `-${formatCurrency(displayDiscount)}`
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(displayTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
