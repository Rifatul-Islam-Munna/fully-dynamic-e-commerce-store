import { readFileSync, writeFileSync } from "node:fs";

const path = "frontend/src/app/admin/home-settings/page.tsx";
let source = readFileSync(path, "utf8");

const replaceRange = (start, end, replacement) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`Missing patch marker: ${start}`);
  source = source.slice(0, from) + replacement + source.slice(to);
};

source = source.replace(
  'import { ImageUploadField } from "@/components/admin/image-upload-field";',
  'import { ImageUploadField } from "@/components/admin/image-upload-field";\nimport { DesignMiniature } from "@/components/admin/design-miniature";',
);

source = source.replace(
  'const makeId = () =>',
  `const PAGE_THEMES = [
  ["", "Store Default", ["#ffffff", "#111827", "#f3f4f6"]],
  ["clean_commerce", "Clean Commerce", ["#ffffff", "#1d4ed8", "#eff6ff"]],
  ["soft_editorial", "Soft Editorial", ["#fffaf5", "#7c3aed", "#f3e8ff"]],
  ["contrast_luxe", "Contrast Luxe", ["#fafafa", "#111111", "#e5e5e5"]],
  ["warm_market", "Warm Market", ["#fffaf0", "#c2410c", "#ffedd5"]],
  ["cool_tech", "Cool Tech", ["#f8fafc", "#0891b2", "#e0f2fe"]],
  ["glass_studio", "Glass Studio", ["#faf5ff", "#7c3aed", "#ede9fe"]],
  ["compact_retail", "Compact Retail", ["#ffffff", "#0f766e", "#ecfdf5"]],
] as const;

const makeId = ()`,
);

replaceRange(
  '      <div className="rounded-xl border border-border bg-surface-container-lowest p-5 space-y-3">',
  '\n\n      {form.sections.length === 0 ? (',
  `      <div className="rounded-xl border border-border bg-surface-container-lowest p-5 space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-primary" /> Global Theme
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">Choose a complete color direction and preview it before saving.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAGE_THEMES.map(([value, label, colors]) => (
            <button key={value || "default"} type="button" onClick={() => setForm((prev) => ({ ...prev, theme: value }))}
              className={\`rounded-xl border p-3 text-left transition hover:border-primary/60 \${form.theme === value ? "border-primary ring-2 ring-primary/15" : "border-border"}\`}>
              <div className="mb-3 flex h-9 overflow-hidden rounded-lg border">
                {colors.map((color) => <span key={color} className="flex-1" style={{ backgroundColor: color }} />)}
              </div>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>`,
);

replaceRange(
  '                    <div className="rounded-lg border border-border/60 bg-surface-container-low/50 p-4">',
  '                    {section.type !== "hero_slider" ? (',
  `                    <div className="space-y-3 rounded-lg border border-border/60 bg-surface-container-low/50 p-4">
                      <div>
                        <Label className="text-xs">Choose Section Design</Label>
                        <p className="mt-1 text-xs text-on-surface-variant">Select a visual example instead of guessing from a name.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {variantOptions.map((option) => (
                          <button key={option.value} type="button" aria-pressed={section.variant === option.value}
                            onClick={() => updateSection(sectionIndex, "variant", option.value)}
                            className="rounded-xl text-left transition hover:-translate-y-0.5">
                            <DesignMiniature active={section.variant === option.value} dense={option.value.includes("compact") || option.value.includes("strip")} />
                            <div className="px-1 pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">{option.label}</span>
                                {option.badge ? <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{option.badge}</span> : null}
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">{option.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {section.type !== "hero_slider" ? (`,
);

source = source.replace(
  "Build dynamic page sections with custom order and rich hero slider content.",
  "Build compact, professional storefront pages with visual design previews and flexible sections.",
);

writeFileSync(path, source);
