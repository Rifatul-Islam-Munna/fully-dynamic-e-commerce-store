import { readFileSync, writeFileSync } from "node:fs";
const file = "frontend/src/lib/site-appearance.ts";
let text = readFileSync(file, "utf8");
const start = text.indexOf("export const PRODUCT_CARD_VARIANT_OPTIONS");
const end = text.indexOf("] as const;", start);
const extra = `  { value: "horizontal", label: "Horizontal Commerce", description: "Wide card for recommendations and compact rows." },
  { value: "quick_shop", label: "Quick Shop", description: "Compact action-first browsing card." },
  { value: "marketplace", label: "Marketplace Pro", description: "Information-rich retail product card." },
  { value: "soft_card", label: "Soft Card", description: "Friendly rounded lifestyle card." },
  { value: "mono_catalog", label: "Mono Catalog", description: "High-contrast premium catalog card." },
`;
text = text.slice(0, end) + extra + text.slice(end);
writeFileSync(file, text);
