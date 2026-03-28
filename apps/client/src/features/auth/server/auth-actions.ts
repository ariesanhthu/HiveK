"use server";

import {
  validateSignInFields,
  validateSignUpFields,
  type SignUpRole,
} from "@/features/auth/lib/auth-validation";

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

/**
 * Server Action đăng nhập: validate lại phía server (double validation),
 * không log mật khẩu. Khi có API auth, gọi backend tại đây và set cookie httpOnly.
 */
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

  // TODO: POST /auth/login — chỉ gửi qua TLS; lưu session httpOnly + Secure + SameSite
  return {
    ...INITIAL_SIGN_IN,
    ok: false,
    message:
      "Xác thực qua máy chủ chưa được kết nối. Dùng «Truy cập nhanh demo» để vào workspace.",
  };
}

function parseRole(raw: string): SignUpRole | null {
  if (raw === "brand" || raw === "creator") {
    return raw;
  }
  return null;
}

/**
 * Server Action đăng ký: validate + role; không persist cho đến khi có API.
 */
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

  void role;

  return {
    ...INITIAL_SIGN_UP,
    ok: false,
    message:
      "Đăng ký qua API chưa bật. Bạn có thể dùng bản demo hoặc liên hệ admin.",
  };
}
