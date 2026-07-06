import { readFileSync, writeFileSync } from "node:fs";
const p = "frontend/src/lib/site-appearance.ts";
let s = readFileSync(p, "utf8");
const a = s.indexOf("export const PRODUCT_DETAILS_VARIANT_OPTIONS");
const b = s.indexOf("] as const;", a);
s = s.slice(0, b) + '  { value: "visual_story", label: "Visual Story", description: "Media-led layout." },\n' + s.slice(b);
writeFileSync(p, s);
