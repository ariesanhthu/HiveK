"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  Boxes,
  ExternalLink,
  Menu,
  Network,
  Orbit,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardNavItem } from "@/features/business-dashboard/types";
import type { WorkspaceViewId } from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

type WorkspaceNavItem = {
  id: WorkspaceViewId;
  label: string;
  icon: LucideIcon;
};

export const WORKSPACE_NAV_ITEMS: readonly WorkspaceNavItem[] = [
  { id: "overview", label: "Tổng quan", icon: Boxes },
  { id: "brand", label: "Hồ sơ", icon: ShieldCheck },
  { id: "channels", label: "Kênh", icon: Network },
  { id: "satellites", label: "Vệ tinh", icon: Orbit },
  { id: "strategy", label: "Chiến lược", icon: Target },
  { id: "analytics", label: "Phân tích", icon: BarChart3 },
  { id: "studio", label: "Studio", icon: Settings2 },
] as const;

type WorkspaceHeaderProps = {
  workspaceName: string;
  websiteUrl: string;
  readinessScore: number;
  currentView: WorkspaceViewId;
  businessNavItems: DashboardNavItem[];
  agentOpen: boolean;
  onNavigate: (view: WorkspaceViewId) => void;
  onToggleAgent: () => void;
  onRestart: () => void;
};

export function WorkspaceHeader({
  workspaceName,
  websiteUrl,
  readinessScore,
  currentView,
  businessNavItems,
  agentOpen,
  onNavigate,
  onToggleAgent,
  onRestart,
}: WorkspaceHeaderProps) {
  return (
    <header className="z-20 shrink-0 border-b border-slate-200 bg-card/95 backdrop-blur">
      <div className="flex min-h-[4.5rem] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <details className="group relative md:hidden">
            <summary
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 text-foreground-muted hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
              aria-label="Mở điều hướng business"
            >
              <Menu className="size-5" aria-hidden />
            </summary>
            <nav
              aria-label="Điều hướng business"
              className="absolute left-0 top-12 z-40 max-h-[calc(100dvh_-_6rem)] w-64 overflow-y-auto rounded-2xl border border-slate-200 bg-card p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
            >
              {businessNavItems
                .filter((item) => item.href !== "#")
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={item.isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      item.isActive
                        ? "bg-primary-soft text-amber-800"
                        : "text-foreground-muted hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
            </nav>
          </details>

          <span className="hidden size-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fef3c7,#ffedd5)] text-amber-700 sm:flex">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                {workspaceName}
              </h1>
              <span
                className={cn(
                  "hidden rounded-full border px-2 py-0.5 text-[10px] font-bold sm:inline-flex",
                  readinessScore >= 80
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : readinessScore >= 50
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                )}
              >
                {readinessScore}% hoàn thiện
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-foreground-muted sm:text-xs">
              Agent workspace · dữ liệu đã điền để bạn kiểm tra
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-3 text-foreground-muted sm:h-9"
            onClick={onRestart}
            aria-label="Thiết lập lại Agent workspace"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden lg:inline">Thiết lập lại</span>
          </Button>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-card px-3 text-xs font-bold text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:inline-flex"
          >
            Mở website
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <Button
            variant={agentOpen ? "secondary" : "default"}
            size="sm"
            className="h-11 sm:h-9"
            onClick={onToggleAgent}
            aria-expanded={agentOpen}
            aria-controls="hivek-agent-sidecar"
            aria-label={agentOpen ? "Ẩn HiveK Agent" : "Mở HiveK Agent"}
          >
            <Bot className="size-4" aria-hidden />
            <span className="hidden sm:inline">{agentOpen ? "Ẩn Agent" : "Mở Agent"}</span>
          </Button>
        </div>
      </div>

      <nav
        className="overflow-x-auto overscroll-x-contain px-3 sm:px-5 lg:px-6"
        aria-label="Điều hướng Agent workspace"
      >
        <div className="flex min-w-max gap-1">
          {WORKSPACE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-2 px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                  isActive
                    ? "text-amber-800 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
