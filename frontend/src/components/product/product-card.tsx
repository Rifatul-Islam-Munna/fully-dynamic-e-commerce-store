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
        "pointer-events-none absolute z-10 rounded-full bg-primary px-3 py-1.5 font-body text-[9px] font-bold uppercase tracking-widest text-on-primary",
        className,
      )}
    >
      {label ?? `${savedPercent}% off`}
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
          "font-headline font-bold text-primary",
          emphasize ? "text-lg sm:text-xl" : "text-sm sm:text-base",
        )}
      >
        {formatCurrency(currentPrice)}
      </span>
      {hasDiscount ? (
        <>
          <span className="font-body text-xs text-on-surface-variant line-through">
            {formatCurrency(price)}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-body text-[9px] font-bold uppercase tracking-widest text-primary">
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
        "relative block overflow-hidden rounded-sm bg-surface-container-low/50",
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
          "w-full object-cover transition-transform duration-700 group-hover:scale-105",
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
        "line-clamp-2 font-headline font-bold leading-snug text-primary transition-colors hover:text-on-surface-variant",
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
          ? "mt-auto flex items-center gap-2"
          : "mt-auto grid grid-cols-[1.18fr_0.82fr] gap-2",
      )}
    >
      <AddToCartButton
        product={product}
        variant="default"
        className={cn(
          "rounded-full bg-primary font-headline text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90",
          compact ? "h-9 flex-1 px-3" : "h-10 px-4",
        )}
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-surface-container font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-surface-container-high",
          iconOnlyDetails
            ? "h-9 w-9"
            : compact
              ? "h-9 px-3"
              : "h-10 gap-2 px-4",
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
        className="h-11 w-full rounded-full bg-primary px-4 font-headline text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-surface-container px-3 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-surface-container-high"
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
    case "brutalist":
      return <BrutalistCard product={product} />;
    case "luxury":
      return <LuxuryCard product={product} />;
    case "tech_focus":
      return <TechFocusCard product={product} />;
    case "neo_brutalist":
      return <NeoBrutalistCard product={product} />;
    case "modern_glass":
      return <ModernGlassCard product={product} />;
    case "nordic_verve":
      return <NordicVerveCard product={product} />;
    default:
      return <ClassicCard product={product} />;
  }
}

/* ── ATELIER-styled card variants ── */

function ClassicCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-40 sm:h-48">
        {hasDiscount ? (
          <DiscountBadge
            savedPercent={savedPercent}
            className="left-3 top-3"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleLink product={product} className="text-sm" />
        <PriceRow
          currentPrice={currentPrice}
          price={product.price}
          savedPercent={savedPercent}
          hasDiscount={hasDiscount}
        />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function CompactCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-28 sm:h-32">
        {hasDiscount ? (
          <DiscountBadge
            savedPercent={savedPercent}
            className="right-2 top-2"
            label={`${savedPercent}% Off`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <TitleLink
          product={product}
          className="min-h-10 text-xs"
        />
        <p className="font-headline text-sm font-bold text-primary">
          {formatCurrency(currentPrice)}
        </p>
        <DualActions product={product} addLabel="Add" compact iconOnlyDetails />
      </div>
    </article>
  );
}

function EditorialCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-44 sm:h-52">
        {hasDiscount ? (
          <DiscountBadge savedPercent={savedPercent} className="left-3 top-3" />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/60 via-black/20 to-transparent px-4 pb-4 pt-12 text-white">
          <p className="font-headline text-sm font-bold leading-snug">
            {product.title}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-headline text-base font-bold">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-white/60 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </ProductImageLink>

      <div className="mt-auto flex items-center gap-2 p-3">
        <AddToCartButton
          product={product}
          variant="default"
          className="h-10 flex-1 rounded-full bg-primary px-4 font-headline text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
          label="Add to Cart"
        />
        <Link
          href={getProductHref(product.slug)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-surface-container px-4 font-headline text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-surface-container-high"
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
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-40" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
        />
        <TitleLink product={product} className="text-sm" />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function BadgeFocusCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-40">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-3 top-3"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleLink product={product} className="text-sm" />
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
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink
        product={product}
        imageClassName="h-52 sm:h-60"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-3 top-3"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-5">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-32 sm:h-36" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TitleLink product={product} className="text-sm" />
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
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink product={product} imageClassName="h-28 sm:h-32">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-2 top-2"
            label={`${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <TitleLink product={product} className="text-xs" />
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

function BrutalistCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink
        product={product}
        imageClassName="h-44 sm:h-52"
        className="rounded-none"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-3 top-3"
            label={`${pricing.savedPercent}% OFF`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-5">
        <TitleLink
          product={product}
          className="mb-3 text-sm sm:text-base uppercase"
        />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          emphasize
          className="mb-5"
        />
        <div className="mt-auto">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-12 w-full rounded-full bg-primary px-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
            label="Buy Now"
          />
        </div>
      </div>
    </article>
  );
}

function LuxuryCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-700 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
      <ProductImageLink
        product={product}
        imageClassName="h-56 sm:h-64 scale-[0.96] transition-transform duration-700 group-hover:scale-100"
        className="bg-transparent"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4 bg-primary tracking-widest"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <TitleLink
          product={product}
          className="mb-3 text-base tracking-wide hover:text-on-surface-variant"
        />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          className="mb-5 justify-center"
        />
        <div className="mt-auto w-full max-w-48 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <AddToCartButton
            product={product}
            variant="outline"
            className="h-10 w-full rounded-full border-primary font-headline text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary"
            label="Add to cart"
          />
        </div>
      </div>
    </article>
  );
}

function TechFocusCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink
        product={product}
        imageClassName="h-40 sm:h-48 opacity-90 transition-opacity group-hover:opacity-100"
        className="rounded-none bg-transparent"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-3 top-3 bg-primary/10 text-primary backdrop-blur-md"
            label={`-${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-4">
        <TitleLink
          product={product}
          className="mb-3 text-xs sm:text-sm"
        />
        <div className="mb-4 flex items-center gap-2 rounded-sm bg-surface-container px-3 py-2">
          <span className="font-headline text-sm font-bold text-primary">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-xs text-on-surface-variant line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-9 rounded-full bg-primary font-headline text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
            label="Add"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function NeoBrutalistCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <ProductImageLink
        product={product}
        imageClassName="h-40 sm:h-48"
        className="m-3 rounded-sm"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-2 top-2"
            label={`-${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-4 pt-1">
        <TitleLink
          product={product}
          className="mb-2 text-base font-bold uppercase"
        />
        <div className="mb-4 flex items-center gap-2 rounded-sm bg-surface-container px-3 py-2">
          <span className="font-headline text-lg font-bold text-primary">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-sm text-on-surface-variant line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-12 w-full rounded-full bg-primary font-headline text-xs font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
            label="Add to bag"
          />
        </div>
      </div>
    </article>
  );
}

function ModernGlassCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-surface-container-lowest  transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
      <ProductImageLink
        product={product}
        imageClassName="h-44 sm:h-56"
        className="m-2 rounded-sm bg-surface-container/40"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-3 top-3 bg-primary/90 backdrop-blur-xl"
          />
        ) : null}
      </ProductImageLink>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <TitleLink
          product={product}
          className="mb-2 text-sm sm:text-base"
        />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          className="mb-5"
        />

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-11 rounded-full bg-primary px-4 font-headline text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-none hover:opacity-90"
            label="Add to Bag"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-surface-container-high"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ── Nordic Verve: sharp-corner premium card with orange CTA ── */
function NordicVerveCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-none border border-gray-200 bg-white transition-colors duration-200 hover:border-gray-400">
      {/* Image area — square aspect ratio */}
      <Link
        href={getProductHref(product.slug)}
        className="relative block aspect-square overflow-hidden bg-[#F3F4F6]"
      >
        {/* Discount badge: top-right, sharp, orange bg */}
        {pricing.hasDiscount ? (
          <div className="pointer-events-none absolute right-0 top-0 z-10 rounded-sm bg-[#F97316] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {pricing.savedPercent}% OFF
          </div>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Link>

      {/* Content area */}
      <div className="flex flex-1 flex-col gap-2 border-t border-gray-200 p-3">
        {/* Product Name — bold, dark, 14–15px */}
        <Link
          href={getProductHref(product.slug)}
          className="line-clamp-2 text-sm font-bold leading-snug text-[#111111] hover:text-[#F97316]"
        >
          {product.title}
        </Link>

        {/* Price — accent color (orange), 15px medium */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-medium text-[#F97316]">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        {/* Action row — full-width ADD button + square icon link */}
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-9 rounded-none bg-[#F97316] text-xs font-bold uppercase tracking-wider text-white shadow-none hover:bg-[#EA680C]"
            label="🛒 ADD"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-[#111111]"
            aria-label={`View ${product.title}`}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
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
  const hasImageBadge = [
    "classic",
    "compact",
    "editorial",
    "badge_focus",
    "spotlight",
    "minimal",
    "brutalist",
    "luxury",
    "tech_focus",
    "neo_brutalist",
    "modern_glass",
  ].includes(variant);
  const hasImagePrice = ["classic", "compact"].includes(variant);
  const isEditorialLike = variant === "editorial" || variant === "luxury";
  const isTall = ["spotlight", "brutalist", "modern_glass", "luxury"].includes(
    variant,
  );
  const hasPriceBelow = [
    "price_strip",
    "badge_focus",
    "spotlight",
    "stacked",
    "minimal",
    "brutalist",
    "tech_focus",
    "neo_brutalist",
  ].includes(variant);
  const isStacked = [
    "spotlight",
    "stacked",
    "brutalist",
    "neo_brutalist",
  ].includes(variant);

  return (
    <div className="rounded-sm bg-surface-container-lowest p-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-sm bg-surface-container-low",
          isTall
            ? "h-28"
            : variant === "compact" || variant === "minimal"
              ? "h-20"
              : "h-24",
        )}
      >
        {hasImageBadge ? (
          <div className="absolute right-2 top-2 h-5 w-12 rounded-full bg-primary/20" />
        ) : null}
        {hasImagePrice ? (
          <div className="absolute bottom-2 left-2 h-6 w-20 rounded-full bg-surface-container-lowest/90" />
        ) : null}
        {isEditorialLike ? (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-surface-container/50" />
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {hasPriceBelow ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded-full bg-surface-container/50" />
            <div className="h-4 w-12 rounded-full bg-primary/10" />
          </div>
        ) : null}
        <div className="h-3 w-3/4 rounded-full bg-surface-container/50" />
        <div className="h-3 w-1/2 rounded-full bg-surface-container-low" />
        {isStacked ? (
          <div className="space-y-2">
            <div className="h-9 w-full rounded-full bg-surface-container/40" />
            <div className="h-8 w-full rounded-full bg-surface-container/25" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="h-8 flex-1 rounded-full bg-surface-container/40" />
            <div className="h-8 w-16 rounded-full bg-surface-container/25" />
          </div>
        )}
        <div className="sr-only">
          {title} {price}
        </div>
      </div>
    </div>
  );
}
