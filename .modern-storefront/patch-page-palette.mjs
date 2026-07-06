import { readFileSync, writeFileSync } from "node:fs";
const file = "frontend/src/components/home/dynamic-sections-page.tsx";
let text = readFileSync(file, "utf8");
text = text.replace(
  'import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";',
  'import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";\nimport { cn } from "@/lib/utils";',
);
text = text.replace(
  "  const sections = normalizeSections(home?.sections).filter((section) =>",
  "  const pageTheme = home?.theme === \"clean_commerce\" ? \"cobalt\" : home?.theme === \"soft_editorial\" ? \"violet\" : home?.theme === \"contrast_luxe\" ? \"graphite\" : home?.theme === \"warm_market\" ? \"coral\" : home?.theme === \"cool_tech\" ? \"sky\" : home?.theme === \"glass_studio\" ? \"berry\" : home?.theme === \"compact_retail\" ? \"teal\" : \"\";\n\n  const sections = normalizeSections(home?.sections).filter((section) =>",
);
text = text.replace(
  '<main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">',
  '<main className={cn("mx-auto w-full max-w-7xl space-y-5 bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8", pageTheme)}>',
);
writeFileSync(file, text);
