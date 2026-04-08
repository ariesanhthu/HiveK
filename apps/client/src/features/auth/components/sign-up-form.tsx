"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2, Lock, Mail, ShieldCheck, Sparkles, User, CheckCircle } from "lucide-react";
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
        "flex w-full flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all bg-[#1e293b]",
        isOn
          ? "border-[#f39c12] shadow-sm"
          : "border-slate-700/60 hover:border-[#f39c12]/50 hover:shadow-sm"
      )}
    >
      <span className={cn("inline-flex items-center justify-center rounded-full w-12 h-12 mb-1", isOn ? "bg-[#f39c12]/20 text-[#f39c12]" : "bg-slate-800 text-[#f39c12]")}>
        {icon}
      </span>
      <span className="text-[15px] font-bold text-white">{title}</span>
      <span className="text-[13px] font-medium text-slate-400 leading-relaxed max-w-[200px]">{description}</span>
    </button>
  );
}

export function SignUpForm() {
  const [role, setRole] = useState<SignUpRole>("brand");
  const [state, formAction, isPending] = useActionState(submitSignUp, INITIAL);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Gia nhập Hive-K
        </h1>
        <p className="text-sm font-medium text-slate-400 max-w-[400px] mx-auto leading-relaxed">
          Chọn vai trò và hoàn tất đăng ký trên nền tảng creator economy tuyệt vời nhất.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <RoleCard
          role="brand"
          selected={role}
          onSelect={setRole}
          title="Thương hiệu / Doanh nghiệp"
          description="Tìm kiếm creator tiềm năng và chạy các chiến dịch bùng nổ."
          icon={<Building2 className="flex-shrink-0" size={20} aria-hidden />}
        />
        <RoleCard
          role="creator"
          selected={role}
          onSelect={setRole}
          title="KOL / Creator"
          description="Kiếm tiền từ tầm ảnh hưởng và phát triển thương hiệu cá nhân."
          icon={<Sparkles className="flex-shrink-0" size={20} aria-hidden />}
        />
      </div>

      <Card className="w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6 shadow-sm sm:p-10">
        <CardContent className="p-0">
          <form action={formAction} className="space-y-6" noValidate>
            <input type="hidden" name="role" value={role} />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <User size={14} className="text-[#3b82f6]" aria-hidden />
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.fullName)}
                />
                {state.fieldErrors.fullName ? (
                  <p className="text-xs text-red-500" role="alert">
                    {state.fieldErrors.fullName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-email" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <Mail size={14} className="text-[#3b82f6]" aria-hidden />
                  Email
                </Label>
                <Input
                  id="su-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="ban@email.com"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.email)}
                />
                {state.fieldErrors.email ? (
                  <p className="text-xs text-red-500" role="alert">
                    {state.fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-password" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <Lock size={14} className="text-[#3b82f6]" aria-hidden />
                  Mật khẩu
                </Label>
                <Input
                  id="su-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.password)}
                />
                {state.fieldErrors.password ? (
                  <p className="text-xs text-red-500" role="alert">
                    {state.fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-confirm" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <CheckCircle size={14} className="text-[#3b82f6]" aria-hidden />
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="su-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-none bg-[#f4f7fb] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30"
                  aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
                />
                {state.fieldErrors.confirmPassword ? (
                  <p className="text-xs text-red-500" role="alert">
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

            <div className="pt-2">
              <Button type="submit" className="mt-2 h-12 w-full rounded-lg bg-[#f39c12] text-base font-bold text-white hover:bg-[#e67e22] shadow-[0_0_20px_-5px_#f39c12] transition-colors disabled:opacity-70 disabled:hover:bg-[#f39c12]" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>
            </div>

            <p className="text-center text-[11px] text-slate-500">
              Bằng việc Tạo tài khoản, bạn đồng ý với{" "}
              <Link href="/terms" className="text-[#3b82f6] hover:underline">Điều khoản</Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-[#3b82f6] hover:underline">Quyền riêng tư</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="mt-2 text-center text-sm font-medium text-slate-400">
        Đã có tài khoản?{" "}
        <Link
          href={AUTH_ROUTES.SIGN_IN}
          className="font-bold text-[#f39c12] hover:text-[#fcd34d] hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
