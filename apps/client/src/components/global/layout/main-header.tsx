import React from "react";
import Link from "next/link";

export const MainHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-primary-soft bg-background-light/80 px-6 py-4 backdrop-blur-md dark:bg-background-dark/80 md:px-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">
              hub
            </span>
            <a href='/' className="text-xl font-extrabold tracking-tight text-foreground">
              KOLConnect
            </a>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#platform"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              Nền tảng
            </a>
            <a
              href="#influencers"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              KOLs
            </a>
            <a
              href="#campaigns"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              Chiến dịch
            </a>
            <Link
              href="/kol-ranking"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              Xếp hạng
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center rounded-xl border border-primary-soft bg-primary-soft px-3 py-1.5 sm:flex">
            <span className="material-symbols-outlined text-xl text-primary">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm creator..."
              className="w-32 border-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-0 lg:w-48"
            />
          </div>
          <Link
            href="/auth/sign-in"
            className="text-white rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-background-dark shadow-primary transition-all hover:bg-primary/90"
          >
            Bắt đầu
          </Link>
        </div>
      </div>
    </header>
  );
};

