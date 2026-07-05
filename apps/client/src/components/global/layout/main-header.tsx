import React from "react";
import Link from "next/link";
import Image from "next/image";

export const MainHeader: React.FC = () => {
  return (
    <header className="fixed left-0 top-0 z-50 w-full p-4 transition-all duration-300 sm:p-6">
      <div className="nav-shell nav-shell-light">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Hive-K Logo"
              width={120}
              height={40}
              className="h-6 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/#platform" className="nav-link">
              Dịch vụ
            </Link>

            <Link href="/#influencers" className="nav-link">
              KOLs
            </Link>

            <Link href="/#campaigns" className="nav-link">
              Chiến dịch
            </Link>

            <Link href="/kol-ranking" className="nav-link">
              Xếp hạng
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="nav-search">
            <span className="material-symbols-outlined nav-search-icon">
              search
            </span>

            <input
              type="text"
              placeholder="Tìm kiếm creator..."
              className="nav-search-input"
            />
          </div>

          <Link href="/auth/sign-in" className="btn-primary">
            Bắt đầu
          </Link>
        </div>
      </div>
    </header>
  );
};
