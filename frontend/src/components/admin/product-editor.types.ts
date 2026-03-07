export type ProductEditorMode = "create" | "edit";

export type GalleryItem = {
  id: string;
  url: string;
};

export type VariantForm = {
  title: string;
  sku: string;
  price: string;
  discountPrice: string;
  stock: string;
  sortOrder: string;
  isActive: boolean;
};

export type ProductForm = {
  thumbnailUrl: string;
  imageGallery: GalleryItem[];
  title: string;
  slug: string;
  price: string;
  discountPrice: string;
  orderPayableAmount: string;
  stock: string;
  richText: string;
  mainNavUrl: string;
  subNavUrl: string;
  hasVariants: boolean;
  variants: VariantForm[];
  isActive: boolean;
  isHotSells: boolean;
  isWeeklySell: boolean;
  isSummerSell: boolean;
  isWinterSell: boolean;
  isBestSell: boolean;
};

export type NavSubItem = {
  title: string;
  url: string;
};

export type NavMainItem = {
  title: string;
  url: string;
  subNav: NavSubItem[];
};
