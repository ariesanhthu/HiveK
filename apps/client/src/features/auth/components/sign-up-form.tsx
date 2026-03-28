"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2, Lock, Mail, ShieldCheck, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AUTH_ROUTES } from "@/features/auth/constants";
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

type RoleCardProps = {
  role: SignUpRole;
  selected: SignUpRole;
  onSelect: (r: SignUpRole) => void;
  title: string;
  description: string;
  icon: ReactNode;
};

function RoleCard({ role, selected, onSelect, title, description, icon }: RoleCardProps) {
  const isOn = selected === role;
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={cn(
        "flex w-full flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-colors",
        isOn
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/60 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
      )}
    >
      <span className={cn("rounded-full p-2", isOn ? "bg-primary/10 text-primary" : "text-muted-foreground")}>{icon}</span>
      <span className="text-sm font-bold text-foreground">{title}</span>
      <span className="text-xs text-foreground-muted leading-relaxed">{description}</span>
    </button>
  );
}

export function SignUpForm() {
  const [role, setRole] = useState<SignUpRole>("brand");
  const [state, formAction, isPending] = useActionState(submitSignUp, INITIAL);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          Gia nhập KOLConnect
        </h1>
        <p className="text-sm text-foreground-muted">
          Chọn vai trò và hoàn tất đăng ký trên nền tảng creator economy.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <RoleCard
          role="brand"
          selected={role}
          onSelect={setRole}
          title="Tôi là thương hiệu / doanh nghiệp"
          description="Tìm creator và chạy chiến dịch."
          icon={<Building2 className="size-6" aria-hidden />}
        />
        <RoleCard
          role="creator"
          selected={role}
          onSelect={setRole}
          title="Tôi là KOL / Creator"
          description="Kiếm tiền từ nội dung và phát triển thương hiệu cá nhân."
          icon={<Star className="size-6" aria-hidden />}
        />
      </div>

      <Card className="rounded-[2.5rem] border-primary/10 bg-background/80 p-2 shadow-[0_8px_40px_rgb(0,0,0,0.08)] backdrop-blur-xl sm:p-4">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
          <CardDescription>Mật khẩu tối thiểu 8 ký tự.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4" noValidate>
            <input type="hidden" name="role" value={role} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Nguyễn Văn A"
                    className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                    aria-invalid={Boolean(state.fieldErrors.fullName)}
                  />
                </div>
                {state.fieldErrors.fullName ? (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {state.fieldErrors.fullName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="su-email">Email</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="su-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ban@email.com"
                    className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                    aria-invalid={Boolean(state.fieldErrors.email)}
                  />
                </div>
                {state.fieldErrors.email ? (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {state.fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                    aria-invalid={Boolean(state.fieldErrors.password)}
                  />
                </div>
                {state.fieldErrors.password ? (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {state.fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-confirm">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <ShieldCheck
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="su-confirm"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-14 rounded-2xl border-border/50 bg-muted/30 pl-11 text-base transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20"
                    aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
                  />
                </div>
                {state.fieldErrors.confirmPassword ? (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                    {state.fieldErrors.confirmPassword}
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

            <Button type="submit" className="h-14 w-full rounded-2xl text-lg font-bold shadow-lg shadow-primary/25" disabled={isPending}>
              {isPending ? "Đang gửi…" : "Tạo tài khoản"}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Bằng cách bấm «Tạo tài khoản», bạn đồng ý với{" "}
              <Link
                href="/terms"
                className="text-[var(--color-tech-blue)] underline underline-offset-2"
              >
                Điều khoản
              </Link>{" "}
              và{" "}
              <Link
                href="/privacy"
                className="text-[var(--color-tech-blue)] underline underline-offset-2"
              >
                Chính sách quyền riêng tư
              </Link>
              .
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-foreground-muted">
        Đã có tài khoản?{" "}
        <Link
          href={AUTH_ROUTES.SIGN_IN}
          className="font-bold text-primary hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
