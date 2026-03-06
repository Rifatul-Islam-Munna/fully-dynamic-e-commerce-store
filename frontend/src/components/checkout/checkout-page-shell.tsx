"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckoutBackLink,
  CheckoutFormPanel,
  CheckoutSummaryAside,
} from "@/components/checkout/checkout-page-shell-sections";
import {
  CheckoutEmptyState,
  CheckoutLoadingState,
  CheckoutOrderCompleteState,
} from "@/components/checkout/checkout-page-shell-states";
import { validateCheckoutForm } from "@/components/checkout/checkout-page-shell.constants";
import {
  buildCouponPreviewPayload,
  buildCheckoutPayload,
  type CheckoutFormState,
  type CheckoutOrderResponse,
  type CheckoutPageUser,
  type CheckoutPricingResponse,
} from "@/lib/checkout";
import {
  useCheckoutStore,
  type CheckoutFieldErrors,
} from "@/store/checkout-store";
import { getCartTotals, useCartStore } from "@/store/cart-store";

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
    const nextErrors: CheckoutFieldErrors = validateCheckoutForm(form);
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

  const handleResetNavigation = () => {
    resetCheckout();
    clearCheckoutItems();
  };

  if (!isHydrated) {
    return <CheckoutLoadingState />;
  }

  if (order) {
    return (
      <CheckoutOrderCompleteState
        order={order}
        isDirectCheckout={isDirectCheckout}
        onResetNavigation={handleResetNavigation}
      />
    );
  }

  if (items.length === 0) {
    return <CheckoutEmptyState onResetNavigation={handleResetNavigation} />;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-10 sm:px-6 sm:py-8 lg:px-8">
      <CheckoutBackLink onResetNavigation={handleResetNavigation} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <CheckoutFormPanel
          initialUser={initialUser}
          isDirectCheckout={isDirectCheckout}
          form={form}
          fieldErrors={fieldErrors}
          pricing={pricing}
          displayTotal={displayTotal}
          isPending={isPending}
          isCouponPending={isCouponPending}
          onUpdateField={updateField}
          onApplyCoupon={applyCoupon}
          onSubmit={submitCheckout}
          onResetNavigation={handleResetNavigation}
        />
        <CheckoutSummaryAside
          items={items}
          totals={totals}
          displaySubtotal={displaySubtotal}
          displayDiscount={displayDiscount}
          displayTotal={displayTotal}
        />
      </div>
    </main>
  );
}
