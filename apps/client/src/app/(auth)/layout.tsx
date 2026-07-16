import Link from "next/link";
import Image from "next/image";
import React from "react";
import { AuthScene } from "@/features/auth/components/auth-scene";
import { AUTH_ROUTES } from "@/features/auth/constants";

type AuthGroupLayoutProps = {
  children: React.ReactNode;
};

export default function AuthGroupLayout({ children }: AuthGroupLayoutProps) {
  return (
    // Solid dark bg (matching AuthScene) so overscroll never flashes the
    // light body background around the dark page.
    <div className="relative flex min-h-screen w-full flex-col" style={{ backgroundColor: "#0b1020" }}>
      <AuthScene />

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href={AUTH_ROUTES.LANDING} className="flex items-center gap-2">
          <Image src="/logo.png" alt="Hive-K" width={120} height={40} className="h-6 w-auto" priority />
        </Link>
        <Link
          href={AUTH_ROUTES.LANDING}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs font-bold text-white/60 transition-colors hover:border-white/25 hover:text-white"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            arrow_back
          </span>
          Về trang chủ
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-6 sm:px-10">
        {children}
      </main>
    </div>
  );
}
