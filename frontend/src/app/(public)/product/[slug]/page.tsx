import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import {
  ArrowRight,
  BadgePercent,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailsActions } from "@/components/product/product-details-actions";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { CURRENCY_CODE, formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

type ProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  price: number;
  discountPrice: number | null;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

type ProductDetails = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  imageUrls?: string[];
  price: number;
  discountPrice: number | null;
  richText?: string | null;
  mainNavUrl?: string | null;
  subNavUrl?: string | null;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  isActive?: boolean;
};

type ProductDetailsResponse = {
  mode?: "single";
  data?: ProductDetails;
};

type ProductListResponse = {
  mode?: "list";
  data?: Array<{
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string;
    price: number;
    discountPrice: number | null;
  }>;
};

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeImageUrls(primary?: string | null, extras?: string[]) {
  const urls = [primary, ...(extras || [])];
  const unique = new Set<string>();

  for (const rawUrl of urls) {
    const url = normalizeText(rawUrl);
    if (url) {
      unique.add(url);
    }
  }

  return Array.from(unique);
}

function stripHtmlToText(html?: string | null) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toMetaDescription(product: ProductDetails) {
  const richTextSummary = stripHtmlToText(product.richText).slice(0, 180);
  if (richTextSummary) {
    return richTextSummary;
  }

  return `Buy ${product.title} at the best price with fast delivery and secure checkout.`;
}

function toReadableLabel(url?: string | null) {
  const normalized = normalizeText(url);
  if (!normalized) {
    return null;
  }

  const segment = normalized.split("/").filter(Boolean).pop();
  if (!segment) {
    return null;
  }

  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildCanonicalPath(slug: string) {
  return `/product/${encodeURIComponent(slug)}`;
}

function buildAbsoluteUrl(path: string) {
  const siteUrl = normalizeText(process.env.NEXT_PUBLIC_SITE_URL);
  if (!siteUrl) {
    return null;
  }

  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeVariants(variants?: ProductVariant[]) {
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

const getProductBySlug = cache(async (slug: string) => {
  try {
    const payload = await GetRequestNormal<ProductDetailsResponse>(
      `/product/public?slug=${encodeURIComponent(slug)}`,
      0,
      `product-public-${slug}`,
    );
    return payload?.data ?? null;
  } catch {
    return null;
  }
});

const getRelatedProducts = cache(
  async (mainNavUrl?: string | null, subNavUrl?: string | null, slug?: string) => {
    const sub = normalizeText(subNavUrl);
    const main = normalizeText(mainNavUrl);

    if (!sub && !main) {
      return [];
    }

    const fetchRelated = async (params: URLSearchParams, tagSuffix: string) => {
      try {
        const payload = await GetRequestNormal<ProductListResponse>(
          `/product/public?${params.toString()}`,
          0,
          `product-related-${tagSuffix}`,
        );
        return (payload?.data ?? []).filter((item) => item.slug !== slug);
      } catch {
        return [];
      }
    };

    // 1) Try strict match on same sub-nav (and main-nav when available).
    if (sub) {
      const strictParams = new URLSearchParams({
        page: "1",
        limit: "8",
        subNavUrl: sub,
      });
      if (main) {
        strictParams.set("mainNavUrl", main);
      }

      const strictItems = await fetchRelated(
        strictParams,
        `${main ?? "none"}-${sub}`,
      );
      if (strictItems.length > 0) {
        return strictItems.slice(0, 4);
      }
    }

    // 2) Fallback to same main-nav when sub-nav has no siblings.
    if (main) {
      const fallbackParams = new URLSearchParams({
        page: "1",
        limit: "8",
        mainNavUrl: main,
      });
      const fallbackItems = await fetchRelated(
        fallbackParams,
        `${main}-fallback`,
      );
      return fallbackItems.slice(0, 4);
    }

    return [];
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const slug = decodeURIComponent(resolved.slug || "").trim();

  if (!slug) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const product = await getProductBySlug(slug);
  if (!product || product.isActive === false) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = toMetaDescription(product);
  const title = `${product.title} | Product Details`;
  const canonicalPath = buildCanonicalPath(product.slug);
  const canonicalUrl = buildAbsoluteUrl(canonicalPath) ?? canonicalPath;
  const gallery = normalizeImageUrls(product.thumbnailUrl, product.imageUrls);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      images: gallery.slice(0, 4).map((url) => ({ url })),
    },
    twitter: {
      card: gallery.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: gallery.slice(0, 4),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const slug = decodeURIComponent(resolved.slug || "").trim();

  if (!slug) {
    notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product || product.isActive === false) {
    notFound();
  }

  const gallery = normalizeImageUrls(product.thumbnailUrl, product.imageUrls);
  const variants = normalizeVariants(product.variants);
  const hasVariants = Boolean(product.hasVariants && variants.length > 0);

  const variantPrices = variants.map(
    (variant) => variant.discountPrice ?? variant.price,
  );
  const minVariantPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : null;
  const maxVariantPrice =
    variantPrices.length > 0 ? Math.max(...variantPrices) : null;

  const baseCurrentPrice = product.discountPrice ?? product.price;
  const hasBaseDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const showDiscountBadge = !hasVariants && hasBaseDiscount && product.price > 0;

  const priceRangeText =
    hasVariants && minVariantPrice !== null
      ? maxVariantPrice !== null && minVariantPrice !== maxVariantPrice
        ? `${formatCurrency(minVariantPrice)} - ${formatCurrency(maxVariantPrice)}`
        : formatCurrency(minVariantPrice)
      : formatCurrency(baseCurrentPrice);

  const relatedProducts = await getRelatedProducts(
    product.mainNavUrl,
    product.subNavUrl,
    product.slug,
  );

  const canonicalPath = buildCanonicalPath(product.slug);
  const canonicalUrl = buildAbsoluteUrl(canonicalPath) ?? canonicalPath;
  const description = toMetaDescription(product);

  const variantHasInStock = variants.some((variant) => (variant.stock ?? 0) > 0);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image: gallery,
    url: canonicalUrl,
    sku: variants[0]?.sku ?? undefined,
    offers:
      hasVariants && minVariantPrice !== null && maxVariantPrice !== null
        ? {
            "@type": "AggregateOffer",
            priceCurrency: CURRENCY_CODE,
            lowPrice: Number(minVariantPrice).toFixed(2),
            highPrice: Number(maxVariantPrice).toFixed(2),
            offerCount: variants.length,
            availability: variantHasInStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          }
        : {
            "@type": "Offer",
            priceCurrency: CURRENCY_CODE,
            price: Number(baseCurrentPrice).toFixed(2),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: canonicalUrl,
          },
  };

  const mainNavUrl = normalizeText(product.mainNavUrl);
  const subNavUrl = normalizeText(product.subNavUrl);
  const mainLabel = toReadableLabel(mainNavUrl);
  const subLabel = toReadableLabel(subNavUrl);
  const relatedTitle = subLabel
    ? `Related Products in ${subLabel}`
    : "Related Products";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-10">
        <ProductImageGallery images={gallery} title={product.title} />

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {mainNavUrl && mainLabel ? (
              <>
                <ArrowRight className="size-3" />
                <Link href={mainNavUrl} className="hover:text-foreground">
                  {mainLabel}
                </Link>
              </>
            ) : null}
            {subNavUrl && subLabel ? (
              <>
                <ArrowRight className="size-3" />
                <Link href={subNavUrl} className="hover:text-foreground">
                  {subLabel}
                </Link>
              </>
            ) : null}
          </nav>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {hasVariants ? `From ${priceRangeText}` : priceRangeText}
              </span>
              {!hasVariants && hasBaseDiscount ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              ) : null}
              {showDiscountBadge ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  <BadgePercent className="size-3.5" />
                  Save{" "}
                  {Math.round(
                    ((product.price - baseCurrentPrice) / product.price) * 100,
                  )}
                  %
                </span>
              ) : null}
            </div>
          </div>

          <ProductDetailsActions
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              thumbnailUrl: product.thumbnailUrl,
              price: product.price,
              discountPrice: product.discountPrice,
              hasVariants: product.hasVariants,
              variants,
            }}
          />

          <section className="rounded-2xl bg-card/60 p-4 sm:p-5">
            <h2 className="text-base font-semibold tracking-tight">
              Product Details
            </h2>
            {product.richText?.trim() ? (
              <div className="mt-3 overflow-x-auto">
                <article
                  className="product-rich-content prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.richText }}
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Detailed description will be added soon.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-2xl bg-card/60 p-4 sm:p-5">
            <h2 className="text-base font-semibold tracking-tight">
              {relatedTitle}
            </h2>
            {relatedProducts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No related products available for this category yet.
              </p>
            )}
          </section>

          <div className="grid gap-2 rounded-xl bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="size-4" />
              Fast delivery support
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4" />
              Secure checkout and payment protection
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PackageCheck className="size-4" />
              Quality checked before dispatch
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
