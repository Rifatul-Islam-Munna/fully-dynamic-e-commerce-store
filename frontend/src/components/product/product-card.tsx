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
        "inline-flex items-end gap-2 rounded-3xl bg-background/90 px-3 py-2 text-foreground backdrop-blur-[6px]",
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
    default:
      return <ClassicCard product={product} />;
  }
}

function ClassicCard({ product }: ProductCardProps) {
  const { currentPrice, hasDiscount, savedPercent } = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl bg-background/95 transition-colors duration-200 hover:bg-background">
      <ProductImageLink product={product} imageClassName="h-36 sm:h-44">
        {hasDiscount ? (
          <DiscountBadge
            savedPercent={savedPercent}
            className="right-2 top-2"
          />
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/72 via-black/28 to-transparent px-3 pb-3 pt-10 text-white">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl bg-background">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl bg-background">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl bg-background">
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

function BrutalistCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col font-mono border-4 border-primary bg-background shadow-[6px_6px_0_0_var(--color-primary)] transition-transform duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_0_var(--color-primary)]">
      <ProductImageLink
        product={product}
        imageClassName="h-44 sm:h-52"
        className="rounded-none border-b-4 border-primary shadow-none"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-3 top-3 rounded-none border-2 border-primary bg-emerald-400 px-3 py-1.5 text-[10px] text-primary"
            label={`${pricing.savedPercent}% OFF`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-4">
        <TitleLink
          product={product}
          className="mb-4 text-sm sm:text-base font-bold uppercase"
        />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          emphasize
          className="mb-6 font-bold"
        />
        <div className="mt-auto">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-12 w-full rounded-none border-2 border-primary bg-primary px-4 text-sm font-bold uppercase shadow-none transition-colors hover:bg-background hover:text-primary"
            label="+++ BUY NOW +++"
          />
        </div>
      </div>
    </article>
  );
}

function LuxuryCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-border/40 bg-background/50 backdrop-blur-xl transition-all duration-500 hover:border-border/80 hover:shadow-xl">
      <ProductImageLink
        product={product}
        imageClassName="h-56 sm:h-64 scale-95 transition-transform duration-700 group-hover:scale-100"
        className="bg-transparent"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-4 top-4 bg-foreground/90 font-serif font-normal tracking-widest text-background"
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <TitleLink
          product={product}
          className="mb-3 font-serif text-base sm:text-lg tracking-wide hover:text-muted-foreground"
        />
        <PriceRow
          currentPrice={pricing.currentPrice}
          price={product.price}
          savedPercent={pricing.savedPercent}
          hasDiscount={pricing.hasDiscount}
          className="mb-5 justify-center font-light tracking-wider"
        />
        <div className="mt-auto w-full max-w-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <AddToCartButton
            product={product}
            variant="outline"
            className="h-10 w-full rounded-sm border-foreground text-xs uppercase tracking-widest hover:bg-foreground hover:text-background"
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
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-primary/20 bg-background/95 ring-1 ring-primary/5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] hover:ring-primary/10">
      <ProductImageLink
        product={product}
        imageClassName="h-40 sm:h-48 opacity-90 transition-opacity group-hover:opacity-100"
        className="rounded-none border-b border-primary/10 bg-transparent"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-2 top-2 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] tracking-wider text-emerald-500 backdrop-blur-md"
            label={`-${pricing.savedPercent}% DISCOUNT`}
          />
        ) : null}
        <div className="absolute bottom-2 right-2 rounded border border-primary/20 bg-background/80 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur-md">
          {product.id.slice(0, 8)}
        </div>
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-4 font-mono">
        <TitleLink
          product={product}
          className="mb-3 text-xs sm:text-sm text-foreground/90"
        />
        <div className="mb-4 flex items-center gap-2 border-l-2 border-primary/50 bg-primary/5 px-3 py-1.5">
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-9 rounded border border-primary bg-primary/10 text-xs text-primary shadow-none transition-colors hover:bg-primary/20 hover:text-primary"
            label="INIT_CART_ADD"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-9 w-9 items-center justify-center rounded border border-primary/20 bg-background hover:bg-muted"
          >
            <ArrowUpRight className="size-4 text-primary" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function NeoBrutalistCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border-4 border-foreground bg-[#FFB6B9] shadow-[6px_6px_0_0_var(--color-foreground)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--color-foreground)]">
      <ProductImageLink
        product={product}
        imageClassName="h-40 sm:h-48"
        className="m-3 rounded-2xl border-4 border-foreground bg-background shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="right-2 top-2 rounded-full border-2 border-foreground bg-[#FAE3D9] px-3 py-1 text-xs font-black tracking-widest text-foreground shadow-[2px_2px_0_0_var(--color-foreground)]"
            label={`-${pricing.savedPercent}%`}
          />
        ) : null}
      </ProductImageLink>

      <div className="flex flex-1 flex-col p-4 pt-1">
        <TitleLink
          product={product}
          className="mb-2 text-base font-black uppercase text-foreground"
        />
        <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-foreground bg-background px-3 py-2 shadow-[2px_2px_0_0_var(--color-foreground)]">
          <span className="text-lg font-black text-foreground">
            {formatCurrency(pricing.currentPrice)}
          </span>
          {pricing.hasDiscount ? (
            <span className="text-sm font-bold text-foreground/60 line-through">
              {formatCurrency(product.price)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-12 w-full rounded-2xl border-4 border-foreground bg-[#8AC6D1] text-sm font-black uppercase text-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            label="SNAG IT!"
          />
        </div>
      </div>
    </article>
  );
}

function ModernGlassCard({ product }: ProductCardProps) {
  const pricing = getPricing(product);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white/5 shadow-2xl backdrop-blur-3xl transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
      <div className="absolute -left-12 -top-12 size-32 rounded-full bg-primary/30 blur-3xl transition-opacity duration-500 group-hover:opacity-70 opacity-30"></div>
      <div className="absolute -bottom-12 -right-12 size-32 rounded-full bg-secondary/30 blur-3xl transition-opacity duration-500 group-hover:opacity-70 opacity-0"></div>

      <ProductImageLink
        product={product}
        imageClassName="h-44 sm:h-56 mix-blend-multiply"
        className="m-2 rounded-[24px] bg-white/40 shadow-inner backdrop-blur-md"
      >
        {pricing.hasDiscount ? (
          <DiscountBadge
            savedPercent={pricing.savedPercent}
            className="left-3 top-3 border border-white/40 bg-white/20 px-3 py-1.5 backdrop-blur-xl text-foreground"
          />
        ) : null}
      </ProductImageLink>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <TitleLink
          product={product}
          className="mb-2 text-sm sm:text-base font-medium"
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
            className="h-11 rounded-4xl bg-foreground/90 px-4 text-xs font-medium text-background shadow-lg backdrop-blur-md transition-transform hover:scale-[1.02]"
            label="Add to Bag"
          />
          <Link
            href={getProductHref(product.slug)}
            className="flex h-11 w-11 items-center justify-center rounded-4xl border border-white/20 bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20"
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
    <div className="rounded-2xl bg-background p-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted/45",
          isTall
            ? "h-28"
            : variant === "compact" || variant === "minimal"
              ? "h-20"
              : "h-24",
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
