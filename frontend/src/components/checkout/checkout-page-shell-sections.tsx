import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  TicketPercent,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FIELD_SHELL_CLASS_NAME,
  FLAT_FIELD_STYLE,
  INPUT_CLASS_NAME,
  SECTION_CLASS_NAME,
  TEXTAREA_CLASS_NAME,
} from "@/components/checkout/checkout-page-shell.constants";
import {
  type CheckoutFormState,
  type CheckoutPageUser,
  type CheckoutPricingResponse,
} from "@/lib/checkout";
import { formatCurrency } from "@/lib/currency";
import { type LocalCartItem } from "@/store/cart-store";
import { type CheckoutFieldErrors } from "@/store/checkout-store";

export function CheckoutBackLink({
  onResetNavigation,
}: {
  onResetNavigation: () => void;
}) {
  return (
    <div className="mb-5 flex items-center gap-2 text-sm text-on-surface-variant">
      <Link
        href="/search"
        onClick={onResetNavigation}
        className="inline-flex items-center gap-2 rounded-full bg-surface-container px-5 py-2.5 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-surface-container-high"
      >
        <ArrowLeft className="size-4" />
        Continue shopping
      </Link>
    </div>
  );
}

function CheckoutActionButtons({
  showPlaceOrderButton,
  showBkashCheckoutButton,
  isPending,
  isBkashPending,
  bkashPayableAmount,
  onSubmit,
  onSubmitBkash,
}: {
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
  isPending: boolean;
  isBkashPending: boolean;
  bkashPayableAmount: number;
  onSubmit: () => void;
  onSubmitBkash: () => void;
}) {
  if (!showPlaceOrderButton && !showBkashCheckoutButton) {
    return (
      <div className="rounded-sm bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface-variant">
        Checkout is temporarily unavailable because no checkout action is enabled
        in site settings.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      {showPlaceOrderButton ? (
        <Button
          type="button"
          className="h-12 w-full rounded-full px-6 font-headline text-xs font-bold uppercase tracking-widest shadow-none hover:opacity-90 sm:w-auto"
          disabled={isPending || isBkashPending}
          onClick={onSubmit}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Place order
        </Button>
      ) : null}

      {showBkashCheckoutButton ? (
        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full rounded-full border border-[#E2136E]/15 bg-[#E2136E]/10 px-6 text-[#B10F57] hover:bg-[#E2136E]/15 sm:w-auto"
          disabled={isPending || isBkashPending}
          onClick={onSubmitBkash}
        >
          {isBkashPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Pay {formatCurrency(bkashPayableAmount)} with bKash
        </Button>
      ) : null}
    </div>
  );
}

function CheckoutContactSection({
  form,
  fieldErrors,
  initialUser,
  onUpdateField,
}: {
  form: CheckoutFormState;
  fieldErrors: CheckoutFieldErrors;
  initialUser: CheckoutPageUser | null;
  onUpdateField: (field: keyof CheckoutFormState, value: string) => void;
}) {
  return (
    <div className={SECTION_CLASS_NAME}>
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-surface-container/50 text-on-surface">
          <ReceiptText className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">Contact details</p>
          <p className="text-sm text-on-surface-variant">
            Add the phone number and optional email for this order.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className={FIELD_SHELL_CLASS_NAME}>
            <Label
              htmlFor="checkout-email"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant"
            >
              Email (optional)
            </Label>
            <Input
              id="checkout-email"
              type="email"
              value={form.email}
              onChange={(event) => onUpdateField("email", event.target.value)}
              placeholder={initialUser?.email || "name@example.com"}
              className={INPUT_CLASS_NAME}
              style={FLAT_FIELD_STYLE}
            />
          </div>
          {fieldErrors.email ? (
            <p className="text-xs text-error">{fieldErrors.email}</p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Leave empty if you do not want to use email for this order.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className={FIELD_SHELL_CLASS_NAME}>
            <Label
              htmlFor="checkout-phone"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant"
            >
              Phone number
            </Label>
            <Input
              id="checkout-phone"
              value={form.phoneNumber}
              onChange={(event) =>
                onUpdateField("phoneNumber", event.target.value)
              }
              placeholder="+8801700000000"
              className={INPUT_CLASS_NAME}
              style={FLAT_FIELD_STYLE}
            />
          </div>
          {fieldErrors.phoneNumber ? (
            <p className="text-xs text-error">
              {fieldErrors.phoneNumber}
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Use the number the delivery team should call first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutAddressSection({
  form,
  fieldErrors,
  onUpdateField,
}: {
  form: CheckoutFormState;
  fieldErrors: CheckoutFieldErrors;
  onUpdateField: (field: keyof CheckoutFormState, value: string) => void;
}) {
  return (
    <div className={SECTION_CLASS_NAME}>
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-surface-container/50 text-on-surface">
          <MapPinned className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">
            Delivery address
          </p>
          <p className="text-sm text-on-surface-variant">
            Use a clear district and full address so the order is easy to find.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className={FIELD_SHELL_CLASS_NAME}>
            <Label
              htmlFor="checkout-district"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant"
            >
              District
            </Label>
            <Input
              id="checkout-district"
              value={form.district}
              onChange={(event) =>
                onUpdateField("district", event.target.value)
              }
              placeholder="Dhaka"
              className={INPUT_CLASS_NAME}
              style={FLAT_FIELD_STYLE}
            />
          </div>
          {fieldErrors.district ? (
            <p className="text-xs text-error">{fieldErrors.district}</p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Enter the district or delivery zone.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className={FIELD_SHELL_CLASS_NAME}>
            <Label
              htmlFor="checkout-address"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant"
            >
              Address
            </Label>
            <Textarea
              id="checkout-address"
              value={form.address}
              onChange={(event) => onUpdateField("address", event.target.value)}
              placeholder="House, road, area, landmark"
              className={TEXTAREA_CLASS_NAME}
              style={FLAT_FIELD_STYLE}
            />
          </div>
          {fieldErrors.address ? (
            <p className="text-xs text-error">{fieldErrors.address}</p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Include house, road, area, and a useful landmark.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutCouponSection({
  form,
  pricing,
  isCouponPending,
  onUpdateField,
  onApplyCoupon,
}: {
  form: CheckoutFormState;
  pricing: CheckoutPricingResponse | null;
  isCouponPending: boolean;
  onUpdateField: (field: keyof CheckoutFormState, value: string) => void;
  onApplyCoupon: () => void;
}) {
  return (
    <div className={SECTION_CLASS_NAME}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-surface-container/50 text-on-surface">
          <TicketPercent className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-on-surface">Coupon code</p>
            <p className="text-sm text-on-surface-variant">
              Apply a coupon before you place the order.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className={`${FIELD_SHELL_CLASS_NAME} min-w-0 sm:flex-1`}>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                Coupon
              </Label>
              <Input
                value={form.couponCode}
                onChange={(event) =>
                  onUpdateField("couponCode", event.target.value)
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
              onClick={onApplyCoupon}
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
              <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface">
                {pricing.coupon.code}
              </span>
              <span className="text-on-surface-variant">
                {pricing.coupon.type === "percentage"
                  ? `${pricing.coupon.amount}% off`
                  : `${formatCurrency(pricing.coupon.amount)} off`}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CheckoutFooterActions({
  showPlaceOrderButton,
  showBkashCheckoutButton,
  isPending,
  isBkashPending,
  bkashPayableAmount,
  onResetNavigation,
  onSubmit,
  onSubmitBkash,
}: {
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
  isPending: boolean;
  isBkashPending: boolean;
  bkashPayableAmount: number;
  onResetNavigation: () => void;
  onSubmit: () => void;
  onSubmitBkash: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface-container-lowest p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface">
            Ready to place order
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Review the form above, then submit the order from here.
          </p>
        </div>

        <CheckoutActionButtons
          showPlaceOrderButton={showPlaceOrderButton}
          showBkashCheckoutButton={showBkashCheckoutButton}
          isPending={isPending}
          isBkashPending={isBkashPending}
          bkashPayableAmount={bkashPayableAmount}
          onSubmit={onSubmit}
          onSubmitBkash={onSubmitBkash}
        />
      </div>

      <div className="mt-3">
        <Button
          asChild
          variant="secondary"
          className="h-12 w-full rounded-full px-6 sm:w-auto"
        >
          <Link href="/search" onClick={onResetNavigation}>
            Back to catalog
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function CheckoutFormPanel({
  initialUser,
  isDirectCheckout,
  form,
  fieldErrors,
  pricing,
  displayTotal,
  isPending,
  isBkashPending,
  isCouponPending,
  showPlaceOrderButton,
  showBkashCheckoutButton,
  bkashPayableAmount,
  bkashDueAmount,
  onUpdateField,
  onApplyCoupon,
  onSubmit,
  onSubmitBkash,
  onResetNavigation,
}: {
  initialUser: CheckoutPageUser | null;
  isDirectCheckout: boolean;
  form: CheckoutFormState;
  fieldErrors: CheckoutFieldErrors;
  pricing: CheckoutPricingResponse | null;
  displayTotal: number;
  isPending: boolean;
  isBkashPending: boolean;
  isCouponPending: boolean;
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
  bkashPayableAmount: number;
  bkashDueAmount: number;
  onUpdateField: (field: keyof CheckoutFormState, value: string) => void;
  onApplyCoupon: () => void;
  onSubmit: () => void;
  onSubmitBkash: () => void;
  onResetNavigation: () => void;
}) {
  const accountLabel = initialUser ? "Account checkout" : "Guest checkout";
  const accountNote = initialUser
    ? initialUser.email || "This order will be linked to your account."
    : "You can place this order without logging in.";
  const formId = "checkout-form";

  return (
    <section className="rounded-[32px] border border-border bg-surface-container-lowest p-4 sm:p-6">
      <form
        id={formId}
        className="space-y-3 sm:space-y-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (showPlaceOrderButton) {
            onSubmit();
          }
        }}
      >
        <div className="rounded-[26px] border border-border bg-surface-container-low/50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-on-surface-variant">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5">
                  <UserRound className="size-3.5" />
                  {accountLabel}
                </span>
                {isDirectCheckout ? (
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    Direct checkout
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-on-surface">
                Checkout
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                {accountNote}
              </p>
            </div>

            <div className="grid gap-3 lg:min-w-[360px]">
              <div className="rounded-[22px] bg-surface px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Total
                </p>
                <p className="mt-1 text-xl font-semibold text-on-surface">
                  {formatCurrency(displayTotal)}
                </p>
              </div>

              <CheckoutActionButtons
                showPlaceOrderButton={showPlaceOrderButton}
                showBkashCheckoutButton={showBkashCheckoutButton}
                isPending={isPending}
                isBkashPending={isBkashPending}
                bkashPayableAmount={bkashPayableAmount}
                onSubmit={onSubmit}
                onSubmitBkash={onSubmitBkash}
              />
            </div>
          </div>
        </div>

        {showBkashCheckoutButton ? (
          <div className="rounded-[24px] border border-[#E2136E]/18 bg-[#E2136E]/7 px-4 py-4">
            <p className="text-sm font-semibold text-on-surface">
              bKash partial payment
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pay {formatCurrency(bkashPayableAmount)} now with bKash and keep{" "}
              {formatCurrency(bkashDueAmount)} due for the order confirmation
              stage.
            </p>
          </div>
        ) : null}

        <CheckoutContactSection
          form={form}
          fieldErrors={fieldErrors}
          initialUser={initialUser}
          onUpdateField={onUpdateField}
        />
        <CheckoutAddressSection
          form={form}
          fieldErrors={fieldErrors}
          onUpdateField={onUpdateField}
        />
        <CheckoutCouponSection
          form={form}
          pricing={pricing}
          isCouponPending={isCouponPending}
          onUpdateField={onUpdateField}
          onApplyCoupon={onApplyCoupon}
        />
        <CheckoutFooterActions
          showPlaceOrderButton={showPlaceOrderButton}
          showBkashCheckoutButton={showBkashCheckoutButton}
          isPending={isPending}
          isBkashPending={isBkashPending}
          bkashPayableAmount={bkashPayableAmount}
          onResetNavigation={onResetNavigation}
          onSubmit={onSubmit}
          onSubmitBkash={onSubmitBkash}
        />
      </form>
    </section>
  );
}

export function CheckoutSummaryAside({
  items,
  totals,
  displaySubtotal,
  displayDiscount,
  displayTotal,
  showBkashCheckoutButton,
  bkashPayableAmount,
  bkashDueAmount,
}: {
  items: LocalCartItem[];
  totals: { quantity: number; total: number };
  displaySubtotal: number;
  displayDiscount: number;
  displayTotal: number;
  showBkashCheckoutButton: boolean;
  bkashPayableAmount: number;
  bkashDueAmount: number;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[32px] border border-border bg-surface-container-lowest p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-tight text-on-surface">
              Order summary
            </p>
            <p className="text-sm text-on-surface-variant">
              {totals.quantity} item{totals.quantity === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-full bg-surface-container px-3 py-1 text-sm font-medium text-on-surface">
            {formatCurrency(displayTotal)}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const unit = item.unitDiscountPrice ?? item.unitPrice;

            return (
              <article
                key={item.key}
                className="rounded-[24px] border border-border bg-surface p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="size-16 rounded-[18px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-on-surface">
                        {item.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-surface-container px-2.5 py-1 text-on-surface-variant">
                          Qty {item.quantity}
                        </span>
                        <span className="rounded-full bg-surface-container px-2.5 py-1 text-on-surface-variant">
                          Unit {formatCurrency(unit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:ml-auto sm:text-right">
                    <p className="text-xs text-on-surface-variant">Line total</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {formatCurrency(unit * item.quantity)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-[24px] border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-sm text-on-surface-variant">
            <span>Items</span>
            <span>{totals.quantity}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>{formatCurrency(displaySubtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-on-surface-variant">
            <span>Discount</span>
            <span className={displayDiscount > 0 ? "text-primary" : ""}>
              {displayDiscount > 0
                ? `-${formatCurrency(displayDiscount)}`
                : formatCurrency(0)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-on-surface">
            <span>Total</span>
            <span>{formatCurrency(displayTotal)}</span>
          </div>
          {showBkashCheckoutButton ? (
            <>
              <div className="mt-2 flex items-center justify-between text-sm text-[#B10F57]">
                <span>Pay now with bKash</span>
                <span>{formatCurrency(bkashPayableAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-on-surface-variant">
                <span>Remaining due</span>
                <span>{formatCurrency(bkashDueAmount)}</span>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-[22px] bg-surface-container-low/50 px-4 py-3 text-sm text-on-surface-variant">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            The order remains pending until the team reviews and confirms it.
          </p>
        </div>
      </div>
    </aside>
  );
}
