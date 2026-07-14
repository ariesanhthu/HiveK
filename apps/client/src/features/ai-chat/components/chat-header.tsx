import Link from "next/link";
import { Menu, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import type { DashboardNavItem } from "@/features/business-dashboard/types";

type ChatHeaderProps = {
  completedSetupSteps: number;
  totalSetupSteps: number;
  showSetupProgress: boolean;
  hasConversation: boolean;
  navItems: DashboardNavItem[];
  onReset: () => void;
};

export function ChatHeader({
  completedSetupSteps,
  totalSetupSteps,
  showSetupProgress,
  hasConversation,
  navItems,
  onReset,
}: ChatHeaderProps) {
  return (
    <header className="z-10 flex h-[4.5rem] shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AgentAvatar size="sm" className="md:hidden" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="truncate text-sm font-extrabold tracking-tight text-foreground sm:text-base"
              translate="no"
            >
              HiveK AI
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-primary-soft bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:inline-flex">
              <Sparkles className="size-3" aria-hidden />
              Agent
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-foreground-muted sm:text-xs">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            Sẵn sàng đồng hành cùng bạn
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showSetupProgress ? (
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-foreground-muted sm:gap-2 sm:px-3 sm:text-xs">
            <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden />
            <span className="hidden sm:inline">Thiết lập</span>
            <span className="tabular-nums">
              {completedSetupSteps}/{totalSetupSteps}
            </span>
          </div>
        ) : null}
        {hasConversation ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-11 touch-manipulation px-3 text-foreground-muted hover:text-foreground sm:h-9"
            aria-label="Bắt đầu cuộc trò chuyện mới"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
          </Button>
        ) : null}
        <details className="group relative md:hidden">
          <summary
            className="flex size-11 cursor-pointer list-none touch-manipulation items-center justify-center rounded-xl text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
            aria-label="Mở menu business"
          >
            <Menu className="size-5" aria-hidden />
          </summary>
          <nav
            aria-label="Điều hướng business"
            className="absolute right-0 top-12 z-30 max-h-[calc(100dvh_-_5.5rem)] w-64 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-card p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
          >
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Không gian business
            </p>
            {navItems
              .filter((item) => item.href !== "#")
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    item.isActive
                      ? "bg-primary-soft text-amber-800"
                      : "text-foreground-muted hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
