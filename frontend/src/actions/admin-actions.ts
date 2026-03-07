"use server"

import {
  GetRequestNormal,
  PostRequestAxios,
  PatchRequestAxios,
  DeleteRequestAxios,
} from "@/api-hooks/api-hooks";
import type {
  ProductCardVariant,
  ProductDetailsVariant,
  SiteThemeName,
} from "@/lib/site-appearance";

// ─── Users ──────────────────────────────────────────────────

type AdminUsersResponse = {
  mode: string;
  data: Record<string, unknown>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminUsers(page = 1, limit = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);

  return GetRequestNormal<AdminUsersResponse>(
    `/user/admin?${params.toString()}`,
    0,
    "admin-users"
  );
}

export async function updateUser(payload: Record<string, unknown>) {
  return PatchRequestAxios("/user", payload);
}

export async function deleteUser(userId: string) {
  return DeleteRequestAxios(`/user?userId=${userId}`);
}

// ─── Products ───────────────────────────────────────────────

type AdminProductsResponse = {
  mode: string;
  data: Record<string, unknown>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ProductListFilters = {
  mainNavUrl?: string;
  subNavUrl?: string;
};

type AdminSingleProductResponse = {
  mode: string;
  data: Record<string, unknown>;
};

export async function getAdminProducts(
  page = 1,
  limit = 20,
  search = "",
  filters: ProductListFilters = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (filters.mainNavUrl) params.set("mainNavUrl", filters.mainNavUrl);
  if (filters.subNavUrl) params.set("subNavUrl", filters.subNavUrl);

  return GetRequestNormal<AdminProductsResponse>(
    `/product?${params.toString()}`,
    0,
    "admin-products"
  );
}

export async function getAdminProductById(productId: string) {
  return GetRequestNormal<AdminSingleProductResponse>(
    `/product?productId=${encodeURIComponent(productId)}`,
    0,
    `admin-product-${productId}`
  );
}

export async function createProduct(payload: Record<string, unknown>) {
  return PostRequestAxios("/product", payload);
}

export async function updateProduct(payload: Record<string, unknown>) {
  return PatchRequestAxios("/product", payload);
}

export async function deleteProduct(productId: string) {
  return DeleteRequestAxios(`/product?productId=${productId}`);
}

export type AdminStockInventoryItem = {
  productId: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  isActive: boolean;
  mainNavUrl: string | null;
  subNavUrl: string | null;
  hasVariants: boolean;
  variantCount: number;
  activeVariantCount: number;
  totalStock: number | null;
  stockStatus: "healthy" | "low-stock" | "out-of-stock" | "untracked";
  stockTracked: boolean;
  soldUnits: number;
  revenue: number;
  orderCount: number;
  lastSoldAt: string | null;
  daysSinceLastSale: number | null;
  daysInCatalog: number;
  isStale: boolean;
  neverSold: boolean;
  inventoryValue: number | null;
  priceRange: {
    min: number;
    max: number;
  };
  movementStatus: "best-selling" | "steady" | "slow" | "new" | "no-sales";
  stockBreakdown: Array<{
    variantId: string;
    title: string;
    sku: string | null;
    stock: number;
    isActive: boolean;
    soldUnits: number;
    revenue: number;
    lastSoldAt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminStockReport = {
  generatedAt: string;
  thresholds: {
    staleAfterDays: number;
    lowStockThreshold: number;
    topLimit: number;
  };
  summary: {
    totalProducts: number;
    activeProducts: number;
    variantProducts: number;
    simpleProducts: number;
    stockSetupPendingProducts: number;
    healthyStockProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    staleProducts: number;
    neverSoldProducts: number;
    totalUnitsInStock: number;
    totalInventoryValue: number;
    totalSoldUnits: number;
    totalRevenue: number;
  };
  highlights: {
    topSelling: AdminStockInventoryItem[];
    staleProducts: AdminStockInventoryItem[];
    lowStockProducts: AdminStockInventoryItem[];
  };
  inventory: AdminStockInventoryItem[];
};

export async function getAdminStockReport(
  staleAfterDays = 30,
  lowStockThreshold = 5,
  topLimit = 8,
) {
  const params = new URLSearchParams({
    staleAfterDays: String(staleAfterDays),
    lowStockThreshold: String(lowStockThreshold),
    topLimit: String(topLimit),
  });

  return GetRequestNormal<AdminStockReport>(
    `/product/admin/stock-report?${params.toString()}`,
    0,
    `admin-stock-report-${staleAfterDays}-${lowStockThreshold}-${topLimit}`
  );
}

export type AdminOrderStatus = "pending" | "confirmed" | "cancelled";
export type AdminOrderMode = "guest" | "member";

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  productTitle: string;
  productSlug: string;
  productThumbnailUrl: string;
  variantTitle: string | null;
  quantity: number;
  unitPrice: number;
  unitDiscountPrice: number | null;
  lineTotal: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  checkoutMode: AdminOrderMode;
  status: AdminOrderStatus;
  paymentMethod: "place_order" | "bkash";
  paymentStatus: "unpaid" | "partial_paid" | "paid";
  customerEmail: string | null;
  customerPhoneNumber: string;
  customerDistrict: string;
  customerAddress: string;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  couponId: string | null;
  couponCode: string | null;
  couponType: "percentage" | "value" | null;
  couponAmount: number | null;
  total: number;
  paidAmount: number;
  dueAmount: number;
  bkashPaymentId: string | null;
  bkashTransactionId: string | null;
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type AdminOrdersResponse = {
  mode: string;
  data: AdminOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    guestOrders: number;
    memberOrders: number;
    confirmedRevenue: number;
    confirmedUnits: number;
  };
};

type AdminOrderFilters = {
  status?: AdminOrderStatus;
  checkoutMode?: AdminOrderMode;
};

export async function getAdminOrders(
  page = 1,
  limit = 20,
  search = "",
  filters: AdminOrderFilters = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (filters.status) params.set("status", filters.status);
  if (filters.checkoutMode) params.set("checkoutMode", filters.checkoutMode);

  return GetRequestNormal<AdminOrdersResponse>(
    `/product/checkout/admin?${params.toString()}`,
    0,
    `admin-orders-${page}-${limit}-${search}-${filters.status ?? "all"}-${filters.checkoutMode ?? "all"}`
  );
}

export async function updateAdminOrderStatus(payload: {
  orderId: string;
  status: AdminOrderStatus;
}) {
  return PatchRequestAxios("/product/checkout/admin/status", payload);
}

type AdminCouponsResponse = {
  mode: string;
  data: Record<string, unknown>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminCoupons(page = 1, limit = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);

  return GetRequestNormal<AdminCouponsResponse>(
    `/product/coupon?${params.toString()}`,
    0,
    "admin-coupons"
  );
}

export async function createCoupon(payload: Record<string, unknown>) {
  return PostRequestAxios("/product/coupon", payload);
}

export async function updateCoupon(payload: Record<string, unknown>) {
  return PatchRequestAxios("/product/coupon", payload);
}

// ─── Site Settings ──────────────────────────────────────────

type SiteSettingsResponse = {
  id: string;
  key: string;
  siteTitle: string;
  metaDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  whatsappLink: string | null;
  tawkToLink: string | null;
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
  noticeEnabled: boolean;
  noticeText: string | null;
  siteTheme: SiteThemeName;
  productCardVariant: ProductCardVariant;
  productDetailsVariant: ProductDetailsVariant;
  isActive: boolean;
};

export async function getSiteSettings() {
  try {
    return await GetRequestNormal<SiteSettingsResponse>(
      "/web-settings/site?key=default",
      0,
      "site-settings"
    );
  } catch {
    return null;
  }
}

export async function createSiteSettings(payload: Record<string, unknown>) {
  return PostRequestAxios("/web-settings/site", payload);
}

export async function updateSiteSettings(payload: Record<string, unknown>) {
  return PatchRequestAxios("/web-settings/site?key=default", payload);
}

// â”€â”€â”€ Home Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type HomeSectionType =
  | "hero_slider"
  | "product_collection"
  | "discount_banner"
  | "custom_banner";

export type ProductFlag =
  | "isHotSells"
  | "isWeeklySell"
  | "isSummerSell"
  | "isWinterSell"
  | "isBestSell";

export type HomeHeroSlide = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  variant?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  productFlag?: ProductFlag;
  mainNavUrl?: string;
  subNavUrl?: string;
  productLimit?: number;
  theme?: string;
  sortOrder?: number;
  isActive?: boolean;
  slides?: HomeHeroSlide[];
};

type HomeSettingsResponse = {
  id: string;
  key?: string;
  mainNavUrl: string | null;
  subNavUrl: string | null;
  theme: string | null;
  sections: HomeSection[];
  isActive: boolean;
};

type HomeSettingsTarget = {
  mainNavUrl?: string;
  subNavUrl?: string;
};

function buildHomeTargetQuery(target?: HomeSettingsTarget) {
  const params = new URLSearchParams();

  if (target?.mainNavUrl) {
    params.set("mainNavUrl", target.mainNavUrl);
  }
  if (target?.subNavUrl) {
    params.set("subNavUrl", target.subNavUrl);
  }

  return params.toString();
}

function buildHomeSettingsUrl(target?: HomeSettingsTarget) {
  const query = buildHomeTargetQuery(target);
  return query ? `/web-settings/home?${query}` : "/web-settings/home";
}

export async function getHomeSettings(target?: HomeSettingsTarget) {
  try {
    const query = buildHomeTargetQuery(target);
    const url = buildHomeSettingsUrl(target);
    return await GetRequestNormal<HomeSettingsResponse>(
      url,
      0,
      `home-settings-${query || "root"}`
    );
  } catch {
    return null;
  }
}

export async function updateHomeSettings(
  payload: Record<string, unknown>,
  target?: HomeSettingsTarget,
) {
  return PatchRequestAxios(buildHomeSettingsUrl(target), payload);
}

export async function createHomeSettings(payload: Record<string, unknown>) {
  return PostRequestAxios("/web-settings/home", payload);
}

// ─── Navbar Settings ────────────────────────────────────────

type NavbarSettingsResponse = {
  id: string;
  key: string;
  mainNav: Array<{
    title: string;
    url: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
    subNav?: Array<{
      title: string;
      url: string;
      imageUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }>;
  }>;
  isActive: boolean;
};

export async function getNavbarSettings() {
  try {
    return await GetRequestNormal<NavbarSettingsResponse>(
      "/web-settings/navbar?key=default",
      0,
      "navbar-settings"
    );
  } catch {
    return null;
  }
}

export async function updateNavbarSettings(payload: Record<string, unknown>) {
  return PatchRequestAxios("/web-settings/navbar?key=default", payload);
}

export async function createNavbarSettings(payload: Record<string, unknown>) {
  return PostRequestAxios("/web-settings/navbar", payload);
}

// ─── Footer Settings ────────────────────────────────────────

type FooterSettingsResponse = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  logoImageUrl: string | null;
  brandImageUrl: string | null;
  copyrightText: string | null;
  socialLinks: Array<{
    platform: string;
    url: string;
    imageUrl?: string;
  }>;
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      url: string;
      imageUrl?: string;
    }>;
  }>;
  isActive: boolean;
};

export async function getFooterSettings() {
  try {
    return await GetRequestNormal<FooterSettingsResponse>(
      "/web-settings/footer?key=default",
      0,
      "footer-settings"
    );
  } catch {
    return null;
  }
}

export async function updateFooterSettings(payload: Record<string, unknown>) {
  return PatchRequestAxios("/web-settings/footer?key=default", payload);
}

export async function createFooterSettings(payload: Record<string, unknown>) {
  return PostRequestAxios("/web-settings/footer", payload);
}
