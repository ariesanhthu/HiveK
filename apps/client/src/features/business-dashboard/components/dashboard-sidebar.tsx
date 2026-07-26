"use client";

import { useState } from "react";
import Link from "next/link";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { type DashboardNavItem } from "@/features/business-dashboard/types";
import type { BackendEnterpriseProfile } from "@/server/backend/backend-types";

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  enterprises?: BackendEnterpriseProfile[];
  activeEnterprise?: BackendEnterpriseProfile | null;
  onSelectEnterprise?: (enterprise: BackendEnterpriseProfile) => void;
};

export function DashboardSidebar({
  items,
  enterprises = [],
  activeEnterprise,
  onSelectEnterprise,
}: DashboardSidebarProps) {
  const [isEnterpriseDropdownOpen, setIsEnterpriseDropdownOpen] = useState(false);

  const currentEnterprise =
    activeEnterprise || (enterprises.length > 0 ? enterprises[0] : null);

  const companyName = currentEnterprise?.companyName || "Chưa có Doanh nghiệp";
  const initialLetter = currentEnterprise
    ? companyName.charAt(0).toUpperCase()
    : "D";

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-primary-soft bg-card p-4 md:flex md:flex-col">
      {/* Brand Header */}
      <Link
        href="/dashboard"
        className="mb-4 flex shrink-0 items-center gap-3 rounded-2xl outline-none ring-offset-2 ring-offset-card transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="HiveK Dashboard"
      >
        <AgentAvatar size="md" variant="friendly" showStatus={false} />
        <span className="min-w-0">
          <span className="block text-base font-extrabold leading-tight text-foreground">
            HiveK
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            Business Workspace
          </span>
        </span>
      </Link>

      {/* Enterprise Section on Sidebar */}
      <div className="mb-4 rounded-2xl border border-primary-soft bg-background-light/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
            Doanh nghiệp ({enterprises.length})
          </span>
          <Link
            href="/enterprise/setup"
            className="flex items-center gap-1 text-[11px] font-bold text-primary transition-colors hover:underline"
            title="Thêm Doanh nghiệp mới"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            Tạo mới
          </Link>
        </div>

        {currentEnterprise ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsEnterpriseDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-primary-soft bg-card p-2 text-left transition-colors hover:bg-primary-soft/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-background-dark shadow-sm">
                  {initialLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {companyName}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] text-foreground-muted">
                    {currentEnterprise.isVerified ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">check_circle</span>
                        Đã xác minh
                      </span>
                    ) : (
                      <span>Doanh nghiệp</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-base text-foreground-muted">
                {isEnterpriseDropdownOpen ? "expand_less" : "unfold_more"}
              </span>
            </button>

            {/* Multiple Enterprise Switcher Dropdown */}
            {isEnterpriseDropdownOpen ? (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-primary-soft bg-card p-1.5 shadow-xl">
                <div className="mb-1 px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                  Danh sách Doanh nghiệp của bạn
                </div>
                {enterprises.map((ent) => {
                  const isSelected = ent.id === currentEnterprise.id;
                  return (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => {
                        onSelectEnterprise?.(ent);
                        setIsEnterpriseDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary/15 font-bold text-primary"
                          : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">{ent.companyName}</span>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : null}
                    </button>
                  );
                })}

                <div className="mt-1 space-y-0.5 border-t border-primary-soft pt-1">
                  <Link
                    href="/settings/enterprise"
                    onClick={() => setIsEnterpriseDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-sm">domain</span>
                    Xem hồ sơ chi tiết
                  </Link>

                  <Link
                    href="/enterprise/setup"
                    onClick={() => setIsEnterpriseDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Tạo thêm Doanh nghiệp
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/enterprise/setup"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 p-2.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <span className="material-symbols-outlined text-base">add_business</span>
            <span>Khởi tạo Hồ sơ Doanh nghiệp</span>
          </Link>
        )}
      </div>

      {/* Main Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Menu chính
        </p>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                item.isActive
                  ? "bg-primary text-background-dark"
                  : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
              }`}
            >
              {item.id === "ai-chat" ? (
                <AgentAvatar
                  size="xs"
                  variant={item.isActive ? "action" : "friendly"}
                  showStatus={false}
                  className="border-0 bg-transparent shadow-none"
                />
              ) : (
                <span className="material-symbols-outlined text-base" aria-hidden>
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badgeCount ? (
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    item.isActive
                      ? "bg-background-dark text-on-dark"
                      : "bg-amber-100 text-amber-800"
                  }`}
                  aria-label={item.badgeLabel}
                  title={item.badgeLabel}
                >
                  {item.badgeCount > 99 ? "99+" : item.badgeCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-3 shrink-0 border-t border-primary-soft pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-xl border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-xl border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
            aria-label="Cài đặt"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
