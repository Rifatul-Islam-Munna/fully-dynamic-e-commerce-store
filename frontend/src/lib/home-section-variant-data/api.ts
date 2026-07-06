import { HOME_SECTION_VARIANT_OPTIONS } from "./catalog";
import type { HomeSectionType } from "./types";

export function listSectionDesigns(type: HomeSectionType) {
  return HOME_SECTION_VARIANT_OPTIONS[type];
}

export function defaultSectionDesign(type: HomeSectionType) {
  return HOME_SECTION_VARIANT_OPTIONS[type][0]?.value || "original";
}
