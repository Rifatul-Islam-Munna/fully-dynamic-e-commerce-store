"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReactSortable } from "react-sortablejs";
import { sileo } from "sileo";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Route,
} from "lucide-react";
import {
  createNavbarSettings,
  getNavbarSettings,
  updateNavbarSettings,
} from "@/actions/admin-actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubNavItem = {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
};

type MainNavItem = {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  subNav: SubNavItem[];
};

type GeneratedSubNav = {
  title: string;
  url: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
};

type GeneratedMainNav = {
  title: string;
  url: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  subNav: GeneratedSubNav[];
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();

const createEmptySubItem = (): SubNavItem => ({
  id: makeId(),
  title: "",
  imageUrl: "",
  isActive: true,
});

const createEmptyMainItem = (): MainNavItem => ({
  id: makeId(),
  title: "",
  imageUrl: "",
  isActive: true,
  subNav: [],
});

function slugifySegment(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "item";
}

function makeUniqueSlug(baseSlug: string, used: Set<string>) {
  let candidate = baseSlug;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  used.add(candidate);
  return candidate;
}

function trimToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildGeneratedNavbar(items: MainNavItem[]): GeneratedMainNav[] {
  const usedMainSlugs = new Set<string>();

  return items.map((mainItem, mainIndex) => {
    const mainTitle = mainItem.title.trim() || `Item ${mainIndex + 1}`;
    const mainSlug = makeUniqueSlug(
      slugifySegment(mainTitle),
      usedMainSlugs,
    );
    const mainUrl = `/${mainSlug}`;

    const usedSubSlugs = new Set<string>();
    const subNav = mainItem.subNav.map((subItem, subIndex) => {
      const subTitle = subItem.title.trim() || `Sub Item ${subIndex + 1}`;
      const subSlug = makeUniqueSlug(slugifySegment(subTitle), usedSubSlugs);

      return {
        title: subTitle,
        url: `/${mainSlug}/${subSlug}`,
        imageUrl: trimToUndefined(subItem.imageUrl),
        sortOrder: subIndex + 1,
        isActive: subItem.isActive,
      };
    });

    return {
      title: mainTitle,
      url: mainUrl,
      imageUrl: trimToUndefined(mainItem.imageUrl),
      sortOrder: mainIndex + 1,
      isActive: mainItem.isActive,
      subNav,
    };
  });
}

export default function NavbarSettingsPage() {
  const [items, setItems] = useState<MainNavItem[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNavbarSettings();
        if (data?.mainNav) {
          const mappedMain = [...data.mainNav]
            .sort(
              (a, b) =>
                (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
                (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
            )
            .map((item) => ({
              id: makeId(),
              title: item.title || "",
              imageUrl: item.imageUrl || "",
              isActive: item.isActive ?? true,
              subNav: [...(item.subNav || [])]
                .sort(
                  (a, b) =>
                    (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
                    (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
                )
                .map((sub) => ({
                  id: makeId(),
                  title: sub.title || "",
                  imageUrl: sub.imageUrl || "",
                  isActive: sub.isActive ?? true,
                })),
            }));

          setItems(mappedMain);
          setCollapsedItems({});
          setExists(true);
        }
      } catch {
        // ignore initial load error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generatedNavbar = useMemo(() => buildGeneratedNavbar(items), [items]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { mainNav: generatedNavbar };
      if (exists) {
        return updateNavbarSettings(payload);
      }
      return createNavbarSettings({ key: "default", ...payload });
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to save navbar settings" });
        return;
      }
      sileo.success({ title: "Success", description: "Navbar settings saved" });
      setExists(true);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to save navbar settings" }),
  });

  const updateMainItem = <K extends keyof MainNavItem>(
    index: number,
    field: K,
    value: MainNavItem[K],
  ) => {
    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateSubItem = <K extends keyof SubNavItem>(
    mainIndex: number,
    subIndex: number,
    field: K,
    value: SubNavItem[K],
  ) => {
    setItems((prev) =>
      prev.map((item, currentMainIndex) =>
        currentMainIndex === mainIndex
          ? {
              ...item,
              subNav: item.subNav.map((subItem, currentSubIndex) =>
                currentSubIndex === subIndex
                  ? { ...subItem, [field]: value }
                  : subItem,
              ),
            }
          : item,
      ),
    );
  };

  const setSubNavList = (mainIndex: number, nextSubNav: SubNavItem[]) => {
    setItems((prev) =>
      prev.map((item, currentMainIndex) =>
        currentMainIndex === mainIndex ? { ...item, subNav: nextSubNav } : item,
      ),
    );
  };

  const addMainItem = () => {
    const nextItem = createEmptyMainItem();
    setItems((prev) => [...prev, nextItem]);
    setCollapsedItems((prev) => ({ ...prev, [nextItem.id]: false }));
  };

  const removeMainItem = (index: number) => {
    setItems((prev) => {
      const removedItem = prev[index];
      if (removedItem) {
        setCollapsedItems((current) => {
          const next = { ...current };
          delete next[removedItem.id];
          return next;
        });
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const addSubItem = (mainIndex: number) => {
    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === mainIndex
          ? { ...item, subNav: [...item.subNav, createEmptySubItem()] }
          : item,
      ),
    );
  };

  const removeSubItem = (mainIndex: number, subIndex: number) => {
    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === mainIndex
          ? {
              ...item,
              subNav: item.subNav.filter(
                (_, currentSubIndex) => currentSubIndex !== subIndex,
              ),
            }
          : item,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const collapseAllItems = () => {
    setCollapsedItems(
      Object.fromEntries(items.map((item) => [item.id, true])),
    );
  };

  const expandAllItems = () => {
    setCollapsedItems(
      Object.fromEntries(items.map((item) => [item.id, false])),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navbar Settings</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder main/sub nav items. URLs are generated automatically
            from titles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={addMainItem} variant="outline" size="sm">
            <Plus className="mr-1 size-4" />
            Add Main Nav
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAllItems}
            disabled={items.length === 0}
          >
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAllItems}
            disabled={items.length === 0}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No navbar items yet. Click &quot;Add Main Nav&quot; to start.
          </p>
        </div>
      ) : (
        <ReactSortable
          list={items}
          setList={setItems}
          animation={160}
          handle=".main-handle"
          className="space-y-4"
        >
          {items.map((item, itemIndex) => {
            const generatedItem = generatedNavbar[itemIndex];
            const isCollapsed = collapsedItems[item.id] ?? false;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="main-handle cursor-grab text-muted-foreground active:cursor-grabbing"
                    aria-label="Drag main nav item"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Main Nav #{itemIndex + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCollapsedItems((prev) => ({
                        ...prev,
                        [item.id]: !isCollapsed,
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
                  <div className="ml-auto flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={item.isActive}
                        onCheckedChange={(checked) =>
                          updateMainItem(itemIndex, "isActive", checked === true)
                        }
                      />
                      Active
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMainItem(itemIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {!isCollapsed ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            updateMainItem(itemIndex, "title", e.target.value)
                          }
                          placeholder="e.g. Men Collection"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">URL (Auto)</Label>
                        <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/25 px-3 text-sm text-muted-foreground">
                          <Route className="size-3.5" />
                          <span>{generatedItem?.url || "/"}</span>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <ImageUploadField
                          id={`main-nav-image-${item.id}`}
                          label="Main Nav Image URL"
                          value={item.imageUrl}
                          onChange={(value) =>
                            updateMainItem(itemIndex, "imageUrl", value)
                          }
                          hint="Recommended: 3:2 ratio (e.g. 1200x800) for main navbar promo imagery."
                          previewClassName="h-28 w-full object-cover rounded-md"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Sub Nav</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSubItem(itemIndex)}
                        >
                          <Plus className="mr-1 size-3" />
                          Add Sub Nav
                        </Button>
                      </div>

                      {item.subNav.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No sub nav items yet.
                        </p>
                      ) : (
                        <ReactSortable
                          list={item.subNav}
                          setList={(nextSubNav) =>
                            setSubNavList(itemIndex, nextSubNav)
                          }
                          animation={140}
                          handle=".sub-handle"
                          className="space-y-3"
                        >
                          {item.subNav.map((subItem, subIndex) => {
                            const generatedSub = generatedItem?.subNav[subIndex];

                            return (
                              <div
                                key={subItem.id}
                                className="rounded-md border border-border bg-card p-3 space-y-3"
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="sub-handle cursor-grab text-muted-foreground active:cursor-grabbing"
                                    aria-label="Drag sub nav item"
                                  >
                                    <GripVertical className="size-4" />
                                  </button>
                                  <span className="text-xs text-muted-foreground">
                                    Sub Nav #{subIndex + 1}
                                  </span>
                                  <div className="ml-auto flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Checkbox
                                        checked={subItem.isActive}
                                        onCheckedChange={(checked) =>
                                          updateSubItem(
                                            itemIndex,
                                            subIndex,
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
                                        removeSubItem(itemIndex, subIndex)
                                      }
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Title</Label>
                                    <Input
                                      value={subItem.title}
                                      onChange={(e) =>
                                        updateSubItem(
                                          itemIndex,
                                          subIndex,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Winter Jackets"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">URL (Auto)</Label>
                                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/25 px-3 text-sm text-muted-foreground">
                                      <Route className="size-3.5" />
                                      <span>{generatedSub?.url || "/"}</span>
                                    </div>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <ImageUploadField
                                      id={`sub-nav-image-${item.id}-${subItem.id}`}
                                      label="Sub Nav Image URL"
                                      value={subItem.imageUrl}
                                      onChange={(value) =>
                                        updateSubItem(
                                          itemIndex,
                                          subIndex,
                                          "imageUrl",
                                          value,
                                        )
                                      }
                                      hint="Recommended: 4:3 ratio (e.g. 1200x900) for submenu cards and previews."
                                      previewClassName="h-24 w-full object-cover rounded-md"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </ReactSortable>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </ReactSortable>
      )}

      {items.length > 0 ? (
        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Navbar
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}




