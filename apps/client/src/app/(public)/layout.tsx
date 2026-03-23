import React from "react";
import dynamic from "next/dynamic";
import { MainHeader } from "@/components/global/layout/main-header";

const MainFooter = dynamic(
  () =>
    import("@/components/global/layout/main-footer").then((m) => ({
      default: m.MainFooter,
    })),
  {
    loading: () => (
      <footer className="border-t border-primary-soft py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-4 w-48 rounded bg-primary/5 animate-pulse" />
          <div className="mt-6 h-3 w-full max-w-md rounded bg-primary/5 animate-pulse" />
        </div>
      </footer>
    ),
    ssr: true,
  }
);

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <MainHeader />
      <main className="flex-1 pt-[72px]">{children}</main>
      <MainFooter />
    </>
  );
}

