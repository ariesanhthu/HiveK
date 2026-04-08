import React from "react";
import Link from "next/link";

export const MainHeader: React.FC = () => {
  return (
    <header className="fixed left-0 top-0 z-50 w-full p-4 transition-all duration-300 sm:p-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-[#1f1f1f]/70 px-6 py-3 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold drop-shadow-sm">
              hub
            </span>
            <a href='/' className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Hive-K
            </a>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/#platform"
              className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              Nền tảng
            </Link>
            <Link
              href="/#influencers"
              className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              KOLs
            </Link>
            <Link
              href="/#campaigns"
              className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              Chiến dịch
            </Link>
            <Link
              href="/kol-ranking"
              className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              Xếp hạng
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center rounded-full border border-white/5 bg-white/5 px-4 py-2 transition-colors hover:bg-white/10 sm:flex">
            <span className="material-symbols-outlined mr-2 text-lg text-zinc-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm creator..."
              className="w-32 border-none bg-transparent text-sm text-zinc-200 placeholder:text-white/50 focus:outline-none focus:ring-0 lg:w-48"
            />
          </div>
          <Link
            href="/auth/sign-in"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-background-dark shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] transition-all hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)]"
          >
            Bắt đầu
          </Link>
        </div>
      </div>
    </header>
  );
};

