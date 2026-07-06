import { readFileSync, writeFileSync } from "node:fs";

const cardPath = "frontend/src/components/product/product-card.tsx";
let card = readFileSync(cardPath, "utf8");
card = card.replace(
  'const squareVariants: ProductCardVariant[] = ["compact", "minimal"];',
  'const squareVariants: ProductCardVariant[] = ["compact", "minimal", "quick_shop"];',
);
card = card.replace(
  'const strongVariants: ProductCardVariant[] = ["brutalist", "neo_brutalist", "tech_focus"];',
  'const strongVariants: ProductCardVariant[] = ["brutalist", "neo_brutalist", "tech_focus", "marketplace", "mono_catalog"];',
);
card = card.replace(
  'const centeredVariants: ProductCardVariant[] = ["luxury", "minimal"];',
  'const centeredVariants: ProductCardVariant[] = ["luxury", "minimal", "soft_card"];',
);
card = card.replace(
  'const wideActionVariants: ProductCardVariant[] = ["spotlight", "stacked", "brutalist"];',
  'const wideActionVariants: ProductCardVariant[] = ["spotlight", "stacked", "brutalist", "horizontal", "marketplace"];',
);
writeFileSync(cardPath, card);

const detailPath = "frontend/src/components/product/product-details-view.tsx";
let detail = readFileSync(detailPath, "utf8");
detail = detail.replace(
  "  const view = buildViewState(props.product, props.variants);",
  `  const resolvedVariant = productDetailsVariant === "conversion_focus"
    ? "buy_panel"
    : productDetailsVariant === "visual_story"
      ? "storyline"
      : productDetailsVariant === "compact_order"
        ? "streamlined"
        : productDetailsVariant;
  const view = buildViewState(props.product, props.variants);`,
);
detail = detail.replace(
  "return renderProductDetailsLayout(productDetailsVariant, layoutProps);",
  "return renderProductDetailsLayout(resolvedVariant, layoutProps);",
);
writeFileSync(detailPath, detail);
