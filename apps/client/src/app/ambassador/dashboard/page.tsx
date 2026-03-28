import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { cn } from "@/lib/utils";

export default function AmbassadorDashboardPage() {
  return (
    <main className="min-h-screen bg-background-light px-6 py-12 dark:bg-background-dark">
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-primary-soft bg-card p-8 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ambassador / KOL
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Bảng điều khiển Creator
          </h1>
          <p className="text-sm text-foreground-muted">
            Đây là workspace demo cho KOL/KOC. Kết nối API và session thật sẽ bổ sung sau.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          <Link
            href={AUTH_ROUTES.LANDING}
            className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
          >
            Về landing
          </Link>
          <Link href={AUTH_ROUTES.SIGN_IN} className={cn(buttonVariants(), "no-underline")}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
