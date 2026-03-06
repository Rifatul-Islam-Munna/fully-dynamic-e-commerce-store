import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GetRequestNormal } from "@/api-hooks/api-hooks";

export type AccountProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AccountOrderCard = {
  id: string;
  orderNumber: string;
  status: string;
  itemCount: number;
  total: number;
  customerDistrict: string;
  createdAt: string;
  updatedAt: string;
  firstItem: {
    productTitle: string;
    productSlug: string;
    productThumbnailUrl: string;
    variantTitle: string | null;
    quantity: number;
  } | null;
};

export type AccountDashboardPayload = {
  summary: {
    totalOrders: number;
    activeOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
    totalItems: number;
    activeValue: number;
    confirmedSpend: number;
    lastOrderAt: string | null;
  };
  activeOrders: AccountOrderCard[];
  recentOrders: AccountOrderCard[];
};

export async function requireAccountProfile() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  try {
    return await GetRequestNormal<AccountProfile>("/user/me", 0, "user-profile");
  } catch {
    redirect("/login");
  }
}

export async function getAccountDashboard() {
  try {
    return await GetRequestNormal<AccountDashboardPayload>(
      "/product/checkout/me",
      0,
      "account-dashboard",
    );
  } catch {
    return {
      summary: {
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        cancelledOrders: 0,
        totalItems: 0,
        activeValue: 0,
        confirmedSpend: 0,
        lastOrderAt: null,
      },
      activeOrders: [],
      recentOrders: [],
    } satisfies AccountDashboardPayload;
  }
}

