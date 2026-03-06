import Link from "next/link";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

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

export function ProductCard({ product }: ProductCardProps) {
  const currentPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const savedPercent =
    hasDiscount && product.price > 0
      ? Math.round(((product.price - currentPrice) / product.price) * 100)
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-background/95 transition-colors duration-200 hover:bg-background">
      <Link
        href={`/product/${encodeURIComponent(product.slug)}`}
        className="relative block overflow-hidden rounded-[18px] bg-muted/18"
      >
        {hasDiscount ? (
          <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-emerald-500/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Save {savedPercent}%
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-2 left-2 z-10">
          <div className="inline-flex items-end gap-2 rounded-[16px] bg-background/88 px-3 py-2 text-foreground backdrop-blur-[6px]">
            <span className="text-sm font-semibold leading-none sm:text-base">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-[11px] leading-none text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.015] sm:h-44"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:p-3">
        <div className="space-y-1">
          <Link
            href={`/product/${encodeURIComponent(product.slug)}`}
            className="line-clamp-2 text-[13px] font-medium leading-5 text-foreground transition-colors hover:text-primary sm:text-sm"
          >
            {product.title}
          </Link>
        </div>

        <div className="mt-auto grid grid-cols-[1.18fr_0.82fr] gap-1.5">
          <AddToCartButton
            product={product}
            variant="default"
            className="h-10 rounded-[14px] px-3.5 text-[11px] font-semibold shadow-none"
            label="Add to Cart"
          />
          <Link
            href={`/product/${encodeURIComponent(product.slug)}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-primary/10 px-3 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <Eye className="size-3.5" />
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
