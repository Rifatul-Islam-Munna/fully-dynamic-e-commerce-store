"use client";

import { PAGE_THEMES } from "@/components/admin/home-settings-editor.constants";
import { cn } from "@/lib/utils";

export function PagePaletteGrid(props: { selected: string; choose: (value: string) => void }) {
  return <section className="space-y-4 rounded-2xl border bg-surface-container-lowest p-5">
    <div><h2 className="text-base font-semibold">Global Theme</h2><p className="text-xs text-on-surface-variant">Preview a palette before applying it to this page.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PAGE_THEMES.map(([value, label, description, colors]) => <button key={value || "default"} type="button" onClick={() => props.choose(value)} className={cn("rounded-xl border p-3 text-left transition hover:border-primary", props.selected === value && "border-primary ring-2 ring-primary/15")}>
        <div className="mb-3 flex h-9 overflow-hidden rounded-lg border">{colors.map((color) => <i key={color} className="flex-1" style={{ background: color }} />)}</div>
        <strong className="text-sm">{label}</strong><p className="mt-1 text-[11px] text-on-surface-variant">{description}</p>
      </button>)}
    </div>
  </section>;
}
