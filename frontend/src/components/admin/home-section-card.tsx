"use client";

import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { DesignMiniature } from "@/components/admin/design-miniature";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PRODUCT_FLAGS } from "@/components/admin/home-settings-editor.constants";
import type { SectionForm, SlideForm } from "@/components/admin/home-settings-editor.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getHomeSectionVariantOptions } from "@/lib/home-section-variants";

export function HomeSectionCard({ section, index, collapsed, change, remove, toggle, addSlide, removeSlide, changeSlide }: {
  section: SectionForm;
  index: number;
  collapsed: boolean;
  change: <K extends keyof SectionForm>(field: K, value: SectionForm[K]) => void;
  remove: () => void;
  toggle: () => void;
  addSlide: () => void;
  removeSlide: (slideIndex: number) => void;
  changeSlide: <K extends keyof SlideForm>(slideIndex: number, field: K, value: SlideForm[K]) => void;
}) {
  const variants = getHomeSectionVariantOptions(section.type);
  return <article className="overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-sm">
    <header className="flex items-center gap-3 px-4 py-3">
      <GripVertical className="section-drag-handle size-4 cursor-grab text-on-surface-variant" />
      <button type="button" onClick={toggle} className="flex flex-1 items-center gap-3 text-left">
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{section.type.replaceAll("_", " ")}</span>
        <span className="text-sm font-semibold">{section.title || `Section ${index + 1}`}</span>
      </button>
      <label className="flex items-center gap-2 text-xs"><Checkbox checked={section.isActive} onCheckedChange={(value) => change("isActive", value === true)} />Active</label>
      <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={remove}><Trash2 className="size-4" /></Button>
    </header>

    {!collapsed ? <div className="space-y-5 border-t p-4">
      <section className="space-y-3">
        <div><Label>Choose design</Label><p className="text-xs text-on-surface-variant">Every option includes a visual example.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {variants.map((variant) => <button key={variant.value} type="button" onClick={() => change("variant", variant.value)} className="rounded-xl text-left transition hover:-translate-y-0.5">
            <DesignMiniature active={section.variant === variant.value} dense={variant.value.includes("compact") || variant.value.includes("strip")} />
            <div className="px-1 pt-2"><div className="flex items-center gap-2"><span className="text-xs font-semibold">{variant.label}</span>{variant.badge ? <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{variant.badge}</span> : null}</div><p className="mt-1 text-[11px] leading-4 text-on-surface-variant">{variant.description}</p></div>
          </button>)}
        </div>
      </section>

      {section.type === "hero_slider" ? <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between"><div><h4 className="text-sm font-semibold">Hero slides</h4><p className="text-xs text-on-surface-variant">Build image-led campaign slides.</p></div><Button type="button" size="sm" variant="outline" onClick={addSlide}><Plus className="size-4" />Add slide</Button></div>
        {section.slides.map((slide, slideIndex) => <div key={slide.id} className="space-y-3 rounded-xl border bg-background p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold">Slide {slideIndex + 1}</span><div className="flex items-center gap-2"><Checkbox checked={slide.isActive} onCheckedChange={(value) => changeSlide(slideIndex, "isActive", value === true)} /><Button type="button" size="icon" variant="ghost" onClick={() => removeSlide(slideIndex)}><Trash2 className="size-4" /></Button></div></div>
          <ImageUploadField id={`home-section-${section.id}-slide-${slide.id}-image`} label="Slide image" value={slide.imageUrl} onChange={(value) => changeSlide(slideIndex, "imageUrl", value)} />
          <div className="grid gap-3 md:grid-cols-2"><Input value={slide.title} onChange={(e) => changeSlide(slideIndex, "title", e.target.value)} placeholder="Headline" /><Input value={slide.subtitle} onChange={(e) => changeSlide(slideIndex, "subtitle", e.target.value)} placeholder="Supporting text" /><Input value={slide.buttonLabel} onChange={(e) => changeSlide(slideIndex, "buttonLabel", e.target.value)} placeholder="Button label" /><Input value={slide.linkUrl} onChange={(e) => changeSlide(slideIndex, "linkUrl", e.target.value)} placeholder="/shop" /></div>
        </div>)}
      </div> : <>
        <div className="grid gap-3 md:grid-cols-2"><div className="space-y-1.5"><Label>Title</Label><Input value={section.title} onChange={(e) => change("title", e.target.value)} /></div><div className="space-y-1.5"><Label>Subtitle</Label><Input value={section.subtitle} onChange={(e) => change("subtitle", e.target.value)} /></div></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea value={section.description} onChange={(e) => change("description", e.target.value)} /></div>
        <div className="grid gap-4 md:grid-cols-2"><ImageUploadField id={`home-section-${section.id}-main-image`} label="Main image" value={section.imageUrl} onChange={(value) => change("imageUrl", value)} /><ImageUploadField id={`home-section-${section.id}-background-image`} label="Background image" value={section.backgroundImageUrl} onChange={(value) => change("backgroundImageUrl", value)} /></div>
        <div className="grid gap-3 md:grid-cols-2"><div className="space-y-1.5"><Label>Button label</Label><Input value={section.buttonLabel} onChange={(e) => change("buttonLabel", e.target.value)} /></div><div className="space-y-1.5"><Label>Button URL</Label><Input value={section.buttonUrl} onChange={(e) => change("buttonUrl", e.target.value)} /></div></div>
        {section.type === "product_collection" ? <div className="grid gap-3 md:grid-cols-2"><div className="space-y-1.5"><Label>Product group</Label><select className="h-10 w-full rounded-md border bg-background px-3" value={section.productFlag} onChange={(e) => change("productFlag", e.target.value as SectionForm["productFlag"])}>{PRODUCT_FLAGS.map((flag) => <option key={flag.value} value={flag.value}>{flag.label}</option>)}</select></div><div className="space-y-1.5"><Label>Product limit</Label><Input type="number" min={1} max={24} value={section.productLimit} onChange={(e) => change("productLimit", e.target.value)} /></div></div> : null}
      </>}
    </div> : null}
  </article>;
}
