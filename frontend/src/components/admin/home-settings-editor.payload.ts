import type { HomeSection } from "@/actions/admin-actions";
import type { SectionForm } from "@/components/admin/home-settings-editor.types";
import { getDefaultHomeSectionVariant } from "@/lib/home-section-variants";

let mappedId = 0;
const nextId = () => `mapped-section-${Date.now()}-${mappedId++}`;

export function mapHomeSection(section: HomeSection): SectionForm {
  return {
    id: section.id || nextId(),
    type: section.type,
    variant: section.variant || getDefaultHomeSectionVariant(section.type),
    title: section.title || "",
    subtitle: section.subtitle || "",
    description: section.description || "",
    imageUrl: section.imageUrl || "",
    backgroundImageUrl: section.backgroundImageUrl || "",
    buttonLabel: section.buttonLabel || "",
    buttonUrl: section.buttonUrl || "",
    productFlag: section.productFlag || "isHotSells",
    productLimit: String(section.productLimit ?? 8),
    theme: section.theme || "",
    isActive: section.isActive ?? true,
    slides: Array.isArray(section.slides)
      ? section.slides.map((slide, index) => ({
          id: `slide-${Date.now()}-${index}`,
          title: slide.title || "",
          subtitle: slide.subtitle || "",
          imageUrl: slide.imageUrl || "",
          linkUrl: slide.linkUrl || "",
          buttonLabel: slide.buttonLabel || "",
          isActive: slide.isActive ?? true,
        }))
      : [],
  };
}

export function normalizeHomeSectionPayload(
  section: SectionForm,
  sortOrder: number,
) {
  const payload: Record<string, unknown> = {
    id: section.id,
    type: section.type,
    variant: section.variant.trim() || getDefaultHomeSectionVariant(section.type),
    title: section.title.trim() || undefined,
    subtitle: section.subtitle.trim() || undefined,
    description: section.description.trim() || undefined,
    imageUrl: section.imageUrl.trim() || undefined,
    backgroundImageUrl: section.backgroundImageUrl.trim() || undefined,
    buttonLabel: section.buttonLabel.trim() || undefined,
    buttonUrl: section.buttonUrl.trim() || undefined,
    theme: section.theme.trim() || undefined,
    sortOrder,
    isActive: section.isActive,
  };

  if (section.type === "product_collection") {
    payload.productFlag = section.productFlag;
    const limit = Number(section.productLimit);
    payload.productLimit = Number.isFinite(limit) && limit > 0
      ? Math.min(limit, 24)
      : 8;
  }

  if (section.type === "hero_slider") {
    payload.slides = section.slides
      .filter((slide) => slide.imageUrl.trim())
      .map((slide, index) => ({
        title: slide.title.trim() || undefined,
        subtitle: slide.subtitle.trim() || undefined,
        imageUrl: slide.imageUrl.trim(),
        linkUrl: slide.linkUrl.trim() || undefined,
        buttonLabel: slide.buttonLabel.trim() || undefined,
        sortOrder: index + 1,
        isActive: slide.isActive,
      }));
  }

  return payload;
}
