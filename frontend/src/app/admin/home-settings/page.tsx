"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  createHomeSettings,
  getHomeSettings,
  getNavbarSettings,
  type HomeSection,
  type HomeSectionType,
  type ProductFlag,
  updateHomeSettings,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDefaultHomeSectionVariant,
  getHomeSectionVariantMeta,
  getHomeSectionVariantOptions,
} from "@/lib/home-section-variants";
import { Textarea } from "@/components/ui/textarea";

type NavSubItem = {
  title: string;
  url: string;
};

type NavMainItem = {
  title: string;
  url: string;
  subNav: NavSubItem[];
};

type SlideForm = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonLabel: string;
  isActive: boolean;
};

type SectionForm = {
  id: string;
  type: HomeSectionType;
  variant: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  backgroundImageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  productFlag: ProductFlag;
  productLimit: string;
  theme: string;
  isActive: boolean;
  slides: SlideForm[];
};

type HomeSettingsForm = {
  theme: string;
  sections: SectionForm[];
};

const EMPTY_FORM: HomeSettingsForm = {
  theme: "",
  sections: [],
};

const PRODUCT_FLAGS: Array<{ value: ProductFlag; label: string }> = [
  { value: "isHotSells", label: "Hot Sells" },
  { value: "isWeeklySell", label: "Weekly Sell" },
  { value: "isSummerSell", label: "Summer Sell" },
  { value: "isWinterSell", label: "Winter Sell" },
  { value: "isBestSell", label: "Best Sell" },
];

const SECTION_TYPES: Array<{ value: HomeSectionType; label: string }> = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "product_collection", label: "Product Collection" },
  { value: "discount_banner", label: "Discount Banner" },
  { value: "custom_banner", label: "Custom Banner" },
];

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

const createEmptySlide = (): SlideForm => ({
  id: makeId(),
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  buttonLabel: "",
  isActive: true,
});

const createEmptySection = (type: HomeSectionType): SectionForm => ({
  id: makeId(),
  type,
  variant: getDefaultHomeSectionVariant(type),
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  backgroundImageUrl: "",
  buttonLabel: "",
  buttonUrl: "",
  productFlag: "isHotSells",
  productLimit: "8",
  theme: "",
  isActive: true,
  slides: type === "hero_slider" ? [createEmptySlide()] : [],
});

function mapSection(section: HomeSection): SectionForm {
  return {
    id: section.id || makeId(),
    type: section.type,
    variant: section.variant || getDefaultHomeSectionVariant(section.type),
    title: section.title || "",
    subtitle: section.subtitle || "",
    description: section.description || "",
    imageUrl: section.imageUrl || "",
    backgroundImageUrl: section.backgroundImageUrl || "",
    buttonLabel: section.buttonLabel || "",
    buttonUrl: section.buttonUrl || "",
    productFlag: section.productFlag || "isHotSells",
    productLimit: String(section.productLimit ?? 8),
    theme: section.theme || "",
    isActive: section.isActive ?? true,
    slides: Array.isArray(section.slides)
      ? section.slides
          .map((slide) => ({
            id: makeId(),
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            imageUrl: slide.imageUrl || "",
            linkUrl: slide.linkUrl || "",
            buttonLabel: slide.buttonLabel || "",
            isActive: slide.isActive ?? true,
          }))
          .filter((slide) => Boolean(slide.imageUrl))
      : [],
  };
}

function normalizeSectionPayload(section: SectionForm, sortOrder: number) {
  const base: Record<string, unknown> = {
    id: section.id,
    type: section.type,
    variant: section.variant.trim() || getDefaultHomeSectionVariant(section.type),
    title: section.title.trim() || undefined,
    subtitle: section.subtitle.trim() || undefined,
    description: section.description.trim() || undefined,
    imageUrl: section.imageUrl.trim() || undefined,
    backgroundImageUrl: section.backgroundImageUrl.trim() || undefined,
    buttonLabel: section.buttonLabel.trim() || undefined,
    buttonUrl: section.buttonUrl.trim() || undefined,
    theme: section.theme.trim() || undefined,
    sortOrder,
    isActive: section.isActive,
  };

  if (section.type === "product_collection") {
    base.productFlag = section.productFlag;
    const parsedLimit = Number(section.productLimit);
    base.productLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 24)
        : 8;
  }

  if (section.type === "hero_slider") {
    base.slides = section.slides
      .filter((slide) => slide.imageUrl.trim())
      .map((slide, slideIndex) => ({
        title: slide.title.trim() || undefined,
        subtitle: slide.subtitle.trim() || undefined,
        imageUrl: slide.imageUrl.trim(),
        linkUrl: slide.linkUrl.trim() || undefined,
        buttonLabel: slide.buttonLabel.trim() || undefined,
        sortOrder: slideIndex + 1,
        isActive: slide.isActive,
      }));
  }

  return base;
}

export default function HomeSettingsPage() {
  const [form, setForm] = useState<HomeSettingsForm>(EMPTY_FORM);
  const [navItems, setNavItems] = useState<NavMainItem[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [targetMainNav, setTargetMainNav] = useState("");
  const [targetSubNav, setTargetSubNav] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [exists, setExists] = useState(false);
  const hasHydratedTarget = useRef(false);

  const loadTargetSettings = useCallback(
    async (mainNavUrl: string, subNavUrl: string) => {
      setLoadingTarget(true);
      try {
        const home = await getHomeSettings({
          mainNavUrl: mainNavUrl || undefined,
          subNavUrl: subNavUrl || undefined,
        });

        if (home) {
          const normalizedTargetMain = mainNavUrl.trim();
          const normalizedTargetSub = subNavUrl.trim();
          const normalizedHomeMain = home.mainNavUrl?.trim() || "";
          const normalizedHomeSub = home.subNavUrl?.trim() || "";
          const hasExactTargetMatch =
            normalizedTargetMain === normalizedHomeMain &&
            normalizedTargetSub === normalizedHomeSub;

          setForm({
            theme: home.theme || "",
            sections: (home.sections || []).map(mapSection),
          });
          setCollapsedSections({});
          setExists(hasExactTargetMatch);
        } else {
          setForm({ theme: "", sections: [] });
          setCollapsedSections({});
          setExists(false);
        }
      } catch {
        setForm({ theme: "", sections: [] });
        setCollapsedSections({});
        setExists(false);
      } finally {
        setLoadingTarget(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const navbar = await getNavbarSettings();

        if (navbar && Array.isArray(navbar.mainNav)) {
          setNavItems(
            navbar.mainNav.map((item) => ({
              title: item.title || "",
              url: item.url || "",
              subNav: (item.subNav || []).map((sub) => ({
                title: sub.title || "",
                url: sub.url || "",
              })),
            })),
          );
        }
      } catch {
        // Ignore initial fetch error
      } finally {
        setLoading(false);
      }
    })();
    void loadTargetSettings("", "");
  }, [loadTargetSettings]);

  useEffect(() => {
    if (!hasHydratedTarget.current) {
      hasHydratedTarget.current = true;
      return;
    }
    void loadTargetSettings(targetMainNav, targetSubNav);
  }, [loadTargetSettings, targetMainNav, targetSubNav]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        theme: form.theme.trim() || undefined,
        sections: form.sections.map((section, index) =>
          normalizeSectionPayload(section, index + 1),
        ),
        mainNavUrl: targetMainNav || undefined,
        subNavUrl: targetSubNav || undefined,
      };

      if (exists) {
        const updateResult = (await updateHomeSettings(payload, {
          mainNavUrl: targetMainNav || undefined,
          subNavUrl: targetSubNav || undefined,
        })) as [unknown, { message?: string } | null];

        const [updatedData, updateError] = updateResult;
        if (
          !updatedData &&
          updateError?.message?.toLowerCase().includes("not found")
        ) {
          return createHomeSettings(payload);
        }

        return updateResult;
      }
      return createHomeSettings(payload);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        toast.error(error?.message || "Failed to save homepage settings");
        return;
      }
      toast.success("Homepage settings saved");
      setExists(true);
    },
    onError: () => toast.error("Failed to save homepage settings"),
  });

  const updateSection = <K extends keyof SectionForm>(
    sectionIndex: number,
    field: K,
    value: SectionForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const updateSlide = <K extends keyof SlideForm>(
    sectionIndex: number,
    slideIndex: number,
    field: K,
    value: SlideForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              slides: section.slides.map((slide, innerIndex) =>
                innerIndex === slideIndex ? { ...slide, [field]: value } : slide,
              ),
            }
          : section,
      ),
    }));
  };

  const addSection = (type: HomeSectionType) => {
    const nextSection = createEmptySection(type);
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, nextSection],
    }));
    setCollapsedSections((prev) => ({ ...prev, [nextSection.id]: false }));
  };

  const removeSection = (sectionId: string) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
    setCollapsedSections((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  const addSlide = (sectionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, slides: [...section.slides, createEmptySlide()] }
          : section,
      ),
    }));
  };

  const removeSlide = (sectionIndex: number, slideIndex: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              slides: section.slides.filter((_, inner) => inner !== slideIndex),
            }
          : section,
      ),
    }));
  };

  const topActions = useMemo(
    () =>
      SECTION_TYPES.map((type) => (
        <Button
          key={type.value}
          variant="outline"
          size="sm"
          onClick={() => addSection(type.value)}
        >
          <Plus className="mr-1 size-3.5" />
          {type.label}
        </Button>
      )),
    [],
  );
  const selectedTargetMain = useMemo(
    () => navItems.find((item) => item.url === targetMainNav) || null,
    [navItems, targetMainNav],
  );

  const collapseAllSections = () => {
    setCollapsedSections(
      Object.fromEntries(form.sections.map((section) => [section.id, true])),
    );
  };

  const expandAllSections = () => {
    setCollapsedSections(
      Object.fromEntries(form.sections.map((section) => [section.id, false])),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home Settings</h1>
          <p className="text-sm text-muted-foreground">
            Build dynamic page sections with custom order and rich hero slider
            content.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {topActions}
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAllSections}
            disabled={form.sections.length === 0}
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAllSections}
            disabled={form.sections.length === 0}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-base font-semibold">Page Target</h2>
        <p className="text-xs text-muted-foreground">
          Select which page layout you are editing. You can create separate
          design for homepage, main-nav page, or sub-nav page.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Main Nav Page</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={targetMainNav}
              onChange={(e) => {
                const nextMain = e.target.value;
                const nextMainItem =
                  navItems.find((item) => item.url === nextMain) || null;
                const hasCurrentSub =
                  nextMainItem?.subNav.some((sub) => sub.url === targetSubNav) ||
                  false;
                setTargetMainNav(nextMain);
                if (!hasCurrentSub) {
                  setTargetSubNav("");
                }
              }}
            >
              <option value="">Homepage (root)</option>
              {navItems.map((item) => (
                <option key={item.url} value={item.url}>
                  {item.title || item.url}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sub Nav Page</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={targetSubNav}
              onChange={(e) => setTargetSubNav(e.target.value)}
              disabled={!selectedTargetMain || selectedTargetMain.subNav.length === 0}
            >
              <option value="">None</option>
              {(selectedTargetMain?.subNav || []).map((sub) => (
                <option key={sub.url} value={sub.url}>
                  {sub.title || sub.url}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
          Editing target:{" "}
          <span className="font-medium text-foreground">
            {targetMainNav || "/"}
            {targetSubNav ? `  ->  ${targetSubNav}` : ""}
          </span>
          {loadingTarget ? (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Loading target config...
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4 text-primary" />
          Global Theme
        </h2>
        <Input
          placeholder="Optional global homepage theme token"
          value={form.theme}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, theme: e.target.value }))
          }
        />
      </div>

      {form.sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No sections yet. Add hero, product, discount, or custom sections.
          </p>
        </div>
      ) : (
        <ReactSortable
          list={form.sections}
          setList={(next) =>
            setForm((prev) => ({
              ...prev,
              sections: next,
            }))
          }
          animation={160}
          handle=".section-handle"
          className="space-y-4"
        >
          {form.sections.map((section, sectionIndex) => {
            const sectionTypeLabel =
              SECTION_TYPES.find((item) => item.value === section.type)?.label ||
              section.type;
            const isCollapsed = collapsedSections[section.id] ?? false;
            const variantOptions = getHomeSectionVariantOptions(section.type);
            const variantMeta = getHomeSectionVariantMeta(
              section.type,
              section.variant,
            );

            return (
              <div
                key={section.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="section-handle cursor-grab text-muted-foreground active:cursor-grabbing"
                    aria-label="Drag section"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {sectionTypeLabel}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCollapsedSections((prev) => ({
                        ...prev,
                        [section.id]: !isCollapsed,
                      }))
                    }
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronRight className="mr-1 size-4" />
                        Expand
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 size-4" />
                        Collapse
                      </>
                    )}
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={section.isActive}
                        onCheckedChange={(checked) =>
                          updateSection(sectionIndex, "isActive", checked === true)
                        }
                      />
                      Active
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {!isCollapsed ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
                        <div className="space-y-1">
                          <Label className="text-xs">Section Variant</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={section.variant}
                            onChange={(e) =>
                              updateSection(sectionIndex, "variant", e.target.value)
                            }
                          >
                            {variantOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-md bg-background px-3 py-2">
                          <p className="text-xs font-semibold text-foreground">
                            {variantMeta.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {variantMeta.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {section.type !== "hero_slider" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={section.title}
                            onChange={(e) =>
                              updateSection(sectionIndex, "title", e.target.value)
                            }
                            placeholder="Section title"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Subtitle</Label>
                          <Input
                            value={section.subtitle}
                            onChange={(e) =>
                              updateSection(sectionIndex, "subtitle", e.target.value)
                            }
                            placeholder="Section subtitle"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={section.description}
                            onChange={(e) =>
                              updateSection(sectionIndex, "description", e.target.value)
                            }
                            placeholder="Optional section description"
                            className="min-h-20"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Button Label</Label>
                          <Input
                            value={section.buttonLabel}
                            onChange={(e) =>
                              updateSection(sectionIndex, "buttonLabel", e.target.value)
                            }
                            placeholder="e.g. Shop Now"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Button URL</Label>
                          <Input
                            value={section.buttonUrl}
                            onChange={(e) =>
                              updateSection(sectionIndex, "buttonUrl", e.target.value)
                            }
                            placeholder="/discount"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Section Theme</Label>
                          <Input
                            value={section.theme}
                            onChange={(e) =>
                              updateSection(sectionIndex, "theme", e.target.value)
                            }
                            placeholder="Optional section-level theme token"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                          Hero slider supports title/subtitle/button/link. Only image
                          is required.
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Section Theme</Label>
                          <Input
                            value={section.theme}
                            onChange={(e) =>
                              updateSection(sectionIndex, "theme", e.target.value)
                            }
                            placeholder="Optional section-level theme token"
                          />
                        </div>
                      </div>
                    )}

                    {section.type === "product_collection" && (
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
                        <h3 className="text-sm font-semibold">Product Query</h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Product Flag</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              value={section.productFlag}
                              onChange={(e) =>
                                updateSection(
                                  sectionIndex,
                                  "productFlag",
                                  e.target.value as ProductFlag,
                                )
                              }
                            >
                              {PRODUCT_FLAGS.map((flag) => (
                                <option key={flag.value} value={flag.value}>
                                  {flag.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Product Limit</Label>
                            <Input
                              type="number"
                              min="1"
                              max="24"
                              value={section.productLimit}
                              onChange={(e) =>
                                updateSection(
                                  sectionIndex,
                                  "productLimit",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(section.type === "discount_banner" ||
                      section.type === "custom_banner") && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ImageUploadField
                          id={`section-image-${section.id}`}
                          label="Foreground Image URL"
                          value={section.imageUrl}
                          onChange={(value) =>
                            updateSection(sectionIndex, "imageUrl", value)
                          }
                          hint={
                            section.type === "discount_banner"
                              ? "Recommended: 4:5 ratio (e.g. 1200x1500) for promo product foreground."
                              : "Recommended: 4:3 ratio (e.g. 1600x1200) for custom section visual."
                          }
                          previewClassName="h-36 w-full object-cover rounded-md"
                        />
                        <ImageUploadField
                          id={`section-bg-image-${section.id}`}
                          label="Background Image URL"
                          value={section.backgroundImageUrl}
                          onChange={(value) =>
                            updateSection(sectionIndex, "backgroundImageUrl", value)
                          }
                          hint={
                            section.type === "discount_banner"
                              ? "Recommended: 16:7 ratio (e.g. 1920x840) for wide discount background."
                              : "Recommended: 16:9 ratio (e.g. 1920x1080) for custom section background."
                          }
                          previewClassName="h-36 w-full object-cover rounded-md"
                        />
                      </div>
                    )}

                    {section.type === "hero_slider" && (
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">Hero Slides</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSlide(sectionIndex)}
                          >
                            <Plus className="mr-1 size-3" />
                            Add Slide
                          </Button>
                        </div>

                        {section.slides.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Add at least one slide image.
                          </p>
                        ) : (
                          <ReactSortable
                            list={section.slides}
                            setList={(next) =>
                              updateSection(sectionIndex, "slides", next)
                            }
                            animation={140}
                            className="space-y-3"
                            handle=".slide-handle"
                          >
                            {section.slides.map((slide, slideIndex) => (
                              <div
                                key={slide.id}
                                className="rounded-md border border-border bg-card p-3 space-y-3"
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="slide-handle cursor-grab text-muted-foreground active:cursor-grabbing"
                                    aria-label="Drag slide"
                                  >
                                    <GripVertical className="size-4" />
                                  </button>
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Slide #{slideIndex + 1}
                                  </span>
                                  <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                                    <Checkbox
                                      checked={slide.isActive}
                                      onCheckedChange={(checked) =>
                                        updateSlide(
                                          sectionIndex,
                                          slideIndex,
                                          "isActive",
                                          checked === true,
                                        )
                                      }
                                    />
                                    Active
                                  </label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeSlide(sectionIndex, slideIndex)
                                    }
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <Input
                                    placeholder="Slide title (optional)"
                                    value={slide.title}
                                    onChange={(e) =>
                                      updateSlide(
                                        sectionIndex,
                                        slideIndex,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Slide subtitle (optional)"
                                    value={slide.subtitle}
                                    onChange={(e) =>
                                      updateSlide(
                                        sectionIndex,
                                        slideIndex,
                                        "subtitle",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Slide link URL (optional)"
                                    value={slide.linkUrl}
                                    onChange={(e) =>
                                      updateSlide(
                                        sectionIndex,
                                        slideIndex,
                                        "linkUrl",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Slide button label (optional)"
                                    value={slide.buttonLabel}
                                    onChange={(e) =>
                                      updateSlide(
                                        sectionIndex,
                                        slideIndex,
                                        "buttonLabel",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <ImageUploadField
                                  id={`slide-image-${section.id}-${slide.id}`}
                                  label="Slide Image URL"
                                  value={slide.imageUrl}
                                  onChange={(value) =>
                                    updateSlide(
                                      sectionIndex,
                                      slideIndex,
                                      "imageUrl",
                                      value,
                                    )
                                  }
                                  hint="Recommended: 16:9 ratio (e.g. 1920x1080) for hero slides."
                                  previewClassName="h-44 w-full rounded-md bg-muted/30 object-contain"
                                />
                              </div>
                            ))}
                          </ReactSortable>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </ReactSortable>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || loadingTarget}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Home Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
