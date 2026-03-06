import { formatCurrency } from "@/lib/currency";
import type {
  ActionProduct,
  ProductDetails,
  ProductDetailsViewProps,
  ProductVariant,
  ViewState,
} from "@/components/product/product-details-view.types";

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

export function buildViewState(
  product: ProductDetails,
  variants: ProductVariant[],
): ViewState {
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
  const summary = stripHtmlToText(product.richText).slice(0, 220);
  const priceRangeText =
    hasVariants && minVariantPrice !== null
      ? maxVariantPrice !== null && minVariantPrice !== maxVariantPrice
        ? `${formatCurrency(minVariantPrice)} - ${formatCurrency(maxVariantPrice)}`
        : formatCurrency(minVariantPrice)
      : formatCurrency(baseCurrentPrice);
  const activeDiscountPercent =
    showDiscountBadge && product.price > 0
      ? Math.round(((product.price - baseCurrentPrice) / product.price) * 100)
      : 0;

  return {
    hasVariants,
    baseCurrentPrice,
    hasBaseDiscount,
    showDiscountBadge,
    priceRangeText,
    summary,
    activeDiscountPercent,
  };
}

export function buildActionProduct(
  props: ProductDetailsViewProps,
): ActionProduct {
  return {
    id: props.product.id,
    slug: props.product.slug,
    title: props.product.title,
    thumbnailUrl: props.product.thumbnailUrl,
    price: props.product.price,
    discountPrice: props.product.discountPrice,
    hasVariants: props.product.hasVariants,
    variants: props.variants,
  };
}
