export type HomeSectionType =
  | "hero_slider"
  | "product_collection"
  | "discount_banner"
  | "custom_banner";

type VariantOption = {
  value: string;
  label: string;
  description: string;
};

export const HOME_SECTION_VARIANT_OPTIONS: Record<
  HomeSectionType,
  readonly VariantOption[]
> = {
  hero_slider: [
    {
      value: "original",
      label: "Original",
      description: "Current full-width slider with the message anchored on the image.",
    },
    {
      value: "split_panel",
      label: "Left Panel",
      description: "Layered premium panel with stronger hierarchy for hero launches and high-value campaigns.",
    },
    {
      value: "bottom_story",
      label: "Bottom Panel",
      description: "Editorial bottom story card with clearer messaging, CTA focus, and stronger readability.",
    },
    {
      value: "center_stage",
      label: "Centered",
      description: "Centered showcase treatment for launches, promotions, and flagship landing moments.",
    },
    {
      value: "editorial_frame",
      label: "Framed Panel",
      description: "Refined framed copy panel with a calmer editorial storefront presentation.",
    },
    {
      value: "minimal_overlay",
      label: "Minimal Overlay",
      description: "Subtle bottom-left text overlay with minimal visual interference on the hero image.",
    },
    {
      value: "gradient_banner",
      label: "Gradient Banner",
      description: "Bold gradient strip across the bottom with crisp typography and strong CTA presence.",
    },
    {
      value: "side_reveal",
      label: "Side Reveal",
      description: "Right-aligned content panel that slides in, keeping the image as the primary element.",
    },
    {
      value: "top_bar",
      label: "Top Bar",
      description: "Clean top-aligned announcement bar style with title, subtitle, and action button.",
    },
    {
      value: "pill_float",
      label: "Floating Pill",
      description: "Floating rounded pill card positioned centrally with compact, attention-grabbing content.",
    },
    {
      value: "corner_card",
      label: "Corner Card",
      description: "Compact card anchored to the bottom-right corner for an understated but clear message.",
    },
  ],
  product_collection: [
    {
      value: "original",
      label: "Original",
      description: "Balanced collection section with a clean intro and standard product grid.",
    },
    {
      value: "compact_grid",
      label: "Compact Grid",
      description: "Clean dense grid for shoppers who want to compare more products quickly.",
    },
    {
      value: "editorial_band",
      label: "Intro Panel",
      description: "Simple intro panel beside the grid for guided browsing and clearer section context.",
    },
    {
      value: "side_panel",
      label: "Summary Rail",
      description: "Product-first grid with a clear side guide and an easy path into the full collection.",
    },
    {
      value: "minimal_shelf",
      label: "Minimal Shelf",
      description: "Most minimal version with a clear heading and direct product focus.",
    },
    {
      value: "spotlight_board",
      label: "Wide Shelf",
      description: "Featured header above the grid for highlighted collections without extra clutter.",
    },
    {
      value: "banner_top",
      label: "Banner Top",
      description: "Bold colored banner header above the product grid for high-impact collection launches.",
    },
    {
      value: "floating_header",
      label: "Floating Header",
      description: "Floating header card overlapping the grid for a modern layered editorial feel.",
    },
    {
      value: "split_intro",
      label: "Split Intro",
      description: "Two-column intro with title on one side and description on the other above the grid.",
    },
    {
      value: "tab_shelf",
      label: "Tab Shelf",
      description: "Clean shelf with tab-like filter indicators highlighting the collection type.",
    },
    {
      value: "numbered_list",
      label: "Numbered List",
      description: "Numbered collection header with a clear visual counter and streamlined product grid.",
    },
  ],
  discount_banner: [
    {
      value: "original",
      label: "Original",
      description: "Current campaign banner layout for stronger promotional sections.",
    },
    {
      value: "split_offer",
      label: "Clean Split",
      description: "Structured split campaign with clearer offer hierarchy and a better-balanced visual side.",
    },
    {
      value: "poster",
      label: "Centered Campaign",
      description: "Poster-style campaign banner with centered messaging and stronger visual presentation.",
    },
    {
      value: "strip",
      label: "Compact Strip",
      description: "Premium compact banner for quick promotions, flash sales, and homepage interruptions.",
    },
    {
      value: "inset_card",
      label: "Inset Card",
      description: "Photo-led banner with a floating content card to keep offer details readable and elevated.",
    },
    {
      value: "image_edge",
      label: "Visual Edge",
      description: "Offer-first layout with the campaign visual pushed to the edge for cleaner emphasis.",
    },
    {
      value: "ribbon_banner",
      label: "Ribbon Banner",
      description: "Eye-catching ribbon-style banner with angled accent for flash sales and time-limited offers.",
    },
    {
      value: "glassmorphic",
      label: "Glass Card",
      description: "Frosted glass card overlay on the background image for a premium modern aesthetic.",
    },
    {
      value: "countdown_style",
      label: "Urgency Style",
      description: "Bold urgency-focused layout with prominent title and strong call-to-action placement.",
    },
    {
      value: "minimal_bar",
      label: "Minimal Bar",
      description: "Single-line minimal announcement bar style for subtle discount notifications.",
    },
    {
      value: "hero_discount",
      label: "Hero Discount",
      description: "Full-width hero-style discount banner with large typography and dramatic visual presence.",
    },
  ],
  custom_banner: [
    {
      value: "original",
      label: "Original",
      description: "Current balanced custom section with clear content and optional supporting image.",
    },
    {
      value: "split_story",
      label: "Split Layout",
      description: "Balanced editorial split for featured content, storytelling, and category messaging.",
    },
    {
      value: "media_left",
      label: "Media Left",
      description: "Image-led layout with stronger media presence and a more refined content panel.",
    },
    {
      value: "feature_panel",
      label: "Summary Panel",
      description: "Structured content-led panel with clearer hierarchy and more polished support media.",
    },
    {
      value: "statement_center",
      label: "Centered Statement",
      description: "Elevated centered statement for announcements, campaigns, and flagship highlights.",
    },
    {
      value: "dual_panel",
      label: "Dual Column",
      description: "Two-surface layout with a stronger relationship between the main message and support panel.",
    },
    {
      value: "campaign_strip",
      label: "Compact Strip",
      description: "Compact premium strip for concise callouts and sharper navigation prompts.",
    },
    {
      value: "framed_media",
      label: "Framed Visual",
      description: "Large framed media treatment with a more intentional supporting content block.",
    },
    {
      value: "asymmetric",
      label: "Offset Visual",
      description: "Offset composition with stronger movement while still staying professional and restrained.",
    },
    {
      value: "soft_poster",
      label: "Soft Campaign",
      description: "Soft, elevated campaign poster with calmer surfaces and stronger hero emphasis.",
    },
    {
      value: "info_strip",
      label: "Info Strip",
      description: "Clean horizontal info strip with icon accent for announcements and quick-read messages.",
    },
  ],
} as const;

export function getHomeSectionVariantOptions(type: HomeSectionType) {
  return HOME_SECTION_VARIANT_OPTIONS[type];
}

export function getDefaultHomeSectionVariant(type: HomeSectionType) {
  return HOME_SECTION_VARIANT_OPTIONS[type][0]?.value ?? "original";
}

export function normalizeHomeSectionVariant(
  type: HomeSectionType,
  value?: string | null,
) {
  const options = HOME_SECTION_VARIANT_OPTIONS[type];
  return options.some((option) => option.value === value)
    ? (value as string)
    : getDefaultHomeSectionVariant(type);
}

export function getHomeSectionVariantMeta(
  type: HomeSectionType,
  value?: string | null,
) {
  const resolved = normalizeHomeSectionVariant(type, value);
  return (
    HOME_SECTION_VARIANT_OPTIONS[type].find(
      (option) => option.value === resolved,
    ) ?? HOME_SECTION_VARIANT_OPTIONS[type][0]
  );
}
