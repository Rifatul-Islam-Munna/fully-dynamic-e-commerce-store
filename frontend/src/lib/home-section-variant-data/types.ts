export type HomeSectionType =
  | "hero_slider"
  | "product_collection"
  | "discount_banner"
  | "custom_banner";

export type VariantOption = {
  value: string;
  label: string;
  description: string;
  badge?: string;
};
