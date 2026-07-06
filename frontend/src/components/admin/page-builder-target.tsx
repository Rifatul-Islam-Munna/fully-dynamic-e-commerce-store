"use client";

import type { NavMainItem, NavSubItem } from "@/components/admin/home-settings-editor.types";

export function PageBuilderTarget(props: {
  nav: NavMainItem[];
  subNav: NavSubItem[];
  main: string;
  sub: string;
  setMain: (value: string) => void;
  setSub: (value: string) => void;
}) {
  return <section className="space-y-4 rounded-2xl border bg-surface-container-lowest p-5">
    <div><h2 className="text-base font-semibold">Page Target</h2><p className="text-xs text-on-surface-variant">Choose the storefront route that this layout belongs to.</p></div>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1.5 text-xs font-medium">Main page<select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={props.main} onChange={(event) => props.setMain(event.target.value)}><option value="">Homepage</option>{props.nav.map((item) => <option key={item.url} value={item.url}>{item.title || item.url}</option>)}</select></label>
      <label className="space-y-1.5 text-xs font-medium">Sub page<select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={props.sub} onChange={(event) => props.setSub(event.target.value)} disabled={!props.main}><option value="">None</option>{props.subNav.map((item) => <option key={item.url} value={item.url}>{item.title || item.url}</option>)}</select></label>
    </div>
    <div className="rounded-lg border bg-surface-container-low/50 px-3 py-2 text-xs text-on-surface-variant">Editing: {props.sub || props.main || "/"}</div>
  </section>;
}
