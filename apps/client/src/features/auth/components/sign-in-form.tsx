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
    <Card className="w-full max-w-md rounded-[2.5rem] border-primary/10 bg-background/80 p-2 shadow-[0_8px_40px_rgb(0,0,0,0.08)] backdrop-blur-xl sm:p-4">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-extrabold tracking-tight">
          Chào mừng trở lại
        </CardTitle>
        <CardDescription className="text-sm text-foreground-muted">
          Đăng nhập để quản lý hệ sinh thái creator của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="ten@congty.com"
                className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                aria-invalid={Boolean(state.fieldErrors.email)}
                aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
              />
            </div>
            {state.fieldErrors.email ? (
              <p id="email-error" className="text-xs text-red-600 dark:text-red-400" role="alert">
                {state.fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[var(--color-tech-blue)] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                aria-invalid={Boolean(state.fieldErrors.password)}
                aria-describedby={
                  state.fieldErrors.password ? "password-error" : undefined
                }
              />
            </div>
            {state.fieldErrors.password ? (
              <p
                id="password-error"
                className="text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>

          {state.message ? (
            <p
              className="rounded-xl border border-primary-soft bg-primary-soft/50 px-3 py-2 text-sm text-foreground"
              role="status"
            >
              {state.message}
            </p>
          ) : null}

          <Button type="submit" className="h-14 w-full rounded-2xl text-lg font-bold shadow-lg shadow-primary/25" disabled={isPending}>
            {isPending ? "Đang xử lý…" : "Đăng nhập"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary-soft" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-2xl border-border/60 hover:bg-muted/50" disabled>
            Google
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-2xl border-border/60 hover:bg-muted/50" disabled>
            Apple
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          OAuth sẽ bật khi cấu hình provider (không gửi mật khẩu qua nút này).
        </p>

        <div className="space-y-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-5">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-primary/80">
            Truy cập nhanh demo
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={AUTH_ROUTES.BUSINESS_DASHBOARD}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-primary/20 bg-background/50 text-[13px] font-semibold hover:border-primary/40 hover:bg-card no-underline shadow-sm"
              )}
            >
              <Building2 className="size-4 shrink-0" aria-hidden />
              Doanh nghiệp / Agency
            </Link>
            <Link
              href={AUTH_ROUTES.AMBASSADOR_DASHBOARD}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-primary/20 bg-background/50 text-[13px] font-semibold hover:border-primary/40 hover:bg-card no-underline shadow-sm"
              )}
            >
              <Sparkles className="size-4 shrink-0" aria-hidden />
              KOL / KOC Ambassador
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-foreground-muted">
          Chưa có tài khoản?{" "}
          <Link
            href={AUTH_ROUTES.SIGN_UP}
            className="font-bold text-[var(--color-tech-blue)] hover:underline"
          >
            Tạo tài khoản
          </Link>
        </p>

        <AuthLegalInline className="text-center text-[11px] leading-relaxed text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
