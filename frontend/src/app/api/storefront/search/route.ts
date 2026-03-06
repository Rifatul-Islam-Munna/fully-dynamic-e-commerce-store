import { NextResponse } from "next/server";
import {
  SEARCH_RESULTS_LIMIT,
  createStorefrontSearchParams,
  isProductSort,
  parseBooleanQueryValue,
  parseNonNegativeNumber,
  parsePositiveInteger,
} from "@/lib/storefront-search";

const baseUrl = process.env.BASE_URL?.trim();

export async function GET(request: Request) {
  if (!baseUrl) {
    return NextResponse.json(
      { message: "BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const limit = Math.min(
    parsePositiveInteger(searchParams.get("limit"), SEARCH_RESULTS_LIMIT),
    100,
  );
  const sortParam = searchParams.get("sort");
  const sort = isProductSort(sortParam) ? sortParam : "newest";

  const query = createStorefrontSearchParams({
    page,
    limit,
    search: searchParams.get("search") ?? undefined,
    mainNavUrl: searchParams.get("mainNavUrl") ?? undefined,
    subNavUrl: searchParams.get("subNavUrl") ?? undefined,
    minPrice: parseNonNegativeNumber(searchParams.get("minPrice")),
    maxPrice: parseNonNegativeNumber(searchParams.get("maxPrice")),
    sort,
    isHotSells: parseBooleanQueryValue(searchParams.get("isHotSells")),
    isWeeklySell: parseBooleanQueryValue(searchParams.get("isWeeklySell")),
    isSummerSell: parseBooleanQueryValue(searchParams.get("isSummerSell")),
    isWinterSell: parseBooleanQueryValue(searchParams.get("isWinterSell")),
    isBestSell: parseBooleanQueryValue(searchParams.get("isBestSell")),
  });

  try {
    const response = await fetch(`${baseUrl}/product/public?${query.toString()}`, {
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        { message: payload?.message || "Failed to load search results" },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the product service" },
      { status: 502 },
    );
  }
}
