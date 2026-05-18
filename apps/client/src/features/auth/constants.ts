/** Public routes used by auth flows and demo shortcuts. */
export const AUTH_ROUTES = {
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  LANDING: "/",
  BUSINESS_DASHBOARD: "/dashboard",
  /** KOL/KOC workspace — tách path vì `/dashboard` đã dành cho business. */
  AMBASSADOR_DASHBOARD: "/ambassador/dashboard",
} as const;
