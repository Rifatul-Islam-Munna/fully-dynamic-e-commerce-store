"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { useSitePreferences } from "@/components/site/site-preferences-provider";
import { formatCurrency } from "@/lib/currency";
import type { ProductCardVariant } from "@/lib/site-appearance";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
};

type ProductCardProps = { product: Product };

const squareVariants: ProductCardVariant[] = ["compact", "minimal"];
const strongVariants: ProductCardVariant[] = ["brutalist", "neo_brutalist", "tech_focus"];
const centeredVariants: ProductCardVariant[] = ["luxury", "minimal"];
const wideActionVariants: ProductCardVariant[] = ["spotlight", "stacked", "brutalist"];

function pricing(product: Product) {
  const current = product.discountPrice ?? product.price;
  const discounted = product.discountPrice !== null && product.discountPrice < product.price;
  const percent = discounted && product.price > 0
    ? Math.round(((product.price - current) / product.price) * 100)
    : 0;
  return { current, discounted, percent };
}

function ProductCardView({ product, variant }: ProductCardProps & { variant: ProductCardVariant }) {
  const href = `/product/${encodeURIComponent(product.slug)}`;
  const price = pricing(product);
  const square = squareVariants.includes(variant);
  const centered = centeredVariants.includes(variant);
  const wideAction = wideActionVariants.includes(variant);

  return (
    <article className={cn("group flex h-full flex-col overflow-hidden border bg-card", strongVariants.includes(variant) ? "border-foreground/35" : "border-border")}>
      <Link href={href} className="commerce-media relative block">
        {price.percent > 0 ? (
          <span className="absolute left-3 top-3 z-10 border border-primary bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
            Save {price.percent}%
          </span>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className={cn("w-full object-cover", square ? "aspect-square" : "aspect-[4/5]")}
        />
      </Link>

      <div className={cn("flex flex-1 flex-col gap-3 p-4", centered && "items-center text-center")}>
        <Link href={href} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:underline hover:underline-offset-4">
          {product.title}
        </Link>
        <div className={cn("flex flex-wrap items-center gap-2", centered && "justify-center")}>
          <span className="font-semibold text-foreground">{formatCurrency(price.current)}</span>
          {price.discounted ? <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</span> : null}
        </div>
        <div className={cn("mt-auto flex w-full gap-2", wideAction && "flex-col")}>
          <AddToCartButton
            product={product}
            variant="default"
            label={square ? "Add" : "Add to cart"}
            className="h-10 flex-1 rounded-sm px-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
          />
          <Link
            href={href}
            aria-label={`View ${product.title}`}
            className={cn("commerce-interactive inline-flex h-10 items-center justify-center gap-2 border border-border bg-background px-3 text-[11px] font-semibold uppercase tracking-[0.1em]", wideAction && "w-full")}
          >
            <span className={square ? "sr-only" : "hidden sm:inline"}>Details</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { productCardVariant } = useSitePreferences();
  return <ProductCardView product={product} variant={productCardVariant} />;
}

export function ProductCardPreview({ title, price, variant }: { title: string; price: string; variant: ProductCardVariant }) {
  const square = squareVariants.includes(variant);
  return (
    <div className={cn("overflow-hidden border bg-card", strongVariants.includes(variant) ? "border-foreground/35" : "border-border")}>
      <div className={cn("commerce-media", square ? "aspect-square" : "aspect-[4/5]")} />
      <div className="space-y-2 p-4">
        <p className="line-clamp-2 min-h-10 text-sm font-semibold">{title}</p>
        <p className="font-semibold">{price}</p>
        <div className="flex gap-2"><div className="h-9 flex-1 bg-primary" /><div className="h-9 w-10 border border-border" /></div>
      </div>
    </div>
  );
}
