import Link from "next/link";
import React from "react";
import { AUTH_ROUTES } from "@/features/auth/constants";

type AuthGroupLayoutProps = {
  children: React.ReactNode;
};

export default function AuthGroupLayout({ children }: AuthGroupLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-50/80 via-background-light to-background-light dark:from-slate-950 dark:via-background-dark dark:to-background-dark">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-tech-blue) 25%, transparent), transparent)",
        }}
      />
      <header className="relative z-10 border-b border-primary-soft/60 bg-card/60 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href={AUTH_ROUTES.LANDING}
            className="flex items-center gap-2 text-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-3xl font-bold">hub</span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              KOLConnect
            </span>
          </Link>
          <Link
            href={AUTH_ROUTES.LANDING}
            className="text-sm font-semibold text-foreground-muted transition-colors hover:text-primary"
          >
            Về trang chủ
          </Link>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col items-center px-4 py-10 md:py-14">
        {children}
      </div>
    </div>
  );
}
