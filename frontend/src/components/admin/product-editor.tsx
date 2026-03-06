"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  createProduct,
  getAdminProductById,
  getNavbarSettings,
  updateProduct,
} from "@/actions/admin-actions";
import RichTextEditor from "@/components/common/RichTextEditor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductEditorMode = "create" | "edit";

type GalleryItem = {
  id: string;
  url: string;
};

type VariantForm = {
  title: string;
  sku: string;
  price: string;
  discountPrice: string;
  stock: string;
  sortOrder: string;
  isActive: boolean;
  attributes: string;
};

type ProductForm = {
  thumbnailUrl: string;
  imageGallery: GalleryItem[];
  title: string;
  slug: string;
  price: string;
  discountPrice: string;
  stock: string;
  richText: string;
  mainNavUrl: string;
  subNavUrl: string;
  hasVariants: boolean;
  variants: VariantForm[];
  isActive: boolean;
  isHotSells: boolean;
  isWeeklySell: boolean;
  isSummerSell: boolean;
  isWinterSell: boolean;
  isBestSell: boolean;
};

type NavSubItem = {
  title: string;
  url: string;
};

type NavMainItem = {
  title: string;
  url: string;
  subNav: NavSubItem[];
};

const createEmptyVariant = (): VariantForm => ({
  title: "",
  sku: "",
  price: "",
  discountPrice: "",
  stock: "0",
  sortOrder: "0",
  isActive: true,
  attributes: "",
});

const createEmptyForm = (): ProductForm => ({
  thumbnailUrl: "",
  imageGallery: [],
  title: "",
  slug: "",
  price: "",
  discountPrice: "",
  stock: "0",
  richText: "",
  mainNavUrl: "",
  subNavUrl: "",
  hasVariants: false,
  variants: [createEmptyVariant()],
  isActive: true,
  isHotSells: false,
  isWeeklySell: false,
  isSummerSell: false,
  isWinterSell: false,
  isBestSell: false,
});

const toStringValue = (value: unknown) =>
  typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

const toBool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const toNumberString = (value: unknown) =>
  typeof value === "number" ? String(value) : typeof value === "string" ? value : "";

const makeGalleryItem = (url: string, index: number): GalleryItem => ({
  id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
  url,
});

const parseNumber = (value: string, fieldName: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return parsed;
};

const parseOptionalNumber = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return parseNumber(trimmed, fieldName);
};

const parseIntValue = (value: string, fieldName: string, fallback = 0) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return parsed;
};

const slugifyText = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapProductForm = (raw: Record<string, unknown>): ProductForm => {
  const imageUrls = Array.isArray(raw.imageUrls)
    ? raw.imageUrls
        .map((item) => toStringValue(item).trim())
        .filter(Boolean)
    : [];

  const variantsRaw = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
    : [];

  return {
    thumbnailUrl: toStringValue(raw.thumbnailUrl),
    imageGallery: imageUrls.map((url, index) => makeGalleryItem(url, index)),
    title: toStringValue(raw.title),
    slug: toStringValue(raw.slug),
    price: toNumberString(raw.price),
    discountPrice:
      raw.discountPrice === null || raw.discountPrice === undefined
        ? ""
        : toNumberString(raw.discountPrice),
    stock:
      raw.stock === null || raw.stock === undefined ? "" : toNumberString(raw.stock),
    richText: toStringValue(raw.richText),
    mainNavUrl: toStringValue(raw.mainNavUrl),
    subNavUrl: toStringValue(raw.subNavUrl),
    hasVariants: toBool(raw.hasVariants, false),
    variants:
      variantsRaw.length > 0
        ? variantsRaw.map((variant) => {
            const attributesRaw = Array.isArray(variant.attributes)
              ? variant.attributes
              : variant.attributes && typeof variant.attributes === "object"
                ? Object.values(variant.attributes as Record<string, unknown>)
                : [];
            return {
              title: toStringValue(variant.title),
              sku: toStringValue(variant.sku),
              price: toNumberString(variant.price),
              discountPrice:
                variant.discountPrice === null || variant.discountPrice === undefined
                  ? ""
                  : toNumberString(variant.discountPrice),
              stock: toNumberString(variant.stock),
              sortOrder: toNumberString(variant.sortOrder),
              isActive: toBool(variant.isActive, true),
              attributes: attributesRaw
                .map((item) => toStringValue(item).trim())
                .filter(Boolean)
                .join(", "),
            };
          })
        : [createEmptyVariant()],
    isActive: toBool(raw.isActive, true),
    isHotSells: toBool(raw.isHotSells, false),
    isWeeklySell: toBool(raw.isWeeklySell, false),
    isSummerSell: toBool(raw.isSummerSell, false),
    isWinterSell: toBool(raw.isWinterSell, false),
    isBestSell: toBool(raw.isBestSell, false),
  };
};

function buildPayload(form: ProductForm) {
  const title = form.title.trim();
  const thumbnailUrl = form.thumbnailUrl.trim();
  const mainNavUrl = form.mainNavUrl.trim();
  const subNavUrl = form.subNavUrl.trim();
  const price = parseNumber(form.price, "Price");
  const discountPrice = parseOptionalNumber(form.discountPrice, "Discount price");

  if (!thumbnailUrl) throw new Error("Thumbnail URL is required");
  if (!title) throw new Error("Title is required");
  if (!mainNavUrl) throw new Error("Main navbar assignment is required");
  if (discountPrice !== null && discountPrice > price) {
    throw new Error("Discount price cannot be greater than price");
  }

  const imageUrls = form.imageGallery
    .map((item) => item.url.trim())
    .filter(Boolean);

  const payload: Record<string, unknown> = {
    thumbnailUrl,
    imageUrls,
    title,
    price,
    discountPrice,
    richText: form.richText || "<p></p>",
    mainNavUrl,
    subNavUrl: subNavUrl || undefined,
    hasVariants: form.hasVariants,
    isActive: form.isActive,
    isHotSells: form.isHotSells,
    isWeeklySell: form.isWeeklySell,
    isSummerSell: form.isSummerSell,
    isWinterSell: form.isWinterSell,
    isBestSell: form.isBestSell,
  };

  if (!form.hasVariants && form.stock.trim()) {
    payload.stock = parseIntValue(form.stock, "Stock");
  }

  const slug = form.slug.trim();
  if (slug) {
    payload.slug = slug;
  }

  if (form.hasVariants) {
    if (form.variants.length === 0) {
      throw new Error("At least one variant is required");
    }

    payload.variants = form.variants.map((variant, index) => {
      const variantTitle = variant.title.trim();
      if (!variantTitle) {
        throw new Error(`Variant #${index + 1} title is required`);
      }

      const variantPrice = parseNumber(variant.price, `Variant #${index + 1} price`);
      const variantDiscountPrice = parseOptionalNumber(
        variant.discountPrice,
        `Variant #${index + 1} discount price`,
      );

      if (
        variantDiscountPrice !== null &&
        variantDiscountPrice > variantPrice
      ) {
        throw new Error(
          `Variant #${index + 1} discount cannot be greater than price`,
        );
      }

      const attributes = variant.attributes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return {
        title: variantTitle,
        sku: variant.sku.trim() || undefined,
        price: variantPrice,
        discountPrice: variantDiscountPrice,
        stock: parseIntValue(variant.stock, `Variant #${index + 1} stock`),
        sortOrder: parseIntValue(
          variant.sortOrder,
          `Variant #${index + 1} sort order`,
        ),
        isActive: variant.isActive,
        attributes,
      };
    });
  }

  return payload;
}

export function ProductEditor({
  mode,
  productId,
}: {
  mode: ProductEditorMode;
  productId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(createEmptyForm());
  const [loading, setLoading] = useState(mode === "edit");
  const [loadingNav, setLoadingNav] = useState(true);
  const [navItems, setNavItems] = useState<NavMainItem[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    mode === "edit",
  );

  useEffect(() => {
    (async () => {
      setLoadingNav(true);
      try {
        const response = await getNavbarSettings();
        const items =
          response && Array.isArray(response.mainNav)
            ? response.mainNav.map((main) => ({
                title: toStringValue(main.title),
                url: toStringValue(main.url),
                subNav: Array.isArray(main.subNav)
                  ? main.subNav.map((sub) => ({
                      title: toStringValue(sub.title),
                      url: toStringValue(sub.url),
                    }))
                  : [],
              }))
            : [];
        setNavItems(items);
      } catch {
        toast.error("Failed to load navbar options");
      } finally {
        setLoadingNav(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const response = await getAdminProductById(productId);
        const product =
          response && typeof response.data === "object"
            ? (response.data as Record<string, unknown>)
            : null;
        if (!product) {
          throw new Error("Product not found");
        }
        const mapped = mapProductForm(product);
        setForm(mapped);
        const generatedSlug = slugifyText(mapped.title);
        setIsSlugManuallyEdited(
          Boolean(mapped.slug.trim()) && mapped.slug.trim() !== generatedSlug,
        );
      } catch {
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, productId, router]);

  useEffect(() => {
    if (form.mainNavUrl || navItems.length === 0) {
      return;
    }
    setForm((prev) => ({ ...prev, mainNavUrl: navItems[0].url }));
  }, [form.mainNavUrl, navItems]);

  const selectedMainNav = useMemo(
    () => navItems.find((item) => item.url === form.mainNavUrl) ?? null,
    [form.mainNavUrl, navItems],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (mode === "edit" && productId) {
        return updateProduct({ productId, ...payload });
      }
      return createProduct(payload);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        toast.error(error?.message || "Failed to save product");
        return;
      }
      toast.success(mode === "edit" ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to save product");
    },
  });

  const updateField = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (nextTitle: string) => {
    setForm((prev) => {
      const nextSlug = slugifyText(nextTitle);
      return {
        ...prev,
        title: nextTitle,
        slug: isSlugManuallyEdited ? prev.slug : nextSlug,
      };
    });
  };

  const handleSlugChange = (nextSlugInput: string) => {
    const normalized = slugifyText(nextSlugInput);
    if (!normalized) {
      setIsSlugManuallyEdited(false);
      setForm((prev) => ({
        ...prev,
        slug: slugifyText(prev.title),
      }));
      return;
    }

    setIsSlugManuallyEdited(true);
    updateField("slug", normalized);
  };

  const updateVariant = <K extends keyof VariantForm>(
    index: number,
    field: K,
    value: VariantForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const addGalleryByUrl = () => {
    const url = newGalleryUrl.trim();
    if (!url) {
      return;
    }

    if (form.imageGallery.some((item) => item.url === url)) {
      toast.error("Image already exists in gallery");
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageGallery: [...prev.imageGallery, makeGalleryItem(url, prev.imageGallery.length)],
    }));
    setNewGalleryUrl("");
  };

  const removeGalleryItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((item) => item.id !== id),
    }));
  };

  const uploadGalleryImage = async (file: File) => {
    setIsGalleryUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message || "Upload failed");
      }

      setForm((prev) => ({
        ...prev,
        imageGallery: [
          ...prev.imageGallery,
          makeGalleryItem(payload.url as string, prev.imageGallery.length),
        ],
      }));
      toast.success("Image added to gallery");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const onSubmit = () => {
    try {
      const payload = buildPayload(form);
      saveMutation.mutate(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid form data");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "edit" ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure product details, images, navbar placement, and variants.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to products
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">Basic Information</h2>
        <ImageUploadField
          id="product-thumbnail"
          label="Thumbnail URL"
          value={form.thumbnailUrl}
          onChange={(value) => updateField("thumbnailUrl", value)}
          hint="Recommended: 4:5 ratio (e.g. 1200x1500) for product cards and product detail cover."
          previewClassName="h-44 w-full object-cover rounded-md"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-title">Title</Label>
            <Input
              id="product-title"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-slug">Slug (auto-generated)</Label>
            <Input
              id="product-slug"
              value={form.slug}
              onChange={(event) => handleSlugChange(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {isSlugManuallyEdited
                ? "Custom slug mode"
                : "Slug updates automatically from title"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-discount">Discount Price</Label>
            <Input
              id="product-discount"
              type="number"
              min="0"
              step="0.01"
              value={form.discountPrice}
              onChange={(event) => updateField("discountPrice", event.target.value)}
            />
          </div>
          {!form.hasVariants ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set available units for this simple product. Variant products manage
                stock per variant below.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">Product Gallery (Array of image URLs)</h2>
        <p className="text-xs text-muted-foreground">
          Recommended: keep gallery images close to 4:5 ratio (for example
          `1200x1500`) so catalog cards and product galleries stay consistent.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="https://... add image URL"
            value={newGalleryUrl}
            onChange={(event) => setNewGalleryUrl(event.target.value)}
          />
          <Button type="button" variant="secondary" onClick={addGalleryByUrl}>
            <Plus className="mr-2 size-4" />
            Add URL
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadGalleryImage(file);
                }
                event.currentTarget.value = "";
              }}
              disabled={isGalleryUploading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isGalleryUploading}
              asChild
            >
              <span>
                {isGalleryUploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 size-4" />
                )}
                Upload Image
              </span>
            </Button>
          </label>
        </div>

        {form.imageGallery.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gallery images yet. Add URLs or upload images.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Drag and drop to rearrange image order.
            </p>
            <ReactSortable
              list={form.imageGallery}
              setList={(next) => updateField("imageGallery", next)}
              animation={180}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {form.imageGallery.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-border/70 bg-background"
                >
                  <div className="flex items-center justify-between border-b border-border/60 px-2 py-1.5">
                    <button
                      type="button"
                      className="cursor-grab text-muted-foreground active:cursor-grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="size-4" />
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeGalleryItem(item.id)}
                      className="size-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt="Product gallery item"
                    className="h-40 w-full object-cover"
                  />
                  <div className="px-2 py-1.5 text-[11px] text-muted-foreground break-all">
                    {item.url}
                  </div>
                </div>
              ))}
            </ReactSortable>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">Navbar Placement</h2>
        {loadingNav ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading navbar options...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="main-nav-select">Main navbar item</Label>
              <select
                id="main-nav-select"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={form.mainNavUrl}
                onChange={(event) => {
                  const nextMain = event.target.value;
                  const selectedMain = navItems.find((item) => item.url === nextMain);
                  const hasSub = selectedMain?.subNav.some(
                    (sub) => sub.url === form.subNavUrl,
                  );
                  setForm((prev) => ({
                    ...prev,
                    mainNavUrl: nextMain,
                    subNavUrl: hasSub ? prev.subNavUrl : "",
                  }));
                }}
              >
                <option value="">Select main navbar</option>
                {navItems.map((item) => (
                  <option key={item.url} value={item.url}>
                    {item.title} ({item.url})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-nav-select">Sub navbar item (optional)</Label>
              <select
                id="sub-nav-select"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={form.subNavUrl}
                onChange={(event) => updateField("subNavUrl", event.target.value)}
                disabled={!selectedMainNav || selectedMainNav.subNav.length === 0}
              >
                <option value="">None</option>
                {(selectedMainNav?.subNav ?? []).map((sub) => (
                  <option key={sub.url} value={sub.url}>
                    {sub.title} ({sub.url})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">Description</h2>
        <RichTextEditor
          description={form.richText}
          updateField={(field, value) => {
            if (field === "richText") {
              updateField("richText", value);
            }
          }}
          field="richText"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">Variants</h2>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.hasVariants}
            onCheckedChange={(checked) =>
              updateField("hasVariants", checked === true)
            }
          />
          This product has variants
        </label>

        {form.hasVariants ? (
          <div className="space-y-3">
            {form.variants.map((variant, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/60 bg-background p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Variant #{index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Variant title"
                    value={variant.title}
                    onChange={(event) =>
                      updateVariant(index, "title", event.target.value)
                    }
                  />
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(event) => updateVariant(index, "sku", event.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(index, "price", event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Discount price"
                    value={variant.discountPrice}
                    onChange={(event) =>
                      updateVariant(index, "discountPrice", event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Sort order"
                    value={variant.sortOrder}
                    onChange={(event) =>
                      updateVariant(index, "sortOrder", event.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attributes (size, color, etc)</Label>
                  <Textarea
                    className="min-h-16"
                    placeholder="e.g. XL, Black, Cotton"
                    value={variant.attributes}
                    onChange={(event) =>
                      updateVariant(index, "attributes", event.target.value)
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={variant.isActive}
                    onCheckedChange={(checked) =>
                      updateVariant(index, "isActive", checked === true)
                    }
                  />
                  Variant is active
                </label>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="mr-2 size-4" />
              Add Variant
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Variants are disabled for this product. Stock is controlled from the
            basic information section above.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Product Flags</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked === true)}
            />
            Product is active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isHotSells}
              onCheckedChange={(checked) =>
                updateField("isHotSells", checked === true)
              }
            />
            Hot sells
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isWeeklySell}
              onCheckedChange={(checked) =>
                updateField("isWeeklySell", checked === true)
              }
            />
            Weekly sell
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isSummerSell}
              onCheckedChange={(checked) =>
                updateField("isSummerSell", checked === true)
              }
            />
            Summer sell
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isWinterSell}
              onCheckedChange={(checked) =>
                updateField("isWinterSell", checked === true)
              }
            />
            Winter sell
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isBestSell}
              onCheckedChange={(checked) =>
                updateField("isBestSell", checked === true)
              }
            />
            Best sell
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
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
              {mode === "edit" ? "Update Product" : "Create Product"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
