import type {
  HomeSectionType,
  ProductFlag,
} from "@/actions/admin-actions";

export const PRODUCT_FLAGS: Array<{ value: ProductFlag; label: string }> = [
  { value: "isHotSells", label: "Hot Sells" },
  { value: "isWeeklySell", label: "Weekly Sell" },
  { value: "isSummerSell", label: "Summer Sell" },
  { value: "isWinterSell", label: "Winter Sell" },
  { value: "isBestSell", label: "Best Sell" },
];

export const SECTION_TYPES: Array<{
  value: HomeSectionType;
  label: string;
}> = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "product_collection", label: "Product Collection" },
  { value: "discount_banner", label: "Discount Banner" },
  { value: "custom_banner", label: "Custom Banner" },
];

export const PAGE_THEMES = [
  ["", "Store Default", "Use the main storefront appearance.", ["#ffffff", "#111827", "#f3f4f6"]],
  ["clean_commerce", "Clean Commerce", "Bright retail surfaces with crisp blue actions.", ["#ffffff", "#2563eb", "#eff6ff"]],
  ["soft_editorial", "Soft Editorial", "Warm paper tones with restrained violet accents.", ["#fffaf5", "#7c3aed", "#f3e8ff"]],
  ["contrast_luxe", "Contrast Luxe", "High-contrast monochrome for premium collections.", ["#fafafa", "#111111", "#e5e5e5"]],
  ["warm_market", "Warm Market", "Friendly cream surfaces and terracotta actions.", ["#fffaf0", "#c2410c", "#ffedd5"]],
  ["cool_tech", "Cool Tech", "Cool slate surfaces with electric cyan accents.", ["#f8fafc", "#0891b2", "#e0f2fe"]],
  ["glass_studio", "Glass Studio", "Airy violet surfaces for modern campaigns.", ["#faf5ff", "#7c3aed", "#ede9fe"]],
  ["compact_retail", "Compact Retail", "Dense merchandising with modern teal actions.", ["#ffffff", "#0f766e", "#ecfdf5"]],
] as const;
