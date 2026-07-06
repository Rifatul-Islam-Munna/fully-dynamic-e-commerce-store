import { customSectionVariants } from "./custom";
import { heroSectionVariants } from "./hero";
import { productSectionVariants } from "./product";
import { promoSectionVariants } from "./promo";
import type { HomeSectionType, VariantOption } from "./types";

function options(rows: readonly (readonly [string, string])[]) {
  return rows.map(([value, label], index) => ({
    value,
    label,
    description: `${label} storefront layout.`,
    badge: index === 0 ? "Popular" : undefined,
  }));
}

export const HOME_SECTION_VARIANT_OPTIONS: Record<
  HomeSectionType,
  readonly VariantOption[]
> = {
  hero_slider: options(heroSectionVariants),
  product_collection: options(productSectionVariants),
  discount_banner: options(promoSectionVariants),
  custom_banner: options(customSectionVariants).map((item, index) => ({
    ...item,
    badge: index === 0 ? "Popular" : index >= 11 ? "New" : undefined,
  })),
};
