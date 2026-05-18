import type { Metadata } from "next";
import Link from "next/link";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quên mật khẩu | Hive-K",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-primary-soft bg-card p-8 text-center shadow-lg">
      <h1 className="text-xl font-extrabold text-foreground">Khôi phục mật khẩu</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Luồng gửi email reset sẽ kết nối backend (token một lần, hết hạn có giới hạn).
      </p>
      <Link
        href={AUTH_ROUTES.SIGN_IN}
        className={cn(buttonVariants({ variant: "default" }), "mt-6 inline-flex no-underline")}
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
