const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;

export type SignInFieldKey = "email" | "password";

export type SignUpFieldKey =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword";

export type SignInFieldErrors = Partial<Record<SignInFieldKey, string>>;

export type SignUpFieldErrors = Partial<Record<SignUpFieldKey, string>>;

export type SignUpRole = "brand" | "creator";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Validates sign-in payload (email format + non-empty password).
 * Login không ép độ dài mật khẩu — chỉ kiểm tra có nhập.
 */
export function validateSignInFields(
  emailRaw: string,
  passwordRaw: string
): SignInFieldErrors {
  const errors: SignInFieldErrors = {};
  const email = normalizeEmail(emailRaw);

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!passwordRaw) {
    errors.password = "Vui lòng nhập mật khẩu.";
  }

  return errors;
}

function validatePasswordStrength(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return "Mật khẩu quá dài.";
  }
  return undefined;
}

/**
 * Validates sign-up fields including confirm password match.
 */
export function validateSignUpFields(input: {
  fullName: string;
  emailRaw: string;
  password: string;
  confirmPassword: string;
}): SignUpFieldErrors {
  const errors: SignUpFieldErrors = {};
  const name = input.fullName.trim();
  const email = normalizeEmail(input.emailRaw);

  if (!name) {
    errors.fullName = "Vui lòng nhập họ tên.";
  } else if (name.length > 120) {
    errors.fullName = "Họ tên quá dài.";
  }

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  const pwErr = validatePasswordStrength(input.password);
  if (pwErr) {
    errors.password = pwErr;
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
}
