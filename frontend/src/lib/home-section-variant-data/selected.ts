import { HOME_SECTION_VARIANT_OPTIONS } from "./catalog";
import { resolveSectionDesign } from "./resolve";
import type { HomeSectionType } from "./types";

export function selectedSectionDesign(type: HomeSectionType, value?: string | null) {
  const key = resolveSectionDesign(type, value);
  return HOME_SECTION_VARIANT_OPTIONS[type].find((item) => item.value === key)
    ?? HOME_SECTION_VARIANT_OPTIONS[type][0];
}
