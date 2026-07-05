"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/features/auth/constants";
import {
  validateSignInFields,
  validateSignUpFields,
  type SignUpRole,
} from "@/features/auth/lib/auth-validation";
import {
  backendRequest,
  getBackendErrorMessage,
  setBackendAuthCookies,
} from "@/server/backend/backend-client";
import type {
  BackendAuthTokens,
  BackendUserProfile,
} from "@/server/backend/backend-types";

export type SignInFormState = {
  ok: boolean;
  fieldErrors: Record<string, string>;
  message: string;
};

export type SignUpFormState = {
  ok: boolean;
  fieldErrors: Record<string, string>;
  message: string;
};

const INITIAL_SIGN_IN: SignInFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

const INITIAL_SIGN_UP: SignUpFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

function readString(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v !== "string") {
    return "";
  }
  return v;
}

function parseRole(raw: string): SignUpRole | null {
  if (raw === "brand" || raw === "creator") {
    return raw;
  }
  return null;
}

export async function submitSignIn(
  _prev: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  const fieldErrors = validateSignInFields(email, password);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, message: "" };
  }

  let redirectTo: string = AUTH_ROUTES.BUSINESS_DASHBOARD;

  try {
    const tokens = await backendRequest<BackendAuthTokens>(
      "/hivek/client/v1/auth/sign-in",
      {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          password,
        },
        cache: "no-store",
      }
    );

    await setBackendAuthCookies(tokens);

    const profile = await backendRequest<BackendUserProfile>(
      "/hivek/client/v1/auth/profile",
      {
        method: "GET",
        authToken: tokens.accessToken,
        cache: "no-store",
      }
    ).catch(() => null);

    if (profile?.type === "kol") {
      redirectTo = AUTH_ROUTES.AMBASSADOR_DASHBOARD;
    }
  } catch (error) {
    return {
      ...INITIAL_SIGN_IN,
      ok: false,
      message: `Đăng nhập thất bại: ${getBackendErrorMessage(error)}`,
    };
  }

  redirect(redirectTo);
}

export async function submitSignUp(
  _prev: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const fullName = readString(formData, "fullName");
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const confirmPassword = readString(formData, "confirmPassword");
  const roleRaw = readString(formData, "role");

  const role = parseRole(roleRaw);
  if (!role) {
    return {
      ok: false,
      fieldErrors: {},
      message: "Vui lòng chọn loại tài khoản.",
    };
  }

  const fieldErrors = validateSignUpFields({
    fullName,
    emailRaw: email,
    password,
    confirmPassword,
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, message: "" };
  }

  try {
    await backendRequest<{ userId: string }>(
      role === "creator"
        ? "/hivek/client/v1/auth/sign-up/kol"
        : "/hivek/client/v1/auth/sign-up/enterprise",
      {
        method: "POST",
        body: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        cache: "no-store",
      }
    );
  } catch (error) {
    return {
      ...INITIAL_SIGN_UP,
      ok: false,
      message: `Đăng ký thất bại: ${getBackendErrorMessage(error)}`,
    };
  }

  return {
    ...INITIAL_SIGN_UP,
    ok: true,
    message:
      "Đăng ký thành công. Vui lòng kiểm tra email/OTP nếu backend yêu cầu xác minh, rồi đăng nhập.",
  };
}
