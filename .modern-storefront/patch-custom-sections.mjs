import { readFileSync, writeFileSync } from "node:fs";
const file = "frontend/src/components/home/custom-banner-section.tsx";
let text = readFileSync(file, "utf8");
text = text.replace(
  '  const variant = normalizeHomeSectionVariant("custom_banner", section.variant);',
  `  const rawVariant = normalizeHomeSectionVariant("custom_banner", section.variant);
  const variant = rawVariant === "commerce_mosaic"
    ? "dual_panel"
    : rawVariant === "category_portal"
      ? "feature_panel"
      : rawVariant === "brand_manifesto"
        ? "statement_center"
        : rawVariant === "shoppable_story"
          ? "split_story"
          : rawVariant === "compact_feature"
            ? "campaign_strip"
            : rawVariant === "image_marquee"
              ? "framed_media"
              : rawVariant;`,
);
writeFileSync(file, text);
