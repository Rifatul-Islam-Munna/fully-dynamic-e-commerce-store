"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Plus, X } from "lucide-react";
import type { HomeSectionType } from "@/actions/admin-actions";
import { SECTION_TYPES } from "@/components/admin/home-settings-editor.constants";
import { SectionDesignPreview } from "@/components/admin/section-design-preview";
import { Button } from "@/components/ui/button";
import { getDefaultHomeSectionVariant } from "@/lib/home-section-variants";

export function PageBuilderHeader({ onAdd }: { onAdd: (type: HomeSectionType) => void }) {
  const [previewType, setPreviewType] = useState<HomeSectionType | null>(null);
  const selectedItem = useMemo(
    () => SECTION_TYPES.find((item) => item.value === previewType),
    [previewType],
  );
  const previewVariant = previewType
    ? getDefaultHomeSectionVariant(previewType)
    : "original";

  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home Settings</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Build compact storefront pages with flexible sections and full visual previews.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 xl:justify-end">
            {SECTION_TYPES.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                onClick={() => setPreviewType(item.value)}
              >
                <Eye className="size-4" />
                {item.label}
              </Button>
            ))}
          </div>
          <p className="text-left text-[11px] text-on-surface-variant xl:text-right">
            Click a component to preview it before adding.
          </p>
        </div>
      </div>

      {previewType ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedItem?.label || "Component"} preview`}
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close component preview"
            onClick={() => setPreviewType(null)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-auto rounded-2xl border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{selectedItem?.label} preview</h2>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    Component
                  </span>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Review the default storefront layout first. More design choices become available after adding it.
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setPreviewType(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="bg-surface-container-low/40 p-4 sm:p-8">
              <div className="mx-auto max-w-5xl rounded-2xl bg-background p-2 shadow-xl sm:p-4">
                <SectionDesignPreview type={previewType} variant={previewVariant} />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-on-surface-variant">
                You can change its layout, text, imagery, product source, and call-to-action after adding.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setPreviewType(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    onAdd(previewType);
                    setPreviewType(null);
                  }}
                >
                  <Plus className="size-4" />
                  Add component
                  <Check className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
