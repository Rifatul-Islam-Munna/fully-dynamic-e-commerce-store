import { readFileSync, writeFileSync } from "node:fs";
const p = "backend/src/web-settings/entities/site-setting.entity.ts";
let s = readFileSync(p, "utf8");
const add = (marker, values) => {
  const a = s.indexOf(marker);
  const b = s.indexOf("] as const;", a);
  s = s.slice(0, b) + values.map((value) => `  '${value}',\n`).join("") + s.slice(b);
};
add("export const PRODUCT_CARD_VARIANT_VALUES", ["horizontal", "quick_shop", "marketplace", "soft_card", "mono_catalog"]);
add("export const PRODUCT_DETAILS_VARIANT_VALUES", ["conversion_focus", "visual_story", "compact_order"]);
writeFileSync(p, s);
