"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { AccentWord, AuthShell } from "@/features/auth/components/auth-shell";
import { AuthField, AuthPasswordField } from "@/features/auth/components/auth-field";
import { AuthOAuth } from "@/features/auth/components/auth-oauth";
import type { SignUpRole } from "@/features/auth/lib/auth-validation";
import {
  submitSignUp,
  type SignUpFormState,
} from "@/features/auth/server/auth-actions";

const INITIAL: SignUpFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

const ACCENT = "var(--color-primary)";

const ROLES: {
  role: SignUpRole;
  icon: string;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    role: "brand",
    icon: "storefront",
    title: "Thương hiệu",
    description: "Tìm KOL phù hợp & vận hành chiến dịch",
    color: "var(--color-primary)",
  },
  {
    role: "creator",
    icon: "auto_awesome",
    title: "Creator",
    description: "Nhận hợp đồng & chi trả an toàn",
    color: "var(--color-primary)",
  },
];

/** Big selectable role card — the signature element of the sign-up page. */
function RoleCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof ROLES)[number];
  selected: boolean;
  onSelect: (role: SignUpRole) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option.role)}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-1 flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-colors"
      style={{
        borderColor: selected
          ? `color-mix(in srgb, ${option.color} 65%, transparent)`
          : "rgba(255,255,255,0.10)",
        backgroundColor: selected
          ? `color-mix(in srgb, ${option.color} 12%, transparent)`
          : "rgba(255,255,255,0.04)",
        boxShadow: selected
          ? `0 0 24px color-mix(in srgb, ${option.color} 18%, transparent)`
          : "none",
      }}
    >
      <span
        className="material-symbols-outlined absolute right-3 top-3 text-lg transition-opacity"
        style={{ color: option.color, opacity: selected ? 1 : 0 }}
        aria-hidden
      >
        check_circle
      </span>

      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${option.color} 16%, transparent)`,
          border: `1px solid color-mix(in srgb, ${option.color} 40%, transparent)`,
        }}
      >
        <span className="material-symbols-outlined text-xl" style={{ color: option.color }} aria-hidden>
          {option.icon}
        </span>
      </span>

      <span className="mt-1 text-sm font-black text-white">{option.title}</span>
      <span className="text-xs leading-relaxed text-white/50">{option.description}</span>
    </motion.button>
  );
}

export function SignUpForm() {
  const [role, setRole] = useState<SignUpRole>("brand");
  const [state, formAction, isPending] = useActionState(submitSignUp, INITIAL);

  return (
    <AuthShell
      className="max-w-xl"
      accent={{ color: ACCENT, chipIcon: "auto_awesome", chipLabel: "Miễn phí khởi tạo" }}
      heading={
        <>
          Gia nhập nền kinh tế <AccentWord color={ACCENT}>Sáng tạo</AccentWord>
        </>
      }
      subtitle="Tạo tài khoản trong một phút — chọn quỹ đạo của bạn trong vũ trụ Hive-K."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href={AUTH_ROUTES.SIGN_IN} className="font-bold text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="role" value={role} />

        <div className="flex flex-col gap-3 sm:flex-row">
          {ROLES.map((option) => (
            <RoleCard
              key={option.role}
              option={option}
              selected={role === option.role}
              onSelect={setRole}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthField
            id="su-name"
            name="fullName"
            label="Họ và tên"
            icon="badge"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            error={state.fieldErrors.fullName}
          />
          <AuthField
            id="su-email"
            name="email"
            type="email"
            label="Email"
            icon="alternate_email"
            autoComplete="email"
            inputMode="email"
            placeholder="ban@email.com"
            error={state.fieldErrors.email}
          />
          <AuthPasswordField
            id="su-password"
            name="password"
            label="Mật khẩu"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            error={state.fieldErrors.password}
          />
          <AuthPasswordField
            id="su-confirm"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            error={state.fieldErrors.confirmPassword}
          />
        </div>

        {state.message ? (
          <p
            role="status"
            className={
              state.ok
                ? "flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2.5 text-sm text-emerald-300"
                : "flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300"
            }
          >
            <span className="material-symbols-outlined mt-0.5 text-base" aria-hidden>
              {state.ok ? "check_circle" : "warning"}
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
              Đang khởi tạo...
            </>
          ) : (
            <>
              Tạo tài khoản
              <span className="material-symbols-outlined text-lg" aria-hidden>
                rocket_launch
              </span>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-7">
        <AuthOAuth />
      </div>
    </AuthShell>
  );
}
