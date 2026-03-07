import { cookies } from "next/headers";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { CheckoutPageShell } from "@/components/checkout/checkout-page-shell";
import type { CheckoutPageUser } from "@/lib/checkout";

type CheckoutPageSettings = {
  showPlaceOrderButton?: boolean;
  showBkashCheckoutButton?: boolean;
};

function parseUserCookie(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CheckoutPageUser> | null;

    if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string") {
      return null;
    }

    return {
      id: parsed.id,
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phoneNumber:
        typeof parsed.phoneNumber === "string" ? parsed.phoneNumber : null,
      role: typeof parsed.role === "string" ? parsed.role : "customer",
    } satisfies CheckoutPageUser;
  } catch {
    return null;
  }
}

async function getCheckoutPageSettings() {
  try {
    return await GetRequestNormal<CheckoutPageSettings>(
      "/web-settings/site?key=default",
      0,
      "checkout-page-settings",
    );
  } catch {
    return null;
  }
}

export default async function CheckoutPage() {
  const [cookieStore, checkoutSettings] = await Promise.all([
    cookies(),
    getCheckoutPageSettings(),
  ]);
  const initialUser = parseUserCookie(cookieStore.get("user")?.value);

  return (
    <CheckoutPageShell
      initialUser={initialUser}
      checkoutSettings={{
        showPlaceOrderButton: checkoutSettings?.showPlaceOrderButton ?? true,
        showBkashCheckoutButton:
          checkoutSettings?.showBkashCheckoutButton ?? false,
      }}
    />
  );
}
