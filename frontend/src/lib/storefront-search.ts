export const PRODUCT_FLAG_CONFIG = [
  {
    key: "isHotSells",
    label: "Hot Sells",
    description: "Fast-moving products customers are buying right now.",
  },
  {
    key: "isWeeklySell",
    label: "Weekly Picks",
    description: "Products highlighted for this week's campaign.",
  },
  {
    key: "isSummerSell",
    label: "Summer Edit",
    description: "Seasonal items prepared for warmer days.",
  },
  {
    key: "isWinterSell",
    label: "Winter Edit",
    description: "Cold-season essentials and layered staples.",
  },
  {
    key: "isBestSell",
    label: "Best Sellers",
    description: "Consistently top-performing products across the catalog.",
  },
] as const;

export const PRODUCT_SORT_VALUES = [
  "newest",
  "price-asc",
  "price-desc",
  "title-asc",
] as const;

export const PRODUCT_SORT_OPTIONS: Array<{
  value: ProductSort;
  label: string;
}> = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title-asc", label: "Alphabetical" },
];

export const SEARCH_RESULTS_LIMIT = 12;

export type ProductFlagKey = (typeof PRODUCT_FLAG_CONFIG)[number]["key"];

export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

export type StorefrontProduct = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  mainNavUrl?: string | null;
  subNavUrl?: string | null;
  isHotSells?: boolean;
  isWeeklySell?: boolean;
  isSummerSell?: boolean;
  isWinterSell?: boolean;
  isBestSell?: boolean;
};

export type StorefrontPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StorefrontProductSearchResponse = {
  mode?: "list";
  data?: StorefrontProduct[];
  pagination?: StorefrontPagination;
};

export type StorefrontSearchFilters = {
  search: string;
  page: number;
  mainNavUrl: string | null;
  subNavUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: ProductSort;
  isHotSells: boolean;
  isWeeklySell: boolean;
  isSummerSell: boolean;
  isWinterSell: boolean;
  isBestSell: boolean;
};

type SearchParamInput = Partial<StorefrontSearchFilters> & {
  limit?: number;
};

export function normalizeSearchText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function normalizeSearchPathLabel(value?: string | null) {
  const normalized = normalizeSearchText(value);
  if (!normalized) {
    return null;
  }

  const segment = normalized.split("/").filter(Boolean).pop();
  if (!segment) {
    return normalized;
  }

  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isProductSort(value: string | null | undefined): value is ProductSort {
  return PRODUCT_SORT_VALUES.includes(value as ProductSort);
}

export function parsePositiveInteger(
  value: string | null | undefined,
  fallback: number,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseNonNegativeNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function parseBooleanQueryValue(value: string | null | undefined) {
  return value === "true";
}

export function createStorefrontSearchParams(input: SearchParamInput) {
  const params = new URLSearchParams();
  const search = normalizeSearchText(input.search);
  const mainNavUrl = normalizeSearchText(input.mainNavUrl);
  const subNavUrl = normalizeSearchText(input.subNavUrl);

  if (search) {
    params.set("search", search);
  }

  if (mainNavUrl) {
    params.set("mainNavUrl", mainNavUrl);
  }

  if (subNavUrl) {
    params.set("subNavUrl", subNavUrl);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  if (input.limit && input.limit > 0) {
    params.set("limit", String(input.limit));
  }

  if (typeof input.minPrice === "number" && Number.isFinite(input.minPrice)) {
    params.set("minPrice", String(input.minPrice));
  }

  if (typeof input.maxPrice === "number" && Number.isFinite(input.maxPrice)) {
    params.set("maxPrice", String(input.maxPrice));
  }

  if (input.sort && input.sort !== "newest") {
    params.set("sort", input.sort);
  }

  for (const { key } of PRODUCT_FLAG_CONFIG) {
    if (input[key]) {
      params.set(key, "true");
    }
  }

  return params;
}

export function buildStorefrontSearchUrl(input: SearchParamInput) {
  const params = createStorefrontSearchParams(input);
  const query = params.toString();
  return query ? `/api/storefront/search?${query}` : "/api/storefront/search";
}
