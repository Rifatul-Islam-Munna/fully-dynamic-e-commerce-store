export type ProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  price: number;
  discountPrice: number | null;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductDetails = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  imageUrls?: string[];
  price: number;
  discountPrice: number | null;
  orderPayableAmount?: number | null;
  richText?: string | null;
  mainNavUrl?: string | null;
  subNavUrl?: string | null;
  hasVariants?: boolean;
  variants?: ProductVariant[];
};

export type RelatedProduct = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  orderPayableAmount?: number | null;
};

export type ProductDetailsViewProps = {
  product: ProductDetails;
  gallery: string[];
  variants: ProductVariant[];
  relatedProducts: RelatedProduct[];
  mainNavUrl: string | null;
  subNavUrl: string | null;
  mainLabel: string | null;
  subLabel: string | null;
  relatedTitle: string;
};

export type ViewState = {
  hasVariants: boolean;
  baseCurrentPrice: number;
  hasBaseDiscount: boolean;
  showDiscountBadge: boolean;
  priceRangeText: string;
  summary: string;
  activeDiscountPercent: number;
};

export type ActionProduct = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  orderPayableAmount?: number | null;
  hasVariants?: boolean;
  variants: ProductVariant[];
};

export type LayoutProps = ProductDetailsViewProps & {
  actionProduct: ActionProduct;
  view: ViewState;
};
