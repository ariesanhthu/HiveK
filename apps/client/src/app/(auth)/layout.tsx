import Link from "next/link";
import React from "react";
import { AUTH_ROUTES } from "@/features/auth/constants";

type AuthGroupLayoutProps = {
  children: React.ReactNode;
};

export default function AuthGroupLayout({ children }: AuthGroupLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1c] flex flex-col font-sans">
      {/* Top right orange glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-[#f39c12] opacity-30 blur-[100px]"
        aria-hidden
      />
      {/* Bottom left blue glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#3b82f6] opacity-30 blur-[100px]"
        aria-hidden
      />
      
      <header className="relative z-10 px-8 py-5">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link
            href={AUTH_ROUTES.LANDING}
          >
            <span className="text-2xl font-extrabold tracking-tight text-[#f39c12]">
              Hive-K
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/help"
              className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
            >
              Trợ giúp
            </Link>
            <Link
              href="/support"
              className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
            >
              Hỗ trợ
            </Link>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-8 md:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-transparent py-6 text-center">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between px-8 sm:flex-row">
          <div className="mb-4 sm:mb-0 text-left">
            <p className="text-sm font-bold text-white">Hive</p>
            <p className="text-xs text-slate-400">© 2024 Hive Creator Economy. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-white">Quyền riêng tư</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-white">Điều khoản</Link>
            <Link href="/cookie" className="text-xs text-slate-400 hover:text-white">Cookie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
