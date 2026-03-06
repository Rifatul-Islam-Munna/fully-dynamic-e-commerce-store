import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SyncCartItemPayload = {
  productId: string;
  productVariantId?: string | null;
  quantity?: number;
};

type SyncRequestPayload = {
  items?: SyncCartItemPayload[];
};

const baseUrl = process.env.BASE_URL?.trim();

export async function POST(request: Request) {
  if (!baseUrl) {
    return NextResponse.json(
      { message: "BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | SyncRequestPayload
    | null;

  const normalizedItems = Array.isArray(payload?.items)
    ? payload.items
        .map((item) => ({
          productId: item.productId?.trim(),
          productVariantId: item.productVariantId?.trim() || undefined,
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
        .filter((item) => Boolean(item.productId))
    : [];

  if (normalizedItems.length === 0) {
    return NextResponse.json({ syncedCount: 0, failedCount: 0 });
  }

  const results = await Promise.all(
    normalizedItems.map(async (item) => {
      try {
        const response = await fetch(`${baseUrl}/product/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: token,
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          return {
            ok: false,
            productId: item.productId,
            message: errorPayload?.message || "Sync failed",
          };
        }

        return { ok: true, productId: item.productId };
      } catch {
        return {
          ok: false,
          productId: item.productId,
          message: "Sync failed",
        };
      }
    }),
  );

  const failed = results.filter((result) => !result.ok);
  return NextResponse.json({
    syncedCount: results.length - failed.length,
    failedCount: failed.length,
    failedItems: failed,
  });
}
