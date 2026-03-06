"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProduct,
  getAdminProductById,
  getNavbarSettings,
  updateProduct,
} from "@/actions/admin-actions";
import {
  ProductBasicInformationSection,
  ProductDescriptionSection,
  ProductEditorActions,
  ProductEditorHeader,
  ProductEditorLoadingState,
  ProductFlagsSection,
  ProductGallerySection,
  ProductNavbarPlacementSection,
  ProductVariantsSection,
} from "@/components/admin/product-editor-sections";
import type {
  NavMainItem,
  ProductEditorMode,
  ProductForm,
  VariantForm,
} from "@/components/admin/product-editor.types";
import {
  buildPayload,
  createEmptyForm,
  createEmptyVariant,
  makeGalleryItem,
  mapProductForm,
  slugifyText,
  toStringValue,
} from "@/components/admin/product-editor.utils";

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
      imageGallery: [
        ...prev.imageGallery,
        makeGalleryItem(url, prev.imageGallery.length),
      ],
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

  const handleMainNavChange = (nextMain: string) => {
    const nextSelectedMain = navItems.find((item) => item.url === nextMain);
    const hasSub = nextSelectedMain?.subNav.some(
      (sub) => sub.url === form.subNavUrl,
    );
    setForm((prev) => ({
      ...prev,
      mainNavUrl: nextMain,
      subNavUrl: hasSub ? prev.subNavUrl : "",
    }));
  };

  const handleBack = () => {
    router.push("/admin/products");
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
    return <ProductEditorLoadingState />;
  }

  return (
    <div className="space-y-6">
      <ProductEditorHeader mode={mode} onBack={handleBack} />
      <ProductBasicInformationSection
        form={form}
        isSlugManuallyEdited={isSlugManuallyEdited}
        onUpdateField={updateField}
        onTitleChange={handleTitleChange}
        onSlugChange={handleSlugChange}
      />
      <ProductGallerySection
        imageGallery={form.imageGallery}
        newGalleryUrl={newGalleryUrl}
        isGalleryUploading={isGalleryUploading}
        onNewGalleryUrlChange={setNewGalleryUrl}
        onAddGalleryByUrl={addGalleryByUrl}
        onUploadGalleryImage={uploadGalleryImage}
        onRemoveGalleryItem={removeGalleryItem}
        onReorderGallery={(items) => updateField("imageGallery", items)}
      />
      <ProductNavbarPlacementSection
        loadingNav={loadingNav}
        form={form}
        navItems={navItems}
        selectedMainNav={selectedMainNav}
        onMainNavChange={handleMainNavChange}
        onSubNavChange={(value) => updateField("subNavUrl", value)}
      />
      <ProductDescriptionSection
        richText={form.richText}
        onRichTextChange={(value) => updateField("richText", value)}
      />
      <ProductVariantsSection
        hasVariants={form.hasVariants}
        variants={form.variants}
        onHasVariantsChange={(checked) => updateField("hasVariants", checked)}
        onUpdateVariant={updateVariant}
        onAddVariant={addVariant}
        onRemoveVariant={removeVariant}
      />
      <ProductFlagsSection form={form} onUpdateField={updateField} />
      <ProductEditorActions
        mode={mode}
        isSaving={saveMutation.isPending}
        onCancel={handleBack}
        onSubmit={onSubmit}
      />
    </div>
  );
}
