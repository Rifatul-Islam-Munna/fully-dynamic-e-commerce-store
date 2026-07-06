"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PRODUCT_FLAGS } from "@/components/admin/home-settings-editor.constants";
import type { SectionForm, SlideForm } from "@/components/admin/home-settings-editor.types";
import { SectionDesignPreview } from "@/components/admin/section-design-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getHomeSectionVariantOptions } from "@/lib/home-section-variants";
import { cn } from "@/lib/utils";

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
  const [previewVariant, setPreviewVariant] = useState<string | null>(null);
  const previewOption = variants.find((item) => item.value === previewVariant);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-sm">
        <header className="flex flex-wrap items-center gap-3 px-4 py-3">
          <GripVertical className="section-drag-handle size-4 cursor-grab text-on-surface-variant active:cursor-grabbing" />
          <button type="button" onClick={toggle} className="flex min-w-48 flex-1 items-center gap-3 text-left">
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
              {section.type.replaceAll("_", " ")}
            </span>
            <span className="truncate text-sm font-semibold">
              {section.title || `Section ${index + 1}`}
            </span>
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPreviewVariant(section.variant)}
          >
            <Eye className="size-4" />
            Preview
          </Button>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={section.isActive} onCheckedChange={(value) => change("isActive", value === true)} />
            Active
          </label>
          <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={remove}>
            <Trash2 className="size-4" />
          </Button>
        </header>

        {!collapsed ? (
          <div className="space-y-5 border-t p-4">
            <section className="space-y-3">
              <div>
                <Label>Choose design</Label>
                <p className="text-xs text-on-surface-variant">
                  Click any design to open a full preview. Apply it only after reviewing the example.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {variants.map((variant) => {
                  const active = section.variant === variant.value;
                  return (
                    <button
                      key={variant.value}
                      type="button"
                      onClick={() => setPreviewVariant(variant.value)}
                      className={cn(
                        "group overflow-hidden rounded-xl border bg-background p-2 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
                        active && "border-primary ring-2 ring-primary/15",
                      )}
                    >
                      <SectionDesignPreview
                        type={section.type}
                        variant={variant.value}
                        title={section.title}
                        subtitle={section.subtitle}
                        compact
                      />
                      <div className="px-1 pb-1 pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{variant.label}</span>
                            {variant.badge ? (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                {variant.badge}
                              </span>
                            ) : null}
                          </div>
                          {active ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3" />
                            </span>
                          ) : (
                            <Eye className="size-4 text-on-surface-variant transition group-hover:text-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">
                          {variant.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {section.type === "hero_slider" ? (
              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Hero slides</h4>
                    <p className="text-xs text-on-surface-variant">Build image-led campaign slides.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addSlide}>
                    <Plus className="size-4" />
                    Add slide
                  </Button>
                </div>
                {section.slides.map((slide, slideIndex) => (
                  <div key={slide.id} className="space-y-3 rounded-xl border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Slide {slideIndex + 1}</span>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={slide.isActive} onCheckedChange={(value) => changeSlide(slideIndex, "isActive", value === true)} />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeSlide(slideIndex)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <ImageUploadField id={`home-section-${section.id}-slide-${slide.id}-image`} label="Slide image" value={slide.imageUrl} onChange={(value) => changeSlide(slideIndex, "imageUrl", value)} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input value={slide.title} onChange={(event) => changeSlide(slideIndex, "title", event.target.value)} placeholder="Headline" />
                      <Input value={slide.subtitle} onChange={(event) => changeSlide(slideIndex, "subtitle", event.target.value)} placeholder="Supporting text" />
                      <Input value={slide.buttonLabel} onChange={(event) => changeSlide(slideIndex, "buttonLabel", event.target.value)} placeholder="Button label" />
                      <Input value={slide.linkUrl} onChange={(event) => changeSlide(slideIndex, "linkUrl", event.target.value)} placeholder="/shop" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={section.title} onChange={(event) => change("title", event.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Subtitle</Label><Input value={section.subtitle} onChange={(event) => change("subtitle", event.target.value)} /></div>
                </div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea value={section.description} onChange={(event) => change("description", event.target.value)} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageUploadField id={`home-section-${section.id}-main-image`} label="Main image" value={section.imageUrl} onChange={(value) => change("imageUrl", value)} />
                  <ImageUploadField id={`home-section-${section.id}-background-image`} label="Background image" value={section.backgroundImageUrl} onChange={(value) => change("backgroundImageUrl", value)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5"><Label>Button label</Label><Input value={section.buttonLabel} onChange={(event) => change("buttonLabel", event.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Button URL</Label><Input value={section.buttonUrl} onChange={(event) => change("buttonUrl", event.target.value)} /></div>
                </div>
                {section.type === "product_collection" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Product group</Label>
                      <select className="h-10 w-full rounded-md border bg-background px-3" value={section.productFlag} onChange={(event) => change("productFlag", event.target.value as SectionForm["productFlag"])}>
                        {PRODUCT_FLAGS.map((flag) => <option key={flag.value} value={flag.value}>{flag.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>Product limit</Label><Input type="number" min={1} max={24} value={section.productLimit} onChange={(event) => change("productLimit", event.target.value)} /></div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </article>

      {previewVariant ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Section design preview">
          <button type="button" className="absolute inset-0" aria-label="Close preview" onClick={() => setPreviewVariant(null)} />
          <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-auto rounded-2xl border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{previewOption?.label || "Design preview"}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold capitalize text-primary">
                    {section.type.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {previewOption?.description || "Preview how this section will appear on the storefront."}
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setPreviewVariant(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="bg-surface-container-low/40 p-4 sm:p-8">
              <div className="mx-auto max-w-5xl rounded-2xl bg-background p-2 shadow-xl sm:p-4">
                <SectionDesignPreview
                  type={section.type}
                  variant={previewVariant}
                  title={section.title}
                  subtitle={section.subtitle}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-on-surface-variant">
                This preview uses sample storefront content. Your saved text and images will replace it.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setPreviewVariant(null)}>Cancel</Button>
                <Button
                  type="button"
                  onClick={() => {
                    change("variant", previewVariant);
                    setPreviewVariant(null);
                  }}
                >
                  <Check className="size-4" />
                  Use this design
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
