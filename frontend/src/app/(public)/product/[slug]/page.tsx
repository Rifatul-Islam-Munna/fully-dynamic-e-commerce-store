import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { ProductDetailsView } from "@/components/product/product-details-view";
import { CURRENCY_CODE } from "@/lib/currency";

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
      <ProductDetailsView
        product={product}
        gallery={gallery}
        variants={variants}
        relatedProducts={relatedProducts}
        mainNavUrl={mainNavUrl}
        subNavUrl={subNavUrl}
        mainLabel={mainLabel}
        subLabel={subLabel}
        relatedTitle={relatedTitle}
      />

    </main>
  );
}
