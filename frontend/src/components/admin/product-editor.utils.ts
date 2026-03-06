import type {
  GalleryItem,
  ProductForm,
  VariantForm,
} from "@/components/admin/product-editor.types";

export const createEmptyVariant = (): VariantForm => ({
  title: "",
  sku: "",
  price: "",
  discountPrice: "",
  stock: "0",
  sortOrder: "0",
  isActive: true,
  attributes: "",
});

export const createEmptyForm = (): ProductForm => ({
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

export const toStringValue = (value: unknown) =>
  typeof value === "string"
    ? value
    : value === null || value === undefined
      ? ""
      : String(value);

export const toBool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

export const toNumberString = (value: unknown) =>
  typeof value === "number"
    ? String(value)
    : typeof value === "string"
      ? value
      : "";

export const makeGalleryItem = (url: string, index: number): GalleryItem => ({
  id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
  url,
});

export const parseNumber = (value: string, fieldName: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return parsed;
};

export const parseOptionalNumber = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return parseNumber(trimmed, fieldName);
};

export const parseIntValue = (
  value: string,
  fieldName: string,
  fallback = 0,
) => {
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

export const slugifyText = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const mapProductForm = (raw: Record<string, unknown>): ProductForm => {
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
                variant.discountPrice === null ||
                variant.discountPrice === undefined
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

export function buildPayload(form: ProductForm) {
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

      const variantPrice = parseNumber(
        variant.price,
        `Variant #${index + 1} price`,
      );
      const variantDiscountPrice = parseOptionalNumber(
        variant.discountPrice,
        `Variant #${index + 1} discount price`,
      );

      if (variantDiscountPrice !== null && variantDiscountPrice > variantPrice) {
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
