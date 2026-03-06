"use server";

import axios from "axios";
import { cookies } from "next/headers";

type UpdateProfilePayload = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

function parseAxiosMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responsePayload = error.response?.data as
      | { message?: string | string[] | { message?: string | string[] } }
      | undefined;

    const messageValue = responsePayload?.message;

    if (Array.isArray(messageValue) && messageValue[0]) {
      return messageValue[0];
    }

    if (typeof messageValue === "string") {
      return messageValue;
    }

    if (
      messageValue &&
      typeof messageValue === "object" &&
      "message" in messageValue
    ) {
      const nestedMessage = messageValue.message;
      if (Array.isArray(nestedMessage) && nestedMessage[0]) {
        return nestedMessage[0];
      }
      if (typeof nestedMessage === "string") {
        return nestedMessage;
      }
    }
  }

  return "Something went wrong.";
}

async function requireAccessToken() {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Please sign in again.");
  }

  return accessToken;
}

export async function updateProfileAction(payload: UpdateProfilePayload) {
  try {
    const accessToken = await requireAccessToken();
    const { data } = await axios.patch(
      `${process.env.BASE_URL}/user`,
      {
        userId: payload.userId,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        phoneNumber: payload.phoneNumber?.trim() || null,
        avatarUrl: payload.avatarUrl?.trim() || null,
      },
      {
        headers: {
          access_token: accessToken,
        },
      },
    );

    const cookieStore = await cookies();
    const existingUserRaw = cookieStore.get("user")?.value;
    const existingUser =
      existingUserRaw && existingUserRaw.trim()
        ? (JSON.parse(existingUserRaw) as Record<string, unknown>)
        : {};

    cookieStore.set("user", JSON.stringify({ ...existingUser, ...data }), {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 10,
    });

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: parseAxiosMessage(error),
    };
  }
}

export async function changePasswordAction(payload: ChangePasswordPayload) {
  try {
    const accessToken = await requireAccessToken();
    const { data } = await axios.patch(
      `${process.env.BASE_URL}/user/password`,
      payload,
      {
        headers: {
          access_token: accessToken,
        },
      },
    );

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: parseAxiosMessage(error),
    };
  }
}

