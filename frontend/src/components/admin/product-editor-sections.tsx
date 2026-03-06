"use client";

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
import RichTextEditor from "@/components/common/RichTextEditor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  GalleryItem,
  NavMainItem,
  ProductEditorMode,
  ProductForm,
  VariantForm,
} from "@/components/admin/product-editor.types";

type UpdateField = <K extends keyof ProductForm>(
  field: K,
  value: ProductForm[K],
) => void;

type UpdateVariantField = <K extends keyof VariantForm>(
  index: number,
  field: K,
  value: VariantForm[K],
) => void;

export function ProductEditorLoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ProductEditorHeader({
  mode,
  onBack,
}: {
  mode: ProductEditorMode;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "edit" ? "Edit Product" : "Add Product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure product details, images, navbar placement, and variants.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" />
        Back to products
      </Button>
    </div>
  );
}

export function ProductBasicInformationSection({
  form,
  isSlugManuallyEdited,
  onUpdateField,
  onTitleChange,
  onSlugChange,
}: {
  form: ProductForm;
  isSlugManuallyEdited: boolean;
  onUpdateField: UpdateField;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">Basic Information</h2>
      <ImageUploadField
        id="product-thumbnail"
        label="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={(value) => onUpdateField("thumbnailUrl", value)}
        hint="Recommended: 4:5 ratio (e.g. 1200x1500) for product cards and product detail cover."
        previewClassName="h-44 w-full rounded-md object-cover"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-title">Title</Label>
          <Input
            id="product-title"
            value={form.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-slug">Slug (auto-generated)</Label>
          <Input
            id="product-slug"
            value={form.slug}
            onChange={(event) => onSlugChange(event.target.value)}
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
            onChange={(event) => onUpdateField("price", event.target.value)}
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
            onChange={(event) =>
              onUpdateField("discountPrice", event.target.value)
            }
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
              onChange={(event) => onUpdateField("stock", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set available units for this simple product. Variant products
              manage stock per variant below.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProductGallerySection({
  imageGallery,
  newGalleryUrl,
  isGalleryUploading,
  onNewGalleryUrlChange,
  onAddGalleryByUrl,
  onUploadGalleryImage,
  onRemoveGalleryItem,
  onReorderGallery,
}: {
  imageGallery: GalleryItem[];
  newGalleryUrl: string;
  isGalleryUploading: boolean;
  onNewGalleryUrlChange: (value: string) => void;
  onAddGalleryByUrl: () => void;
  onUploadGalleryImage: (file: File) => Promise<void>;
  onRemoveGalleryItem: (id: string) => void;
  onReorderGallery: (items: GalleryItem[]) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">
        Product Gallery (Array of image URLs)
      </h2>
      <p className="text-xs text-muted-foreground">
        Recommended: keep gallery images close to 4:5 ratio (for example
        `1200x1500`) so catalog cards and product galleries stay consistent.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="https://... add image URL"
          value={newGalleryUrl}
          onChange={(event) => onNewGalleryUrlChange(event.target.value)}
        />
        <Button type="button" variant="secondary" onClick={onAddGalleryByUrl}>
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
                void onUploadGalleryImage(file);
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

      {imageGallery.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gallery images yet. Add URLs or upload images.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Drag and drop to rearrange image order.
          </p>
          <ReactSortable
            list={imageGallery}
            setList={onReorderGallery}
            animation={180}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {imageGallery.map((item) => (
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
                    onClick={() => onRemoveGalleryItem(item.id)}
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
                <div className="break-all px-2 py-1.5 text-[11px] text-muted-foreground">
                  {item.url}
                </div>
              </div>
            ))}
          </ReactSortable>
        </>
      )}
    </div>
  );
}

export function ProductNavbarPlacementSection({
  loadingNav,
  form,
  navItems,
  selectedMainNav,
  onMainNavChange,
  onSubNavChange,
}: {
  loadingNav: boolean;
  form: ProductForm;
  navItems: NavMainItem[];
  selectedMainNav: NavMainItem | null;
  onMainNavChange: (value: string) => void;
  onSubNavChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
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
              onChange={(event) => onMainNavChange(event.target.value)}
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
              onChange={(event) => onSubNavChange(event.target.value)}
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
  );
}

export function ProductDescriptionSection({
  richText,
  onRichTextChange,
}: {
  richText: string;
  onRichTextChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">Description</h2>
      <RichTextEditor
        description={richText}
        updateField={(field, value) => {
          if (field === "richText") {
            onRichTextChange(value);
          }
        }}
        field="richText"
      />
    </div>
  );
}

export function ProductVariantsSection({
  hasVariants,
  variants,
  onHasVariantsChange,
  onUpdateVariant,
  onAddVariant,
  onRemoveVariant,
}: {
  hasVariants: boolean;
  variants: VariantForm[];
  onHasVariantsChange: (checked: boolean) => void;
  onUpdateVariant: UpdateVariantField;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">Variants</h2>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={hasVariants}
          onCheckedChange={(checked) => onHasVariantsChange(checked === true)}
        />
        This product has variants
      </label>

      {hasVariants ? (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-border/60 bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Variant #{index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveVariant(index)}
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
                    onUpdateVariant(index, "title", event.target.value)
                  }
                />
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(event) =>
                    onUpdateVariant(index, "sku", event.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(event) =>
                    onUpdateVariant(index, "price", event.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Discount price"
                  value={variant.discountPrice}
                  onChange={(event) =>
                    onUpdateVariant(index, "discountPrice", event.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(event) =>
                    onUpdateVariant(index, "stock", event.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Sort order"
                  value={variant.sortOrder}
                  onChange={(event) =>
                    onUpdateVariant(index, "sortOrder", event.target.value)
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
                    onUpdateVariant(index, "attributes", event.target.value)
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={variant.isActive}
                  onCheckedChange={(checked) =>
                    onUpdateVariant(index, "isActive", checked === true)
                  }
                />
                Variant is active
              </label>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={onAddVariant}>
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
  );
}

export function ProductFlagsSection({
  form,
  onUpdateField,
}: {
  form: ProductForm;
  onUpdateField: UpdateField;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">Product Flags</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) =>
              onUpdateField("isActive", checked === true)
            }
          />
          Product is active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isHotSells}
            onCheckedChange={(checked) =>
              onUpdateField("isHotSells", checked === true)
            }
          />
          Hot sells
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isWeeklySell}
            onCheckedChange={(checked) =>
              onUpdateField("isWeeklySell", checked === true)
            }
          />
          Weekly sell
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isSummerSell}
            onCheckedChange={(checked) =>
              onUpdateField("isSummerSell", checked === true)
            }
          />
          Summer sell
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isWinterSell}
            onCheckedChange={(checked) =>
              onUpdateField("isWinterSell", checked === true)
            }
          />
          Winter sell
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isBestSell}
            onCheckedChange={(checked) =>
              onUpdateField("isBestSell", checked === true)
            }
          />
          Best sell
        </label>
      </div>
    </div>
  );
}

export function ProductEditorActions({
  mode,
  isSaving,
  onCancel,
  onSubmit,
}: {
  mode: ProductEditorMode;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 pb-8">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" onClick={onSubmit} disabled={isSaving}>
        {isSaving ? (
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
  );
}
