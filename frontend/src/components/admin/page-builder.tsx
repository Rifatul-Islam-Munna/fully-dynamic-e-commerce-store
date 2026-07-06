"use client";

import { ReactSortable } from "react-sortablejs";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Layers3,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { HomeSectionCard } from "@/components/admin/home-section-card";
import { PageBuilderHeader } from "@/components/admin/page-builder-header";
import { PageBuilderTarget } from "@/components/admin/page-builder-target";
import { PagePaletteGrid } from "@/components/admin/page-palette-grid";
import { useHomeSettingsEditor } from "@/components/admin/use-home-settings-editor";
import { Button } from "@/components/ui/button";

export function PageBuilder() {
  const editor = useHomeSettingsEditor();

  if (editor.loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-7 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">Loading page builder</p>
            <p className="text-xs text-on-surface-variant">
              Preparing your sections, themes, and navigation targets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allCollapsed =
    editor.form.sections.length > 0
    && editor.form.sections.every((section) => editor.collapsed[section.id]);

  const setAllCollapsed = (collapsed: boolean) => {
    editor.setCollapsed(
      Object.fromEntries(
        editor.form.sections.map((section) => [section.id, collapsed]),
      ),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-28">
      <PageBuilderHeader onAdd={editor.addSection} />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-5">
          <PageBuilderTarget
            nav={editor.navItems}
            subNav={editor.subNavItems}
            main={editor.targetMainNav}
            sub={editor.targetSubNav}
            setMain={(value) => {
              editor.setTargetMainNav(value);
              editor.setTargetSubNav("");
            }}
            setSub={editor.setTargetSubNav}
          />

          <PagePaletteGrid
            selected={editor.form.theme}
            choose={(theme) => editor.setForm((current) => ({ ...current, theme }))}
          />

          <section className="overflow-hidden rounded-2xl border bg-surface-container-lowest">
            <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Layers3 className="size-4 text-primary" />
                  <h2 className="text-base font-semibold">Page sections</h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {editor.form.sections.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Drag sections to change their storefront order. Open a section to edit content and preview every design option.
                </p>
              </div>

              {editor.form.sections.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllCollapsed(!allCollapsed)}
                >
                  {allCollapsed ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronUp className="size-4" />
                  )}
                  {allCollapsed ? "Expand all" : "Collapse all"}
                </Button>
              ) : null}
            </div>

            {editor.loadingTarget ? (
              <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-on-surface-variant">
                <Loader2 className="size-4 animate-spin" />
                Loading this page layout...
              </div>
            ) : editor.form.sections.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
                  <Sparkles className="size-7" />
                </div>
                <h3 className="text-base font-semibold">Create a modern storefront page</h3>
                <p className="mt-1 max-w-md text-sm text-on-surface-variant">
                  Add a hero, product collection, promotional banner, or custom content section. Each section includes selectable visual previews.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button type="button" onClick={() => editor.addSection("hero_slider")}>
                    Add hero slider
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editor.addSection("product_collection")}
                  >
                    Add products
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editor.addSection("custom_banner")}
                  >
                    Add custom banner
                  </Button>
                </div>
              </div>
            ) : (
              <ReactSortable
                list={editor.form.sections}
                setList={(sections) =>
                  editor.setForm((current) => ({ ...current, sections }))
                }
                handle=".section-drag-handle"
                animation={180}
                ghostClass="opacity-40"
                className="space-y-3 p-3 sm:p-4"
              >
                {editor.form.sections.map((section, index) => (
                  <HomeSectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    collapsed={Boolean(editor.collapsed[section.id])}
                    toggle={() =>
                      editor.setCollapsed((current) => ({
                        ...current,
                        [section.id]: !current[section.id],
                      }))
                    }
                    change={(field, value) =>
                      editor.updateSection(index, field, value)
                    }
                    remove={() =>
                      editor.setForm((current) => ({
                        ...current,
                        sections: current.sections.filter((item) => item.id !== section.id),
                      }))
                    }
                    addSlide={() =>
                      editor.updateSection(index, "slides", [
                        ...section.slides,
                        editor.createEmptySlide(),
                      ])
                    }
                    removeSlide={(slideIndex) =>
                      editor.updateSection(
                        index,
                        "slides",
                        section.slides.filter((_, itemIndex) => itemIndex !== slideIndex),
                      )
                    }
                    changeSlide={(slideIndex, field, value) =>
                      editor.updateSlide(index, slideIndex, field, value)
                    }
                  />
                ))}
              </ReactSortable>
            )}
          </section>
        </main>

        <aside className="space-y-4 2xl:sticky 2xl:top-5 2xl:self-start">
          <section className="rounded-2xl border bg-surface-container-lowest p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Eye className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Visual design workflow</h2>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  Theme palettes show their real colors. Every section design shows a miniature example before selection, so merchants always know what they are applying.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-container-low p-3">
                <strong className="block text-lg">{editor.form.sections.length}</strong>
                <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">Sections</span>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <strong className="block text-lg">
                  {editor.form.sections.filter((section) => section.isActive).length}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">Active</span>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <strong className="block truncate text-sm leading-7">
                  {editor.form.theme || "Default"}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">Theme</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-surface-container-lowest p-5">
            <h2 className="text-sm font-semibold">Publishing checklist</h2>
            <div className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <p>• Confirm the correct page target.</p>
              <p>• Choose a readable palette.</p>
              <p>• Preview the design card for every section.</p>
              <p>• Keep the most important content near the top.</p>
              <p>• Disable unfinished sections before saving.</p>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/92 px-4 py-3 backdrop-blur-xl md:left-[var(--sidebar-width,0px)]">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Editing {editor.targetSubNav || editor.targetMainNav || "Homepage"}
            </p>
            <p className="hidden text-xs text-on-surface-variant sm:block">
              Save to publish this layout, section order, selected designs, and theme.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => editor.saveMutation.mutate()}
            disabled={editor.saveMutation.isPending || editor.loadingTarget}
            className="min-w-32"
          >
            {editor.saveMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {editor.saveMutation.isPending ? "Saving..." : "Save page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
