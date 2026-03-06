import { NextResponse } from "next/server";

const baseUrl = process.env.BASE_URL?.trim();

export async function POST(request: Request) {
  if (!baseUrl) {
    return NextResponse.json(
      { message: "BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!payload) {
    return NextResponse.json(
      { message: "Invalid coupon preview payload" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/product/coupon/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const responsePayload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    return NextResponse.json(
      responsePayload ?? {
        message: response.ok ? "Success" : "Coupon preview failed",
      },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to connect to coupon service" },
      { status: 500 },
    );
  }
}
