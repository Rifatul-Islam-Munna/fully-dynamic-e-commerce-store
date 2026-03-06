import { cookies } from "next/headers";
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
      { message: "Invalid checkout payload" },
      { status: 400 },
    );
  }

  const token = (await cookies()).get("access_token")?.value;

  try {
    const response = await fetch(`${baseUrl}/product/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { access_token: token } : {}),
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const responsePayload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    return NextResponse.json(
      responsePayload ?? {
        message: response.ok ? "Success" : "Checkout failed",
      },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to connect to checkout service" },
      { status: 500 },
    );
  }
}
