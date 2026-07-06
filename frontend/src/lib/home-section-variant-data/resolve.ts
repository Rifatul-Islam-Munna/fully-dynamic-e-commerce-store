import { HOME_SECTION_VARIANT_OPTIONS } from "./catalog";
import { defaultSectionDesign } from "./api";
import type { HomeSectionType } from "./types";

export const resolveSectionDesign = (type: HomeSectionType, value?: string | null) =>
  HOME_SECTION_VARIANT_OPTIONS[type].some((item) => item.value === value)
    ? String(value)
    : defaultSectionDesign(type);
