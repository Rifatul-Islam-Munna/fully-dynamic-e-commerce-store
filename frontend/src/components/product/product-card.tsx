"use client";

import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { useSitePreferences } from "@/components/site/site-preferences-provider";
import { formatCurrency } from "@/lib/currency";
import type { ProductCardVariant } from "@/lib/site-appearance";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    price: number;
    discountPrice: number | null;
  };
};

type PricingState = {
  currentPrice: number;
  hasDiscount: boolean;
  savedPercent: number;
};

function getPricing(product: ProductCardProps["product"]): PricingState {
  const currentPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const savedPercent =
    hasDiscount && product.price > 0
      ? Math.round(((product.price - currentPrice) / product.price) * 100)
      : 0;

  return {
    currentPrice,
    hasDiscount,
    savedPercent,
  };
}

function getProductHref(slug: string) {
  return `/product/${encodeURIComponent(slug)}`;
}

function DiscountBadge({
  savedPercent,
  className,
  label,
}: {
  savedPercent: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10 rounded-full bg-emerald-500/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white",
        className,
      )}
    >
      {label ?? `Save ${savedPercent}%`}
    </div>
  );
}

function PricePill({
  currentPrice,
  price,
  className,
}: {
  currentPrice: number;
  price: number;
  className?: string;
}) {
  const hasDiscount = currentPrice < price;

  return (
    <div
      className={cn(
        "inline-flex items-end gap-2 rounded-[16px] bg-background/90 px-3 py-2 text-foreground backdrop-blur-[6px]",
        className,
      )}
    >
      <span className="text-sm font-semibold leading-none sm:text-base">
        {formatCurrency(currentPrice)}
      </span>
      {hasDiscount ? (
        <span className="text-[11px] leading-none text-muted-foreground line-through">
          {formatCurrency(price)}
        </span>
      ) : null}
    </div>
  );
}

function PriceRow({
  currentPrice,
  price,
  savedPercent,
  hasDiscount,
  className,
  emphasize = false,
}: {
  currentPrice: number;
  price: number;
  savedPercent: number;
  hasDiscount: boolean;
  className?: string;
  emphasize?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "font-semibold text-foreground",
          emphasize ? "text-lg sm:text-xl" : "text-sm sm:text-base",
        )}
      >
        {formatCurrency(currentPrice)}
      </span>
      {hasDiscount ? (
        <>
          <span className="text-xs text-muted-foreground line-through sm:text-sm">
            {formatCurrency(price)}
          </span>
          <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[11px] font-semibold text-emerald-600">
            {savedPercent}% off
          </span>
        </>
      ) : null}
    </div>
  );
}

function ProductImageLink({
  product,
  imageClassName,
  className,
  children,
}: {
  product: ProductCardProps["product"];
  imageClassName: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={getProductHref(product.slug)}
      className={cn(
        "relative block overflow-hidden rounded-[18px] bg-muted/18",
        className,
      )}
    >
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.thumbnailUrl}
        alt={product.title}
        loading="lazy"
        decoding="async"
        className={cn(
          "w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]",
          imageClassName,
        )}
      />
    </Link>
  );
}

function TitleLink({
  product,
  className,
}: {
  product: ProductCardProps["product"];
  className?: string;
}) {
  return (
    <Link
      href={getProductHref(product.slug)}
      className={cn(
        "line-clamp-2 font-medium leading-5 text-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      {product.title}
    </Link>
  );
}

function DualActions({
  product,
  addLabel = "Add to Cart",
  compact = false,
  iconOnlyDetails = false,
}: {
  product: ProductCardProps["product"];
  addLabel?: string;
  compact?: boolean;
  iconOnlyDetails?: boolean;
}) {
  return (
    <div
      className={cn(
        compact
          ? "mt-auto flex items-center gap-1.5"
          : "mt-auto grid grid-cols-[1.18fr_0.82fr] gap-1.5",
      )}
    >
      <AddToCartButton
        product={product}
        variant="default"
        className={cn(
          "rounded-[14px] font-semibold shadow-none",
          compact ? "h-9 flex-1 px-3 text-[11px]" : "h-10 px-3.5 text-[11px]",
        )}
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className={cn(
          "inline-flex items-center justify-center rounded-[14px] bg-primary/10 font-semibold text-primary transition-colors hover:bg-primary/15",
          iconOnlyDetails
            ? "h-9 w-9"
            : compact
              ? "h-9 px-3"
              : "h-10 gap-1.5 px-3 text-[11px]",
        )}
        aria-label={`View ${product.title}`}
      >
        {iconOnlyDetails ? (
          <ArrowUpRight className="size-4" />
        ) : (
          <>
            <Eye className="size-3.5" />
            Details
          </>
        )}
      </Link>
    </div>
  );
}

function StackedActions({
  product,
  addLabel = "Add to Cart",
}: {
  product: ProductCardProps["product"];
  addLabel?: string;
}) {
  return (
    <div className="mt-auto space-y-2">
      <AddToCartButton
        product={product}
        variant="default"
        className="h-11 w-full rounded-[15px] px-4 text-[12px] font-semibold shadow-none"
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[15px] bg-primary/10 px-3 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        <Eye className="size-3.5" />
        View Details
      </Link>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { productCardVariant } = useSitePreferences();

  switch (productCardVariant) {
    case "compact":
      return <CompactCard product={product} />;
    case "editorial":
      return <EditorialCard product={product} />;
    case "price_strip":
      return <PriceStripCard product={product} />;
    case "badge_focus":
      return <BadgeFocusCard product={product} />;
    case "spotlight":
      return <SpotlightCard product={product} />;
    case "stacked":
      return <StackedCard product={product} />;
    case "minimal":
      return <MinimalCard product={product} />;
    default:
      return <ClassicCard product={product} />;
  }
}

function ClassicCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-background/95 transition-colors duration-200 hover:bg-background">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-44">
        {hasDiscount ? (
          <DiscountBadge savedPercent={savedPercent} className="right-2 top-2" />
        ) : null}
        <div className="pointer-events-none absolute bottom-2 left-2 z-10">
          <PricePill currentPrice={currentPrice} price={product.price} />
        </div>
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:p-3">
        <TitleLink product={product} className="text-[13px] sm:text-sm" />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function CompactCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-background">
      <ProductImageLink product={product} imageClassName="h-28 sm:h-32">
        {hasDiscount ? (
          <DiscountBadge
            savedPercent={savedPercent}
            className="right-2 top-2 px-2 py-1 text-[9px]"
            label={`${savedPercent}% Off`}
          />
        ) : null}

        <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-background/88 px-2.5 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-[6px]">
          {formatCurrency(currentPrice)}
        </div>
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <TitleLink
          product={product}
          className="min-h-10 text-[12px] sm:text-[13px]"
        />
        <DualActions product={product} addLabel="Add" compact iconOnlyDetails />
      </div>
    </article>
  );
}

function EditorialCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-background">
      <ProductImageLink product={product} imageClassName="h-40 sm:h-48">
        {hasDiscount ? (
          <DiscountBadge savedPercent={savedPercent} className="left-2 top-2" />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/72 via-black/28 to-transparent px-3 pb-3 pt-10 text-white">
          <p className="line-clamp-2 text-sm font-semibold leading-5">
            {product.title}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-base font-semibold">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-white/65 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </ProductImageLink>

      <div className="mt-auto flex items-center gap-2 p-2.5">
        <AddToCartButton
          product={product}
          variant="default"
          className="h-10 flex-1 rounded-[14px] px-3.5 text-[11px] font-semibold shadow-none"
          label="Add to Cart"
        />
        <Link
          href={getProductHref(product.slug)}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-primary/10 px-3.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <Eye className="size-3.5" />
          View
        </Link>
      </div>
    </article>
  );
}

function PriceStripCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-background">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-40" />

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
        />
        <TitleLink product={product} className="text-[13px] sm:text-sm" />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function BadgeFocusCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-background">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-40">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-2 top-2"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <TitleLink product={product} className="text-[13px] sm:text-sm" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
        />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function SpotlightCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-background">
      <ProductImageLink
        product={product}
        imageClassName="h-52 sm:h-60"
        className="rounded-[22px]"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-3 top-3 px-3 py-1.5 text-[10px]"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleLink product={product} className="text-sm sm:text-base" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          emphasize
        />
        <StackedActions product={product} addLabel="Add to Cart" />
      </div>
    </article>
  );
}

function StackedCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-background">
      <ProductImageLink product={product} imageClassName="h-32 sm:h-36" />

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <TitleLink product={product} className="text-[13px] sm:text-sm" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
        />
        <StackedActions product={product} addLabel="Quick Add" />
      </div>
    </article>
  );
}

function MinimalCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-background">
      <ProductImageLink product={product} imageClassName="h-28 sm:h-32">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-2 top-2 px-2 py-1 text-[9px]"
            label={`${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <TitleLink product={product} className="text-[12px] sm:text-[13px]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          className="gap-1.5"
        />
        <DualActions product={product} addLabel="Add" compact iconOnlyDetails />
      </div>
    </article>
  );
}

export function ProductCardPreview({
  title,
  price,
  variant,
}: {
  title: string;
  price: string;
  variant: ProductCardVariant;
}) {
  const hasImageBadge = ["classic", "compact", "editorial", "badge_focus", "spotlight", "minimal"].includes(
    variant,
  );
  const hasImagePrice = ["classic", "compact"].includes(variant);
  const isEditorialLike = variant === "editorial";
  const isTall = variant === "spotlight";
  const hasPriceBelow = ["price_strip", "badge_focus", "spotlight", "stacked", "minimal"].includes(
    variant,
  );
  const isStacked = ["spotlight", "stacked"].includes(variant);

  return (
    <div className="rounded-2xl bg-background p-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted/45",
          isTall ? "h-28" : variant === "compact" || variant === "minimal" ? "h-20" : "h-24",
        )}
      >
        {hasImageBadge ? (
          <div className="absolute right-2 top-2 h-5 w-12 rounded-full bg-emerald-200" />
        ) : null}
        {hasImagePrice ? (
          <div className="absolute bottom-2 left-2 h-6 w-20 rounded-full bg-background/90" />
        ) : null}
        {isEditorialLike ? (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-muted/70" />
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {hasPriceBelow ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded-full bg-muted/60" />
            <div className="h-4 w-12 rounded-full bg-emerald-100" />
          </div>
        ) : null}
        <div className="h-3 w-3/4 rounded-full bg-muted/60" />
        <div className="h-3 w-1/2 rounded-full bg-muted/35" />
        {isStacked ? (
          <div className="space-y-2">
            <div className="h-9 w-full rounded-[14px] bg-muted/55" />
            <div className="h-8 w-full rounded-[14px] bg-muted/35" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="h-8 flex-1 rounded-[14px] bg-muted/55" />
            <div className="h-8 w-16 rounded-[14px] bg-muted/35" />
          </div>
        )}
        <div className="sr-only">
          {title} {price}
        </div>
      </div>
    </div>
  );
}
