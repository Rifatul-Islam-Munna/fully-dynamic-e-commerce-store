"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";
import { sileo } from "sileo";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";

type ProductVariantSummary = {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

type ProductDetailsActionsProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string;
    price: number;
    discountPrice: number | null;
    orderPayableAmount?: number | null;
    hasVariants?: boolean;
    variants?: ProductVariantSummary[];
  };
};

function normalizeVariants(variants?: ProductVariantSummary[]) {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .filter((variant) => variant?.isActive !== false)
    .sort(
      (a, b) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
    );
}

export function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  const variants = useMemo(
    () => normalizeVariants(product.variants),
    [product.variants],
  );
  const router = useRouter();
  const startDirectCheckout = useCartStore(
    (state) => state.startDirectCheckout,
  );
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const hasVariants = Boolean(product.hasVariants && variants.length > 0);
  const firstAvailableVariant =
    variants.find((variant) => (variant.stock ?? 0) > 0) ?? variants[0] ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailableVariant?.id ?? "",
  );

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    firstAvailableVariant;

  const buildSelectedPayload = () => ({
    productId: product.id,
    productVariantId: selectedVariant?.id ?? null,
    slug: product.slug,
    title: hasVariants
      ? `${product.title} - ${selectedVariant?.title ?? "Variant"}`
      : product.title,
    thumbnailUrl: product.thumbnailUrl,
    unitPrice: selectedVariant?.price ?? product.price,
    unitDiscountPrice: selectedVariant?.discountPrice ?? product.discountPrice,
    orderPayableAmount: product.orderPayableAmount ?? null,
  });

  const handleBuyNow = () => {
    if (hasVariants) {
      const stock = selectedVariant?.stock ?? 0;
      if (!selectedVariant || stock <= 0) {
        return;
      }
    }

    resetCheckout();
    startDirectCheckout(buildSelectedPayload());
    sileo.success({ title: "Success", description: "Taking you to checkout." });
    router.push("/checkout");
  };

  if (!hasVariants) {
    return (
      <div className="space-y-3 rounded-2xl bg-card/70 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <AddToCartButton
            product={product}
            variant="outline"
            className="h-11 w-full rounded-lg border-border/60 px-6 text-sm font-semibold shadow-none"
          />
          <Button
            type="button"
            className="h-11 w-full rounded-lg px-6 text-sm font-semibold"
            onClick={handleBuyNow}
          >
            <ShoppingBag className="mr-2 size-4" />
            Buy Now
          </Button>
        </div>
      </div>
    );
  }

  const selectedCurrentPrice = selectedVariant
    ? (selectedVariant.discountPrice ?? selectedVariant.price)
    : null;
  const selectedHasDiscount =
    Boolean(selectedVariant) &&
    selectedVariant.discountPrice !== null &&
    selectedVariant.discountPrice < selectedVariant.price;
  const selectedStock = selectedVariant?.stock ?? 0;
  const isOutOfStock = !selectedVariant || selectedStock <= 0;

  return (
    <div className="space-y-3 rounded-2xl bg-card/70 p-4">
      <div className="space-y-1">
        <label
          htmlFor="variant"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Choose Option
        </label>
        <select
          id="variant"
          value={selectedVariant?.id ?? ""}
          onChange={(event) => setSelectedVariantId(event.target.value)}
          className="h-10 w-full rounded-md bg-background px-3 text-sm text-foreground outline-none ring-1 ring-border/50 transition focus:ring-2 focus:ring-primary/30"
        >
          {variants.map((variant) => {
            const variantPrice = variant.discountPrice ?? variant.price;
            return (
              <option key={variant.id} value={variant.id}>
                {variant.title} - {variantPrice}
              </option>
            );
          })}
        </select>
      </div>

      {selectedVariant ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {selectedCurrentPrice !== null
                ? formatCurrency(Number(selectedCurrentPrice))
                : "N/A"}
            </span>
            {selectedHasDiscount ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(Number(selectedVariant.price))}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isOutOfStock ? (
              <AlertTriangle className="size-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-500" />
            )}
            {isOutOfStock ? "Out of stock" : `In stock: ${selectedStock}`}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <AddToCartButton
          product={{
            id: product.id,
            slug: product.slug,
            title: `${product.title} - ${selectedVariant?.title ?? "Variant"}`,
            thumbnailUrl: product.thumbnailUrl,
            price: selectedVariant?.price ?? product.price,
            discountPrice:
              selectedVariant?.discountPrice ?? product.discountPrice,
            orderPayableAmount: product.orderPayableAmount ?? null,
            productVariantId: selectedVariant?.id ?? null,
          }}
          disabled={isOutOfStock}
          variant="outline"
          label={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          className="h-11 w-full rounded-lg border-border/60 px-6 text-sm font-semibold shadow-none"
        />
        <Button
          type="button"
          disabled={isOutOfStock}
          className="h-11 w-full rounded-lg px-6 text-sm font-semibold"
          onClick={handleBuyNow}
        >
          <ShoppingBag className="mr-2 size-4" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}



