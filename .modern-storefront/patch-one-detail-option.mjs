import { readFileSync, writeFileSync } from "node:fs";
const file = "frontend/src/lib/site-appearance.ts";
let text = readFileSync(file, "utf8");
const start = text.indexOf("export const PRODUCT_DETAILS_VARIANT_OPTIONS");
const end = text.indexOf("] as const;", start);
text = text.slice(0, end) + '  { value: "conversion_focus", label: "Conversion Focus", description: "Focused modern product layout." },\n' + text.slice(end);
writeFileSync(file, text);
