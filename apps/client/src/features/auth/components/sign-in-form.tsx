"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { AccentWord, AuthShell } from "@/features/auth/components/auth-shell";
import { AuthField, AuthPasswordField } from "@/features/auth/components/auth-field";
import { AuthOAuth } from "@/features/auth/components/auth-oauth";
import {
  submitSignIn,
  type SignInFormState,
} from "@/features/auth/server/auth-actions";

const INITIAL: SignInFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

const ACCENT = "var(--color-primary)";

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(submitSignIn, INITIAL);

  return (
    <AuthShell
      className="max-w-md"
      accent={{ color: ACCENT, chipIcon: "rocket_launch", chipLabel: "Trạm điều khiển Hive-K" }}
      heading={
        <>
          Chào mừng <AccentWord color={ACCENT}>trở lại</AccentWord>
        </>
      }
      subtitle="Đăng nhập để tiếp tục hành trình cùng các chiến dịch và creator của bạn."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href={AUTH_ROUTES.SIGN_UP} className="font-bold text-primary hover:underline">
            Gia nhập Hive-K
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5" noValidate>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon="alternate_email"
          autoComplete="email"
          inputMode="email"
          placeholder="ten@congty.com"
          error={state.fieldErrors.email}
        />

        <AuthPasswordField
          id="password"
          name="password"
          label="Mật khẩu"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.fieldErrors.password}
          underSlot={
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          }
        />

        {state.message ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300"
          >
            <span className="material-symbols-outlined mt-0.5 text-base" aria-hidden>
              warning
            </span>
            {state.message}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          whileTap={{ scale: isPending ? 1 : 0.97 }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg" aria-hidden>
                progress_activity
              </span>
              Đang đăng nhập...
            </>
          ) : (
            <>
              Đăng nhập
              <span className="material-symbols-outlined text-lg" aria-hidden>
                arrow_forward
              </span>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-7">
        <AuthOAuth />
      </div>

      {/* Demo shortcuts — small and out of the way */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold text-white/35">
        Khám phá nhanh:
        <Link
          href={AUTH_ROUTES.BUSINESS_DASHBOARD}
          className="rounded-full border border-white/10 px-3 py-1 text-white/60 transition-colors hover:border-primary/50 hover:text-primary"
        >
          Demo Doanh nghiệp
        </Link>
        <Link
          href={AUTH_ROUTES.AMBASSADOR_DASHBOARD}
          className="rounded-full border border-white/10 px-3 py-1 text-white/60 transition-colors hover:border-primary/50 hover:text-primary"
        >
          Demo Cộng tác viên
        </Link>
      </div>
    </AuthShell>
  );
}
