import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { message: "Server configuration error: BASE_URL is missing" },
        { status: 500 },
      );
    }

    const accessToken = (await cookies()).get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "A file field named `file` is required" },
        { status: 400 },
      );
    }

    const upstreamFormData = new FormData();
    upstreamFormData.append("file", file);

    const response = await fetch(`${baseUrl}/image/upload-avatar`, {
      method: "POST",
      headers: {
        access_token: accessToken,
      },
      body: upstreamFormData,
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { url?: string; message?: string }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        { message: payload?.message || "Avatar upload failed" },
        { status: response.status },
      );
    }

    if (!payload?.url) {
      return NextResponse.json(
        { message: "Upload response did not include image URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: payload.url });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unexpected upload error",
      },
      { status: 500 },
    );
  }
}
