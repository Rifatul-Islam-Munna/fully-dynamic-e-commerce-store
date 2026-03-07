import type { LocalCartItem } from "@/store/cart-store";

export type CheckoutPageUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
};

export type CheckoutFormState = {
  email: string;
  phoneNumber: string;
  district: string;
  address: string;
  couponCode: string;
};

export type CheckoutSubmitPayload = {
  email?: string;
  phoneNumber: string;
  district: string;
  address: string;
  couponCode?: string;
  items: Array<{
    productId: string;
    productVariantId?: string;
    quantity: number;
  }>;
};

export type CheckoutPricingResponse = {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  bkashPayableAmount: number;
  bkashDueAmount: number;
  coupon: {
    id: string;
    code: string;
    type: "percentage" | "value";
    amount: number;
    discountAmount: number;
  } | null;
};

export type CheckoutOrderResponse = {
  id: string;
  orderNumber: string;
  userId: string | null;
  checkoutMode: "guest" | "member";
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod: "place_order" | "bkash";
  paymentStatus: "unpaid" | "partial_paid" | "paid";
  customerEmail: string | null;
  customerPhoneNumber: string;
  customerDistrict: string;
  customerAddress: string;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  couponId: string | null;
  couponCode: string | null;
  couponType: "percentage" | "value" | null;
  couponAmount: number | null;
  total: number;
  paidAmount: number;
  dueAmount: number;
  bkashPaymentId: string | null;
  bkashTransactionId: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string | null;
    productVariantId: string | null;
    productTitle: string;
    productSlug: string;
    productThumbnailUrl: string;
    variantTitle: string | null;
    quantity: number;
    unitPrice: number;
    unitDiscountPrice: number | null;
    lineTotal: number;
  }>;
};

export type CheckoutBkashInitResponse = {
  paymentUrl: string;
  paymentId: string;
  checkoutSessionId: string;
  payableAmount: number;
  dueAmount: number;
};

function normalizeText(value: string) {
  return value.trim();
}

export function buildCouponPreviewPayload(
  couponCode: string,
  items: LocalCartItem[],
) {
  return {
    code: normalizeText(couponCode),
    items: items.map((item) => ({
      productId: item.productId,
      ...(item.productVariantId ? { productVariantId: item.productVariantId } : {}),
      quantity: item.quantity,
    })),
  };
}

export function buildCheckoutPayload(
  form: CheckoutFormState,
  items: LocalCartItem[],
): CheckoutSubmitPayload {
  const email = normalizeText(form.email);
  const couponCode = normalizeText(form.couponCode);

  return {
    ...(email ? { email } : {}),
    phoneNumber: normalizeText(form.phoneNumber),
    district: normalizeText(form.district),
    address: normalizeText(form.address),
    ...(couponCode ? { couponCode } : {}),
    items: items.map((item) => ({
      productId: item.productId,
      ...(item.productVariantId ? { productVariantId: item.productVariantId } : {}),
      quantity: item.quantity,
    })),
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateBkashPayableSummary(
  items: LocalCartItem[],
  total: number,
) {
  const requestedPayable = roundCurrency(
    items.reduce((runningTotal, item) => {
      const effectiveUnitPrice = item.unitDiscountPrice ?? item.unitPrice;
      const payableUnitPrice =
        item.orderPayableAmount !== null &&
        item.orderPayableAmount !== undefined
          ? Math.min(item.orderPayableAmount, effectiveUnitPrice)
          : effectiveUnitPrice;

      return runningTotal + payableUnitPrice * item.quantity;
    }, 0),
  );
  const payableAmount = roundCurrency(Math.min(total, requestedPayable));
  const dueAmount = roundCurrency(Math.max(0, total - payableAmount));

  return {
    payableAmount,
    dueAmount,
  };
}
