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

const CARD_SHELL_CLASSNAME =
  "group flex h-full flex-col overflow-hidden rounded-[18px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92))] shadow-[0_18px_42px_-34px_rgba(15,23,42,0.18)] transition-all duration-400 hover:-translate-y-1 hover:border-border/90 hover:shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]";

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
        "pointer-events-none absolute z-10 rounded-full bg-primary px-3 py-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-on-primary shadow-[0_18px_38px_-18px_rgba(15,23,42,0.48)]",
        "rounded-[999px]",
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
  hasDiscount,
  className,
  emphasize = false,
  centered = false,
}: {
  currentPrice: number;
  price: number;
  hasDiscount: boolean;
  className?: string;
  emphasize?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        centered && "justify-center",
        className,
      )}
    >
      <span
        className={cn(
          "font-body font-semibold text-primary",
          emphasize ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
        )}
      >
        {formatCurrency(currentPrice)}
      </span>
      {hasDiscount ? (
        <>
          <span className="font-body text-xs text-on-surface-variant/80 line-through">
            {formatCurrency(price)}
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
        "relative block overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.82))]",
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
          "w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]",
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
        "line-clamp-2 font-body text-[15px] font-semibold leading-[1.45] tracking-[-0.01em] text-primary transition-colors hover:text-on-surface-variant",
        className,
      )}
    >
      {product.title}
    </Link>
  );
}

function DualActions({
  product,
  addLabel = "Add to cart",
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
          "rounded-[12px] bg-primary font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90",
          compact ? "h-9 flex-1 px-3" : "h-10 px-4.5",
        )}
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] border border-border/70 bg-white/92 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-white",
          iconOnlyDetails
            ? "h-9 w-9"
            : compact
              ? "h-9 px-3"
              : "h-10 gap-2 px-4.5",
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
  addLabel = "Add to cart",
}: {
  product: ProductCardProps["product"];
  addLabel?: string;
}) {
  return (
    <div className="mt-auto space-y-2">
      <AddToCartButton
        product={product}
        variant="default"
        className="h-11 w-full rounded-[12px] bg-primary px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
        label={addLabel}
      />
      <Link
        href={getProductHref(product.slug)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-border/70 bg-white/92 px-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-white"
      >
        <Eye className="size-3.5" />
        View details
      </Link>
    </div>
  );
}

function StandardCard({
  product,
  imageRatio = "aspect-[4/5]",
  contentClassName,
  titleClassName,
  compactActions = false,
  iconOnlyDetails = false,
  addLabel,
}: {
  product: ProductCardProps["product"];
  imageRatio?: string;
  contentClassName?: string;
  titleClassName?: string;
  compactActions?: boolean;
  iconOnlyDetails?: boolean;
  addLabel?: string;
}) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName={imageRatio}>
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
          />
        ) : null}
      </ProductImageLink>

      <div className={cn("flex flex-1 flex-col gap-3 p-4.5", contentClassName)}>
        <TitleLink product={product} className={cn("min-h-[3rem]", titleClassName)} />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
        />
        <DualActions
          product={product}
          addLabel={addLabel}
          compact={compactActions}
          iconOnlyDetails={iconOnlyDetails}
        />
      </div>
    </article>
  );
}

function ClassicCard({ product }: ProductCardProps) {
  return <StandardCard product={product} />;
}

function CompactCard({ product }: ProductCardProps) {
  return (
    <StandardCard
      product={product}
      imageRatio="aspect-square"
      contentClassName="gap-2 p-4"
      compactActions
      iconOnlyDetails
      addLabel="Add"
    />
  );
}

function EditorialCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/72 via-black/28 to-transparent px-4 pb-4 pt-16 text-white">
          <p className="font-body text-base font-semibold leading-snug tracking-[-0.01em]">
            {product.title}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-body text-lg font-semibold">
              {formatCurrency(pricing.currentPrice)}
            </span>
            {pricing.hasDiscount ? (
              <span className="text-xs text-white/60 line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </ProductImageLink>

      <div className="mt-auto flex items-center gap-2 p-4">
        <AddToCartButton
          product={product}
          variant="default"
          className="h-10 flex-1 rounded-[12px] bg-primary px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
          label="Add to cart"
        />
        <Link
          href={getProductHref(product.slug)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-border/70 bg-white/92 px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-white"
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
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]" />

      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
        />
        <TitleLink product={product} className="min-h-[3rem]" />
        <DualActions product={product} />
      </div>
    </article>
  );
}

function BadgeFocusCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-4 top-4"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <TitleLink product={product} className="min-h-[3rem]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
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
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <TitleLink product={product} className="min-h-[3rem] text-base" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
          emphasize
        />
        <StackedActions product={product} />
      </div>
    </article>
  );
}

function StackedCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]" />

      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <TitleLink product={product} className="min-h-[3rem]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
        />
        <StackedActions product={product} addLabel="Quick add" />
      </div>
    </article>
  );
}

function MinimalCard({ product }: ProductCardProps) {
  return (
    <StandardCard
      product={product}
      imageRatio="aspect-square"
      contentClassName="gap-2 p-4"
      compactActions
      iconOnlyDetails
      addLabel="Add"
    />
  );
}

function BrutalistCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={cn(CARD_SHELL_CLASSNAME, "rounded-[14px]")}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-4 top-4"
            label={`${pricing.savedPercent}% OFF`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <TitleLink product={product} className="min-h-[3rem]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
          emphasize
        />
        <AddToCartButton
          product={product}
          variant="default"
          className="mt-auto h-11 w-full rounded-[12px] bg-primary px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
          label="Buy now"
        />
      </div>
    </article>
  );
}

function LuxuryCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink
        product={product}
        imageClassName="aspect-[4/5] scale-[0.97] transition-transform duration-700 group-hover:scale-100"
        className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.72))]"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
        <TitleLink product={product} className="mt-3 min-h-[3rem] text-base" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
          centered
          className="mt-3"
        />
        <div className="mt-auto w-full max-w-48 pt-4">
          <AddToCartButton
            product={product}
            variant="outline"
            className="h-10 w-full rounded-[12px] border-primary font-body text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-primary hover:text-on-primary"
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
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink
        product={product}
        imageClassName="aspect-[4/5] opacity-95 transition-opacity group-hover:opacity-100"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
            label={`-${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-5">
        <TitleLink product={product} className="mb-3 mt-3 min-h-[3rem]" />
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-border/60 bg-surface-container-low px-3 py-2">
          <span className="font-body text-base font-semibold text-primary">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-xs text-on-surface-variant/80 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-10 rounded-[12px] bg-primary font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
            label="Add"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-border/70 bg-white/92 text-primary hover:bg-white"
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
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink
        product={product}
        imageClassName="aspect-[4/5]"
        className="m-3"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-3 top-3"
            label={`-${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-5 pt-1">
        <TitleLink product={product} className="mb-2 mt-2 min-h-[3rem] text-base" />
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-border/60 bg-surface-container-low px-3 py-2">
          <span className="font-body text-lg font-semibold text-primary">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-sm text-on-surface-variant/80 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <AddToCartButton
          product={product}
          variant="default"
          className="mt-auto h-11 w-full rounded-[12px] bg-primary font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
          label="Add to bag"
        />
      </div>
    </article>
  );
}

function ModernGlassCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink
        product={product}
        imageClassName="aspect-[4/5]"
        className="m-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(226,232,240,0.42))]"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4"
          />
        ) : null}
      </ProductImageLink>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <TitleLink product={product} className="mb-2 mt-2 min-h-[3rem]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
          className="mb-5"
        />

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-11 rounded-[12px] bg-primary px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
            label="Add to bag"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-border/70 bg-white/92 text-primary transition-colors hover:bg-white"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function NordicVerveCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className={CARD_SHELL_CLASSNAME}>
      <ProductImageLink product={product} imageClassName="aspect-[4/5]">
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-4 top-4"
            label={`${pricing.savedPercent}% OFF`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <TitleLink product={product} className="min-h-[3rem]" />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          hasDiscount={pricing.hasDiscount}
        />
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
          className="h-10 rounded-[12px] bg-primary px-4.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90"
            label="Add to bag"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-border/70 bg-white/92 text-primary transition-colors hover:bg-white"
            aria-label={`View ${product.title}`}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
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

export function ProductCardPreview({
  title,
  price,
  variant,
}: {
  title: string;
  price: string;
  variant: ProductCardVariant;
}) {
  const isCompact = variant === "compact" || variant === "minimal";
  const isStacked = ["spotlight", "stacked", "brutalist"].includes(variant);
  const showOverlay = ["editorial", "luxury"].includes(variant);
  const showAccent = [
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
    "nordic_verve",
  ].includes(variant);

  return (
    <div className="rounded-[28px] border border-border/60 bg-white/88 p-3 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.25)]">
      <div
        className={cn(
          "relative overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.82))]",
          isCompact ? "aspect-square" : "aspect-[4/5]",
        )}
      >
        {showAccent ? (
          <div className="absolute left-3 top-3 h-5 w-14 rounded-full bg-primary/18" />
        ) : null}
        {showOverlay ? (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/35 to-transparent" />
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 rounded-full bg-surface-container/55" />
          <div className="h-3 w-10 rounded-full bg-border/60" />
        </div>
        <div className="h-3 w-4/5 rounded-full bg-surface-container/55" />
        <div className="h-3 w-3/5 rounded-full bg-surface-container-low" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded-full bg-primary/12" />
          <div className="h-4 w-12 rounded-full bg-surface-container/45" />
        </div>
        {isStacked ? (
          <div className="space-y-2">
            <div className="h-10 w-full rounded-full bg-surface-container/40" />
            <div className="h-9 w-full rounded-full bg-surface-container/24" />
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_0.8fr] gap-2">
            <div className="h-10 rounded-full bg-surface-container/40" />
            <div className="h-10 rounded-full bg-surface-container/24" />
          </div>
        )}
        <div className="sr-only">
          {title} {price}
        </div>
      </div>
    </div>
  );
}
