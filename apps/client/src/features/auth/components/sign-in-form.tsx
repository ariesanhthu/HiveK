"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Building2, Lock, Mail, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { AuthLegalInline } from "@/features/auth/components/auth-legal-inline";
import {
  submitSignIn,
  type SignInFormState,
} from "@/features/auth/server/auth-actions";

const INITIAL: SignInFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(submitSignIn, INITIAL);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Đăng nhập
        </h1>
        <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
          Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
        </p>
      </div>

      <Card className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6 shadow-sm sm:p-10">
        <CardContent className="p-0">
          <div className="mb-6 space-y-3 rounded-2xl border border-dashed border-[#f39c12]/30 bg-[#f39c12]/10 p-5">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#f39c12]">
              Truy cập nhanh Demo
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={AUTH_ROUTES.BUSINESS_DASHBOARD}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0f172a] text-[13px] font-semibold text-slate-300 shadow-sm transition-colors hover:border-[#f39c12] hover:text-[#f39c12]"
              >
                <Building2 size={16} aria-hidden />
                Doanh nghiệp / Agency
              </Link>
              <Link
                href={AUTH_ROUTES.AMBASSADOR_DASHBOARD}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0f172a] text-[13px] font-semibold text-slate-300 shadow-sm transition-colors hover:border-[#f39c12] hover:text-[#f39c12]"
              >
                <Sparkles size={16} aria-hidden />
                KOL / KOC
              </Link>
            </div>
          </div>

          <form action={formAction} className="space-y-6" noValidate>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <Mail size={14} className="text-[#3b82f6]" aria-hidden />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="ten@congty.com"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.email)}
                  aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
                />
                {state.fieldErrors.email ? (
                  <p id="email-error" className="text-xs text-red-500" role="alert">
                    {state.fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-[13px] font-bold text-white">
                    <Lock size={14} className="text-[#3b82f6]" aria-hidden />
                    Mật khẩu
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-[#3b82f6] hover:text-[#60a5fa] hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.password)}
                  aria-describedby={state.fieldErrors.password ? "password-error" : undefined}
                />
                {state.fieldErrors.password ? (
                  <p
                    id="password-error"
                    className="text-xs text-red-500"
                    role="alert"
                  >
                    {state.fieldErrors.password}
                  </p>
                ) : null}
              </div>
            </div>

            {state.message ? (
              <p
                className="rounded-xl border border-primary-soft bg-primary-soft/50 px-3 py-2 text-sm text-foreground"
                role="status"
              >
                {state.message}
              </p>
            ) : null}

            <Button type="submit" className="mt-2 h-12 w-full rounded-lg bg-[#f39c12] text-base font-bold text-white hover:bg-[#e67e22] shadow-sm transition-colors" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-[#1e293b] px-2 text-slate-400 font-medium">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-700 bg-[#0f172a] text-slate-300 hover:bg-slate-800 font-medium" disabled>
                Google
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-700 bg-[#0f172a] text-slate-300 hover:bg-slate-800 font-medium" disabled>
                Apple
              </Button>
            </div>
            <p className="text-center text-[11px] text-slate-500">
              OAuth sẽ được bật khi hoàn tất cấu hình.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-2 text-center text-sm font-medium text-slate-400">
        Chưa có tài khoản?{" "}
        <Link
          href={AUTH_ROUTES.SIGN_UP}
          className="font-bold text-[#f39c12] hover:text-[#fcd34d] hover:underline"
        >
          Tạo tài khoản
        </Link>
      </p>
      
      <AuthLegalInline className="text-center text-[11px] font-medium text-slate-500 max-w-sm" />
    </div>
  );
}
