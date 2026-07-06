import { existsSync, rmSync } from "node:fs";

await import("./patch-home-settings.mjs");
await import("./patch-page-palette.mjs");
await import("./patch-custom-sections.mjs");
await import("./patch-card-options.mjs");
await import("./patch-one-detail-option.mjs");
await import("./add-detail-b.mjs");
await import("./add-detail-c.mjs");
await import("./patch-product-runtime.mjs");
await import("./patch-backend-design-values.mjs");

const obsolete = [
  "frontend/src/styles/home-page-themes.css",
  ".github/workflows/apply-home-design-upgrade.yml",
];
for (const file of obsolete) {
  if (existsSync(file)) rmSync(file, { force: true });
}
rmSync(".modern-storefront", { recursive: true, force: true });
console.log("Modern storefront upgrade applied.");
